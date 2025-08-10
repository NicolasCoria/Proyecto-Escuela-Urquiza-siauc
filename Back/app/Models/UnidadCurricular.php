<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UnidadCurricular
 * 
 * @property int $id_uc
 * @property string|null $unidad_curricular
 * @property string|null $tipo
 * @property int|null $horas_sem
 * @property int|null $horas_anual
 * @property string|null $formato
 * 
 * @property Collection|AlumnoUc[] $alumno_ucs
 * @property Collection|Asistencium[] $asistencia
 * @property Collection|CarreraUc[] $carrera_ucs
 * @property Collection|Correlatividad[] $correlatividads
 * @property Collection|Disponibilidad[] $disponibilidads
 * @property Collection|DocenteUc[] $docente_ucs
 * @property Collection|Examan[] $examen
 * @property Collection|GradoUc[] $grado_ucs
 * @property Collection|Horario[] $horarios
 * @property Collection|UcPlan[] $uc_plans
 *
 * @package App\Models
 */
class UnidadCurricular extends Model
{
	protected $table = 'unidad_curricular';
	protected $primaryKey = 'id_uc';
	public $timestamps = false;

	protected $casts = [
		'HorasSem' => 'int',
		'HorasAnual' => 'int'
	];

	protected $fillable = [
		'Unidad_Curricular',
		'Tipo',
		'HorasSem',
		'HorasAnual',
		'Formato'
	];

	// Accessor para mantener compatibilidad con código existente
	public function getUnidadCurricularAttribute()
	{
		return $this->attributes['Unidad_Curricular'] ?? null;
	}

	public function getNombreAttribute()
	{
		return $this->attributes['Unidad_Curricular'] ?? null;
	}

	public function alumno_ucs()
	{
		return $this->hasMany(AlumnoUc::class, 'id_uc');
	}

	public function asistencia()
	{
		return $this->hasMany(Asistencium::class, 'id_uc');
	}

	public function carrera_ucs()
	{
		return $this->hasMany(CarreraUc::class, 'id_uc');
	}

	public function correlatividads()
	{
		return $this->hasMany(Correlatividad::class, 'id_uc');
	}

	public function disponibilidads()
	{
		return $this->hasMany(Disponibilidad::class, 'id_uc');
	}

	public function docente_ucs()
	{
		return $this->hasMany(DocenteUc::class, 'id_uc');
	}

	public function examen()
	{
		return $this->hasMany(Examan::class, 'id_uc');
	}

	public function grado_ucs()
	{
		return $this->hasMany(GradoUc::class, 'id_uc');
	}

	public function horarios()
	{
		return $this->hasMany(Horario::class, 'id_uc');
	}

	public function uc_plans()
	{
		return $this->hasMany(UcPlan::class, 'id_uc');
	}
}
