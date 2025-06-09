<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class AlumnoGrado
 * 
 * @property int $id_alumno
 * @property int $id_grado
 * 
 * @property Alumno $alumno
 * @property Grado $grado
 *
 * @package App\Models
 */
class AlumnoGrado extends Model
{
	protected $table = 'alumno_grado';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_alumno' => 'int',
		'id_grado' => 'int'
	];

	public function alumno()
	{
		return $this->belongsTo(Alumno::class, 'id_alumno');
	}

	public function grado()
	{
		return $this->belongsTo(Grado::class, 'id_grado');
	}
}
