<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => [
                'required',
                'regex:/^\d{7,8}@terciariourquiza\.edu\.ar$/i'
            ]
        ];
    }

    public function messages()
    {
        return [
            'email.required' => 'El email es obligatorio.',
            'email.regex' => 'El formato del email debe ser DNI@terciariourquiza.edu.ar.'
        ];
    }
}