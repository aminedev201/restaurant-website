<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Get the authenticated admin's profile.
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Profile fetched successfully.',
            'data'    => Auth::user(),
        ], 200);
    }

    /**
     * Update the authenticated admin's profile.
     */
    public function update(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $data = $request->validate([
            'fullname' => ['sometimes', 'string', 'min:2', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'email'    => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone'    => ['sometimes', 'string', 'regex:/^\+?[0-9\s\-\(\)]{6,25}$/'],
            'avatar'   => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $data['avatar_path'] = upload_with_random_name($request->file('avatar'), 'avatars');
        }

        unset($data['avatar']);

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => $user->fresh(),
        ], 200);
    }

    /**
     * Change the authenticated admin's password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $request->validate([
            'current_password'  => ['required', 'string'],
            'password'          => [
                'required', 'string', 'min:8', 'max:30', 'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/',
            ],
        ], [
            'current_password.required' => 'Current password is required.',
            'password.required'         => 'New password is required.',
            'password.min'              => 'Password must be at least 8 characters.',
            'password.max'              => 'Password must be at most 30 characters.',
            'password.confirmed'        => 'Password confirmation does not match.',
            'password.regex'            => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).',
        ]);

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ], 200);
    }

    /**
     * Delete the authenticated admin's account and log out.
     */
    public function destroy(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Revoke all tokens
        $user->tokens()->delete();

        // Delete avatar
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully.',
        ], 200);
    }

    public function changeAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar'   => ['required','image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Delete avatar
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->avatar_path = upload_with_random_name($request->file('avatar'), 'avatars');

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Your avatar changed successfully.',
            'data'    => $user->fresh(),
        ], 200);
    }

    public function deleteAvatar(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Delete avatar
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->avatar_path=null;

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Your avatar deleted successfully.',
        ], 200);
    }
}
