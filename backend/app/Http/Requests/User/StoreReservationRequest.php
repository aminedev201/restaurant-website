<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date'             => ['required', 'date', 'after_or_equal:today'],
            'time'             => ['required', 'date_format:H:i'],
            'guests'           => ['required', 'integer', 'min:1', 'max:4'],
            'special_requests' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required'          => 'Please select a reservation date.',
            'date.after_or_equal'    => 'Reservation date must be today or in the future.',
            'time.required'          => 'Please select a reservation time.',
            'time.date_format'       => 'Time must be in HH:MM format.',
            'guests.required'        => 'Please specify the number of guests.',
            'guests.min'             => 'At least 1 guest is required.',
            'guests.max'             => 'Maximum 4 guests allowed per reservation.',
            'special_requests.max'   => 'Special requests may not exceed 500 characters.',
        ];
    }
}
