<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResendVerificationRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Services\UserDTO;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request)
    {
        try {
            $user = User::create([
                'fullname' => $request->fullname,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
            ]);

            // Trigger email verification
            event(new Registered($user));

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please check your email to verify your account.',
                'data' => [
                    'user' => UserDTO::format($user)
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request)
    {
        try {
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $user = User::where('email', $request->email)->firstOrFail();

            if (!$user->hasVerifiedEmail()) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Please verify your email address before logging in.',
                    'email_verified' => false
                ], 403);
            }

            if (!$user->isActive()) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated. Please contact support.'
                ], 403);
            }

            $remember = $request->input('remember', false);
            $tokenName = $remember ? 'auth_token_remember' : 'auth_token';
            $expiresAt = $remember ? now()->addDays(30) : now()->addHours(24);

            if ($remember) {
                $user->forceFill([
                    'remember_token' => Str::random(60)
                ])->save();
            }

            $token = $user->createToken($tokenName, ['*'], $expiresAt)->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => UserDTO::format($user),
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'expires_at' => $expiresAt->toDateTimeString(),
                    'remember' => $remember,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify email
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        try {
            // Check if signature is valid
            if (!$request->hasValidSignature()) {
                return view('emails.verification-failed', [
                    'message' => 'Invalid or expired verification link',
                    'type' => 'expired'
                ]);
            }

            $user = User::findOrFail($id);

            if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
                return view('emails.verification-failed', [
                    'message' => 'Invalid verification link',
                    'type' => 'invalid'
                ]);
            }

            if ($user->hasVerifiedEmail()) {
                return view('emails.verification-success', [
                    'message' => 'Your email is already verified',
                    'already_verified' => true
                ]);
            }

            $user->markEmailAsVerified();

            return view('emails.verification-success', [
                'message' => 'Email verified successfully! You can now login.',
                'already_verified' => false
            ]);

        } catch (\Exception $e) {
            return view('emails.verification-failed', [
                'message' => 'Something went wrong. Please try again.',
                'type' => 'error'
            ]);
        }
    }

    /**
     * Resend email verification
     */
    public function resendVerificationEmail(ResendVerificationRequest $request)
    {
        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email already verified'
                ], 400);
            }

            $user->sendEmailVerificationNotification();

            return response()->json([
                'success' => true,
                'message' => 'Verification email sent successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        try {
            $status = Password::sendResetLink(
                $request->only('email')
            );

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'success' => true,
                    'message' => 'Password reset link sent to your email address'
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Unable to send reset link. Please try again.'
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send password reset link',
                'error' => $e->getMessage()
            ], 500);
        }
    }

     /**
     * Validate password reset token
     */
    public function validateResetToken(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string',
                'email' => 'required|email'
            ]);

            // Check if user exists
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired reset token',
                    'valid' => false
                ], 404);
            }

            // Check if token exists and is valid
            $passwordReset = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->first();

            if (!$passwordReset) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired reset token',
                    'valid' => false
                ], 400);
            }

            // Verify the token
            if (!Hash::check($request->token, $passwordReset->token)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid reset token',
                    'valid' => false
                ], 400);
            }

            // Check if token is expired (default is 60 minutes)
            $expiry = config('auth.passwords.users.expire', 60);
            $createdAt = \Carbon\Carbon::parse($passwordReset->created_at);

            if ($createdAt->addMinutes($expiry)->isPast()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reset token has expired',
                    'valid' => false
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Token is valid',
                'valid' => true
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate token',
                'valid' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset password
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        try {
            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ])->setRememberToken(Str::random(60));

                    $user->save();

                    event(new PasswordReset($user));
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'success' => true,
                    'message' => 'Password has been reset successfully. You can now login with your new password.'
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => __($status)
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Check email verification status
     */
    public function checkVerificationStatus(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to check verification status',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'email_verified' => $user->hasVerifiedEmail(),
                    'email_verified_at' => $user->email_verified_at,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check verification status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
