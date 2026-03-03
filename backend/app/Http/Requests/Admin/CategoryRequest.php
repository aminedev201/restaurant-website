<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id;

        return [
            'name' => [
                'required',
                'min:2',
                'max:255',
                Rule::unique('categories', 'name')->ignore($categoryId),
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'image' => [
                $this->isMethod('POST') ? 'required' : 'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:2048',
            ],
            'status'      => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'   => 'Category name is required.',
            'name.min'        => 'Category name must be at least 2 characters.',
            'name.max'        => 'Category name may not exceed 255 characters.',
            'name.unique'     => 'This category name already exists.',
            'description.max' => 'Description may not exceed 1000 characters.',
            'image.required'  => 'An image is required.',
            'image.image'     => 'The file must be an image.',
            'image.max'       => 'Image size may not exceed 2MB.',
        ];
    }
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
