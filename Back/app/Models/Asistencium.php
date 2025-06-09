<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Asistencium
 * 
 * @property int $id_asistencia
 * @property int|null $id_alumno
 * @property int|null $id_uc
 * @property string|null $asistencia
 * @property Carbon|null $fecha
 * 
 * @property Alumno|null $alumno
 * @property UnidadCurricular|null $unidad_curricular
 *
 * @package App\Models
 */
class Asistencium extends Model
{
	protected $table = 'asistencia';
	protected $primaryKey = 'id_asistencia';
	public $timestamps = false;

	protected $casts = [
		'id_alumno' => 'int',
		'id_uc' => 'int',
		'fecha' => 'datetime'
	];

	protected $fillable = [
		'id_alumno',
		'id_uc',
		'asistencia',
		'fecha'
	];

	public function alumno()
	{
		return $this->belongsTo(Alumno::class, 'id_alumno');
	}

	public function unidad_curricular()
	{
		return $this->belongsTo(UnidadCurricular::class, 'id_uc');
	}
}
