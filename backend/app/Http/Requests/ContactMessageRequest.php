<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Your name is required.',
            'email.required'   => 'Your email address is required.',
            'email.email'      => 'Please provide a valid email address.',
            'subject.required' => 'A subject is required.',
            'message.required' => 'Please enter your message.',
            'message.max'      => 'Message may not exceed 5000 characters.',
        ];
    }
}
