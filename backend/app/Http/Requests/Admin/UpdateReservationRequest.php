<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date'             => ['sometimes', 'date', 'after_or_equal:today'],
            'time'             => ['sometimes', 'date_format:H:i'],
            'guests'           => ['sometimes', 'integer', 'min:1', 'max:4'],
            'status'           => ['sometimes', Rule::in(['pending', 'confirmed', 'canceled'])],
            'special_requests' => ['nullable', 'string', 'max:500'],
        ];
    }
}
