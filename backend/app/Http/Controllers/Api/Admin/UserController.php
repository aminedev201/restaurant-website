<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get all users with role = 'user'.
     */
    public function index(): JsonResponse
    {
        $users = User::where('role', 'user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    /**
     * Toggle a user's status (active / inactive).
     */
   public function updateUserStatus(Request $request, User $user): JsonResponse
{
    // Ensure the target is a regular user, not an admin
    if ($user->role !== 'user') {
        return response()->json([
            'success' => false,
            'message' => 'Action not allowed on admin accounts.',
        ], 403);
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
}
