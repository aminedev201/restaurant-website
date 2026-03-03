<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'             => 'required|string|max:255',
            'logo'             => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
            'address'          => 'nullable|string|max:1000',
            'location_url'     => 'nullable|string|max:2000',
            'phones'           => 'nullable|array',
            'phones.*'         => 'required|string|max:30',
            'emails'           => 'nullable|array',
            'emails.*'         => 'required|email|max:255',
            'working_datetime' => 'nullable|json',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'   => 'Company name is required.',
            'logo.image'      => 'Logo must be an image file.',
            'logo.max'        => 'Logo may not be larger than 2MB.',
            'phones.*.string' => 'Each phone must be a valid string.',
            'emails.*.email'  => 'Each email must be a valid email address.',
        ];
    }
}
