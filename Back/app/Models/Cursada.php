<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Cursada
 * 
 * @property int $id_cursada
 * @property Carbon $inicio
 * @property Carbon $fin
 *
 * @package App\Models
 */
class Cursada extends Model
{
	protected $table = 'cursada';
	protected $primaryKey = 'id_cursada';
	public $timestamps = false;

	protected $casts = [
		'inicio' => 'datetime',
		'fin' => 'datetime'
	];

	protected $fillable = [
		'inicio',
		'fin'
	];
}
