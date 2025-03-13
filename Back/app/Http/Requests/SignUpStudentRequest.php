<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SignUpStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'name' => 'required|string|regex:/^[a-zA-Z\s]+$/|max:55',
            'dni' => 'required|numeric|min:1000000|max:90000000',
            'email' => [
                'required',
                'regex:/^\d{7,8}@terciariourquiza\.edu\.ar$/i',
                'unique:students,email',
            ],
            'password' => ['required', 'regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/'],
            'career' => 'required|in:AF,DS,ITI',
        ];
    }


    public function messages()
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.regex' => 'Solo se permiten letras en el nombre.',
            'name.max' => 'El nombre no debe exceder los 55 caracteres.',
            'dni.required' => 'El DNI es obligatorio.',
            'dni.min' => 'El DNI debe tener un minimo de 7 digitos',
            'dni.max' => 'El DNI debe ser inferior  a 8 digitos',
            'dni.numeric' => 'El DNI solo puede contener numeros',
            'email.unique' => 'El email ya se encuentra registrado.',
            'email.required' => 'El email es obligatorio.',
            'email.regex' => 'El formato del email debe ser DNI@terciariourquiza.edu.ar.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.regex' => 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, minúscula y un número.',
            'career.required' => 'La carrera es obligatoria',
            'profile_photo.image' => 'La foto de perfil debe ser una imagen.',
            'profile_photo.mimes' => 'La foto de perfil debe estar en formato jpeg, png, jpg, gif.',
            'profile_photo.max' => 'La foto de perfil no debe superar 2 mb.',
        ];
    }
}
