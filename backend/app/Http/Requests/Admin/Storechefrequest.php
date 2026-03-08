<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreChefRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fullname'                  => ['required', 'string', 'min:2', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'position'                  => ['required', 'string', 'min:2', 'max:255'],
            'image'                     => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'short_desc'                => ['nullable', 'string', 'max:500'],
            'status'                    => ['sometimes', 'boolean'],
            'social_media'              => ['nullable', 'array'],
            'social_media.facebook'     => ['nullable', 'url', 'max:255'],
            'social_media.instagram'    => ['nullable', 'url', 'max:255'],
            'social_media.twitter'      => ['nullable', 'url', 'max:255'],
            'social_media.youtube'      => ['nullable', 'url', 'max:255'],
            'social_media.linkedin'     => ['nullable', 'url', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'fullname.required'      => 'Full name is required.',
            'fullname.min'           => 'Full name must be at least 2 characters.',
            'fullname.max'           => 'Full name may not exceed 255 characters.',
            'fullname.regex'         => 'Full name must contain letters only.',
            'position.required'      => 'Position is required.',
            'position.min'           => 'Position must be at least 2 characters.',
            'position.max'           => 'Position may not exceed 255 characters.',
            'image.required'         => 'An image is required.',
            'image.image'            => 'The file must be an image.',
            'image.mimes'            => 'Image must be jpeg, png, jpg, or webp.',
            'image.max'              => 'Image may not exceed 2MB.',
            'short_desc.max'         => 'Short description may not exceed 500 characters.',
            'social_media.*.url'     => 'Each social media link must be a valid URL.',
            'social_media.*.max'     => 'Social media URL may not exceed 255 characters.',
        ];
    }
}