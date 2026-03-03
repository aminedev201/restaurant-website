<?php

namespace App\Services;

use App\Models\User;

class UserDTO
{
    /**
     * Format a single user
     */
    static public  function format(User $user): array
    {
        return [
            'id'                    => $user->id,
            'fullname'              => $user->fullname,
            'email'                 => $user->email,
            'phone'                 => $user->phone,
            'avatar_url'            => $user->avatar_url,
            'status'                => $user->status,
            'role'                  => $user->role,
            'email_verified_at'     => $user->email_verified_at,
            'created_at'            => $user->created_at,
            'updated_at'            => $user->updated_at,
        ];
    }

    /**
     * Format multiple users
     */
    static public  function formatAll($users): array
    {
        return $users->map(fn ($user) => $this->format($user))->toArray();
    }
}
