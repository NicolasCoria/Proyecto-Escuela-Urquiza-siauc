<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class Alumno
 * 
 * @property int $id_alumno
 * @property int|null $DNI
 * @property string|null $nombre
 * @property string|null $apellido
 * @property string|null $email
 * @property string|null $telefono
 * @property string|null $genero
 * @property Carbon|null $fecha_nac
 * @property string|null $nacionalidad
 * @property string|null $direccion
 * @property int|null $id_localidad
 * 
 * @property Localidad|null $localidad
 * @property Collection|Carrera[] $carreras
 * @property Collection|Grado[] $grados
 * @property Collection|AlumnoPlan[] $alumno_plans
 * @property Collection|AlumnoUc[] $alumno_ucs
 * @property Collection|Asistencium[] $asistencia
 * @property Collection|Inscripcion[] $inscripcions
 *
 * @package App\Models
 */
class Alumno extends Model
{
	protected $table = 'alumno';
	protected $primaryKey = 'id_alumno';
	public $timestamps = false;
	use HasApiTokens;

	protected $casts = [
		'DNI' => 'int',
		'fecha_nac' => 'datetime',
		'id_localidad' => 'int'
	];

	protected $fillable = [
		'DNI',
		'nombre',
		'apellido',
		'email',
		'telefono',
		'genero',
		'fecha_nac',
		'nacionalidad',
		'direccion',
		'id_localidad'
	];

	public function localidad()
	{
		return $this->belongsTo(Localidad::class, 'id_localidad');
	}

	public function carreras()
	{
		return $this->belongsToMany(Carrera::class, 'alumno_carrera', 'id_alumno', 'id_carrera');
	}

	public function grados()
	{
		return $this->belongsToMany(Grado::class, 'alumno_grado', 'id_alumno', 'id_grado');
	}

	public function alumno_plans()
	{
		return $this->hasMany(AlumnoPlan::class, 'id_alumno');
	}

	public function alumno_ucs()
	{
		return $this->hasMany(AlumnoUc::class, 'id_alumno');
	}

	public function asistencia()
	{
		return $this->hasMany(Asistencium::class, 'id_alumno');
	}

	public function inscripcions()
	{
		return $this->hasMany(Inscripcion::class, 'id_alumno');
	}

	public function alumno_carreras()
	{
		return $this->hasMany(\App\Models\AlumnoCarrera::class, 'id_alumno');
	}

	public function alumno_grados()
	{
		return $this->hasMany(\App\Models\AlumnoGrado::class, 'id_alumno');
	}
}
