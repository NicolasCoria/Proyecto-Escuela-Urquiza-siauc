<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentProfile extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'profile_photo' => ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048']
        ];
    }

    public function messages()
    {
        return [
            'profile_photo.image' => 'La foto de perfil debe ser una imagen.',
            'profile_photo.mimes' => 'La foto de perfil debe estar en formato jpeg, png, jpg, gif.',
            'profile_photo.max' => 'La foto de perfil no debe superar 2 mb.',
        ];
    }
}
