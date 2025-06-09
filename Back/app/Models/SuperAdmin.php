<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class SuperAdmin
 * 
 * @property int $id
 * @property string $email
 * @property string $career
 * @property string $password
 * @property string|null $notifications
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @package App\Models
 */
class SuperAdmin extends Model
{
	protected $table = 'super_admins';

	protected $hidden = [
		'password'
	];

	protected $fillable = [
		'email',
		'career',
		'password',
		'notifications'
	];
}
