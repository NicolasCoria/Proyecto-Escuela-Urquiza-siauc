<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Grado
 * 
 * @property int $id_grado
 * @property int|null $grado
 * @property int|null $division
 * @property string|null $detalle
 * @property int|null $capacidad
 * 
 * @property Collection|Alumno[] $alumnos
 * @property Collection|Carrera[] $carreras
 * @property Collection|Disponibilidad[] $disponibilidads
 * @property Collection|DocenteUc[] $docente_ucs
 * @property Collection|GradoUc[] $grado_ucs
 * @property Collection|Horario[] $horarios
 * @property Collection|Inscripcion[] $inscripcions
 * @property Collection|InscripcionAspirante[] $inscripcion_aspirantes
 *
 * @package App\Models
 */
class Grado extends Model
{
	protected $table = 'grado';
	protected $primaryKey = 'id_grado';
	public $timestamps = false;

	protected $casts = [
		'grado' => 'int',
		'division' => 'int',
		'capacidad' => 'int'
	];

	protected $fillable = [
		'grado',
		'division',
		'detalle',
		'capacidad'
	];

	public function alumnos()
	{
		return $this->belongsToMany(Alumno::class, 'alumno_grado', 'id_grado', 'id_alumno');
	}

	public function carreras()
	{
		return $this->belongsToMany(Carrera::class, 'carrera_grado', 'id_grado', 'id_carrera');
	}

	public function disponibilidads()
	{
		return $this->hasMany(Disponibilidad::class, 'id_grado');
	}

	public function docente_ucs()
	{
		return $this->hasMany(DocenteUc::class, 'id_grado');
	}

	public function grado_ucs()
	{
		return $this->hasMany(GradoUc::class, 'id_grado');
	}

	public function horarios()
	{
		return $this->hasMany(Horario::class, 'id_grado');
	}

	public function inscripcions()
	{
		return $this->hasMany(Inscripcion::class, 'id_grado');
	}

	public function inscripcion_aspirantes()
	{
		return $this->hasMany(InscripcionAspirante::class, 'id_grado');
	}
}
