<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * Display a listing of all admins.
     */
    public function index(): JsonResponse
    {
        $admins = User::where('role', 'admin')
            ->where('id', '!=', Auth::id())
            ->latest()
            ->get();
        return response()->json([
            'success' => true,
            'message' => 'Admins fetched successfully.',
            'data'    => $admins,
        ], 200);
    }

    /**
     * Store a newly created admin in storage.
     */
    public function store(UserRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Force role to admin
        $data['role'] = 'admin';
        $data['email_verified_at'] = now();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $data['avatar_path'] = upload_with_random_name(
                $request->file('avatar'),
                'avatars'
            );
        }

        unset($data['avatar']);

        $admin = User::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Admin created successfully.',
            'data'    => $admin,
        ], 201);
    }

    /**
     * Display the specified admin.
     */
    public function show(User $user): JsonResponse
    {
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Admin fetched successfully.',
            'data'    => $user,
        ], 200);
    }

    /**
     * Update the specified admin in storage.
     */
    public function update(UserRequest $request, User $user): JsonResponse
    {
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin not found.',
            ], 404);
        }

        $data = $request->validated();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $data['avatar_path'] = upload_with_random_name(
                $request->file('avatar'),
                'avatars'
            );
        }

        unset($data['avatar']);

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Admin updated successfully.',
            'data'    => $user->fresh(),
        ], 200);
    }

    public function updateUserStatus(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin not found.',
            ], 404);
        }

        $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        $user->update(['status' => $request->boolean('status')]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully.',
            'data'    => $user,
        ]);
    }

    /**
     * Remove the specified admin from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin not found.',
            ], 404);
        }

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin deleted successfully.',
        ], 200);
    }

    /**
     * Delete all admins.
     */
    public function destroyAll(): JsonResponse
    {
        $admins = User::where('role', 'admin')
        ->where('id', '!=', Auth::id())
        ->get();

        foreach ($admins as $admin) {
            if ($admin->avatar_path && Storage::disk('public')->exists($admin->avatar_path)) {
                Storage::disk('public')->delete($admin->avatar_path);
            }
        }

        User::where('role', 'admin')
            ->where('id', '!=', Auth::id())
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'All admins deleted successfully.',
        ], 200);
    }

    /**
     * Delete selected admins by IDs.
     */
    public function destroySelected(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admins = User::where('role', 'admin')->whereIn('id', $request->input('ids'))->get();

        if ($admins->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No admins found for the given IDs.',
            ], 404);
        }

        foreach ($admins as $admin) {
            if ($admin->avatar_path && Storage::disk('public')->exists($admin->avatar_path)) {
                Storage::disk('public')->delete($admin->avatar_path);
            }
            $admin->delete();
        }

        return response()->json([
            'success' => true,
            'message' => count($admins) . ' admin(s) deleted successfully.',
            'deleted_count' => $admins->count(),
        ], 200);
    }

    /**
     * Change an admin's password.
     */
    public function changePassword(ChangePasswordRequest $request, User $user): JsonResponse
    {
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin not found.',
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->validated()['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ], 200);
    }
}
