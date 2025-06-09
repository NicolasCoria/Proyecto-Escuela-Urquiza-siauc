<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Aspirante
 * 
 * @property int $id_aspirante
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
 * @property Collection|InscripcionAspirante[] $inscripcion_aspirantes
 *
 * @package App\Models
 */
class Aspirante extends Model
{
	protected $table = 'aspirante';
	protected $primaryKey = 'id_aspirante';
	public $timestamps = false;

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

	public function inscripcion_aspirantes()
	{
		return $this->hasMany(InscripcionAspirante::class, 'id_aspirante');
	}
}
