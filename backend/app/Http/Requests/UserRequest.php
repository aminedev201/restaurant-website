<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')?->id;
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'fullname' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-Z\s]+$/',
            ],
            'email' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'phone' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'regex:/^\+?[0-9\s\-\(\)]{6,25}$/',
            ],
            ...($isUpdate ? [] : [
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'max:30',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/',
                ],
            ]),
            'status' => [
                'sometimes',
                'boolean',
            ],
            'avatar' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fullname.required' => 'Full name is required.',
            'fullname.min'      => 'Full name must be at least 2 characters.',
            'fullname.max'      => 'Full name cannot be longer than 255 characters.',
            'fullname.regex'    => 'Full name must contain only letters and spaces.',

            'email.required'    => 'Email is required.',
            'email.email'       => 'Please enter a valid email address.',
            'email.max'         => 'Email cannot be longer than 255 characters.',
            'email.unique'      => 'This email is already registered.',

            'phone.required'    => 'Phone number is required.',
            'phone.regex'       => 'Please enter a valid phone number. You may use numbers, spaces, +, -, and parentheses.',

            'password.required'  => 'Password is required.',
            'password.min'       => 'Password must be at least 8 characters.',
            'password.max'       => 'Password must be at most 30 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'password.regex'     => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).',

            'role.in'           => 'Role must be either admin or user.',

            'avatar.image'      => 'The avatar must be an image.',
            'avatar.mimes'      => 'The avatar must be a file of type: jpg, jpeg, png, webp.',
            'avatar.max'        => 'The avatar may not be greater than 2MB.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation errors.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
