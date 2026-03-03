<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PlateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $plateId = $this->route('plate')?->id;

        return [

            'name'        => ['required', 'string', 'min:2', 'max:255'],
            'short_desc'  => ['nullable', 'string', 'max:500'],
            'desc'        => ['nullable', 'string'],
            'old_price'   => ['nullable', 'numeric', 'min:0'],
            'price'       => ['required', 'numeric', 'min:0'],
            'discount'    => ['nullable', 'integer', 'min:0', 'max:100'],
            'image'       => [
                $this->isMethod('POST') ? 'required' : 'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:2048',
                ],

            'status'      => ['required', 'boolean'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Category is required.',
            'category_id.exists'   => 'Selected category does not exist.',
            'name.required'        => 'Plate name is required.',
            'name.min'             => 'Plate name must be at least 2 characters.',
            'name.max'             => 'Plate name may not exceed 255 characters.',
            'short_desc.max'       => 'Short description may not exceed 500 characters.',
            'old_price.numeric'    => 'Old price must be a number.',
            'old_price.min'        => 'Old price must be at least 0.',
            'price.required'       => 'Price is required.',
            'price.numeric'        => 'Price must be a number.',
            'price.min'            => 'Price must be at least 0.',
            'discount.integer'     => 'Discount must be a whole number.',
            'discount.min'         => 'Discount must be at least 0%.',
            'discount.max'         => 'Discount may not exceed 100%.',
            'image.required'       => 'An image is required.',
            'image.image'          => 'The file must be an image.',
            'image.max'            => 'Image size may not exceed 2MB.',
            'status.required'      => 'Status is required.',
            'status.boolean'       => 'Status must be true or false.',
        ];
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
