<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class Student
 * 
 * @property int $id
 * @property string $name
 * @property string $dni
 * @property string $email
 * @property string $password
 * @property string $career
 * @property string|null $profile_photo
 * @property bool $approved
 * @property string|null $reset_password_token
 * @property bool $reset_password_used
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @package App\Models
 */
class Student extends Authenticatable
{
	use HasApiTokens, Notifiable;

	protected $table = 'students';

	protected $casts = [
		'approved' => 'bool',
		'reset_password_used' => 'bool'
	];

	protected $hidden = [
		'password',
		'reset_password_token'
	];

	protected $fillable = [
		'name',
		'dni',
		'email',
		'password',
		'career',
		'profile_photo',
		'approved',
		'reset_password_token',
		'reset_password_used'
	];
}
