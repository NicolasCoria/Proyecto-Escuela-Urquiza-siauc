<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class AlumnoCarrera
 * 
 * @property int $id_alumno
 * @property int $id_carrera
 * 
 * @property Alumno $alumno
 * @property Carrera $carrera
 *
 * @package App\Models
 */
class AlumnoCarrera extends Model
{
	protected $table = 'alumno_carrera';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_alumno' => 'int',
		'id_carrera' => 'int'
	];

	public function alumno()
	{
		return $this->belongsTo(Alumno::class, 'id_alumno');
	}

	public function carrera()
	{
		return $this->belongsTo(Carrera::class, 'id_carrera');
	}
}
