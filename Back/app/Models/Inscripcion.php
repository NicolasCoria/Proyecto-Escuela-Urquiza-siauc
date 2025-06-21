<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Inscripcion
 * 
 * @property int $id_inscripcion
 * @property Carbon|null $FechaHora
 * @property int|null $id_alumno
 * @property int|null $id_carrera
 * @property int|null $id_grado
 * @property int|null $id_uc
 * 
 * @property Alumno|null $alumno
 * @property Carrera|null $carrera
 * @property Grado|null $grado
 *
 * @package App\Models
 */
class Inscripcion extends Model
{
	protected $table = 'inscripcion';
	protected $primaryKey = 'id_inscripcion';
	public $timestamps = false;

	protected $casts = [
		'FechaHora' => 'datetime',
		'id_alumno' => 'int',
		'id_uc' => 'int',
		'id_carrera' => 'int',
		'id_grado' => 'int'
	];

	protected $fillable = [
		'FechaHora',
		'id_alumno',
		'id_uc',
		'id_carrera',
		'id_grado'
	];

	public function alumno()
	{
		return $this->belongsTo(Alumno::class, 'id_alumno');
	}

	public function carrera()
	{
		return $this->belongsTo(Carrera::class, 'id_carrera');
	}

	public function grado()
	{
		return $this->belongsTo(Grado::class, 'id_grado');
	}
}
