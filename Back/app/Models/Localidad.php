<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Localidad
 * 
 * @property int $id_localidad
 * @property string|null $localidad
 * 
 * @property Collection|Administrador[] $administradors
 * @property Collection|Alumno[] $alumnos
 * @property Collection|Aspirante[] $aspirantes
 * @property Collection|Bedel[] $bedels
 * @property Collection|Docente[] $docentes
 *
 * @package App\Models
 */
class Localidad extends Model
{
	protected $table = 'localidad';
	protected $primaryKey = 'id_localidad';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_localidad' => 'int'
	];

	protected $fillable = [
		'localidad'
	];

	public function administradors()
	{
		return $this->hasMany(Administrador::class, 'id_localidad');
	}

	public function alumnos()
	{
		return $this->hasMany(Alumno::class, 'id_localidad');
	}

	public function aspirantes()
	{
		return $this->hasMany(Aspirante::class, 'id_localidad');
	}

	public function bedels()
	{
		return $this->hasMany(Bedel::class, 'id_localidad');
	}

	public function docentes()
	{
		return $this->hasMany(Docente::class, 'id_localidad');
	}
}
