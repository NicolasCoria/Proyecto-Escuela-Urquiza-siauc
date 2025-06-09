<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class AlumnoUc
 * 
 * @property int $id_alumno
 * @property int $id_uc
 * 
 * @property UnidadCurricular $unidad_curricular
 * @property Alumno $alumno
 *
 * @package App\Models
 */
class AlumnoUc extends Model
{
	protected $table = 'alumno_uc';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_alumno' => 'int',
		'id_uc' => 'int'
	];

	public function unidad_curricular()
	{
		return $this->belongsTo(UnidadCurricular::class, 'id_uc');
	}

	public function alumno()
	{
		return $this->belongsTo(Alumno::class, 'id_alumno');
	}
}
