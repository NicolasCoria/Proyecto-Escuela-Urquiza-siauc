<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use CloudinaryLabs\CloudinaryLaravel\MediaAlly;

class Student extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, MediaAlly;


    protected $fillable = [
        'name',
        'dni',
        'email',
        'password',
        'career',
        'approved',
        'profile_photo',
        'reset_password_token',
        'reset_password_used',
    ];


    protected $hidden = [
        'password',
        'remember_token',
    ];


    protected $casts = [
        'password' => 'hashed',
    ];

}
