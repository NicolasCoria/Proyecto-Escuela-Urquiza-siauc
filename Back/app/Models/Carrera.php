<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Carrera
 * 
 * @property int $id_carrera
 * @property string|null $carrera
 * @property int|null $cupo
 * 
 * @property Collection|Alumno[] $alumnos
 * @property Collection|Grado[] $grados
 * @property Collection|CarreraPlan[] $carrera_plans
 * @property Collection|CarreraUc[] $carrera_ucs
 * @property Collection|Correlatividad[] $correlatividads
 * @property Collection|Cupo[] $cupos
 * @property Collection|DocenteUc[] $docente_ucs
 * @property Collection|Inscripcion[] $inscripcions
 * @property Collection|InscripcionAspirante[] $inscripcion_aspirantes
 *
 * @package App\Models
 */
class Carrera extends Model
{
	protected $table = 'carrera';
	protected $primaryKey = 'id_carrera';
	public $timestamps = false;

	protected $casts = [
		'cupo' => 'int'
	];

	protected $fillable = [
		'carrera',
		'cupo'
	];

	public function alumnos()
	{
		return $this->belongsToMany(Alumno::class, 'alumno_carrera', 'id_carrera', 'id_alumno');
	}

	public function grados()
	{
		return $this->belongsToMany(Grado::class, 'carrera_grado', 'id_carrera', 'id_grado');
	}

	public function carrera_plans()
	{
		return $this->hasMany(CarreraPlan::class, 'id_carrera');
	}

	public function carrera_ucs()
	{
		return $this->hasMany(CarreraUc::class, 'id_carrera');
	}

	public function correlatividads()
	{
		return $this->hasMany(Correlatividad::class, 'id_carrera');
	}

	public function cupos()
	{
		return $this->hasMany(Cupo::class, 'id_carrera');
	}

	public function docente_ucs()
	{
		return $this->hasMany(DocenteUc::class, 'id_carrera');
	}

	public function inscripcions()
	{
		return $this->hasMany(Inscripcion::class, 'id_carrera');
	}

	public function inscripcion_aspirantes()
	{
		return $this->hasMany(InscripcionAspirante::class, 'id_carrera');
	}
}
