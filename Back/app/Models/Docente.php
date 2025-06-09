<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Docente
 * 
 * @property int $id_docente
 * @property int|null $DNI
 * @property string|null $nombre
 * @property string|null $apellido
 * @property string|null $email
 * @property string|null $telefono
 * @property string|null $genero
 * @property Carbon|null $fecha_nac
 * @property string|null $direccion
 * @property int|null $id_localidad
 * @property bool $estado
 * @property string $ExpProfecional
 * @property int|null $DispHoraria
 * @property string|null $estudios
 * 
 * @property Localidad|null $localidad
 * @property Collection|CambioDocente[] $cambio_docentes
 * @property Collection|Disponibilidad[] $disponibilidads
 * @property Collection|DocenteUc[] $docente_ucs
 * @property Collection|Examan[] $examen
 * @property Collection|HorarioPrevioDocente[] $horario_previo_docentes
 *
 * @package App\Models
 */
class Docente extends Model
{
	protected $table = 'docente';
	protected $primaryKey = 'id_docente';
	public $timestamps = false;

	protected $casts = [
		'DNI' => 'int',
		'fecha_nac' => 'datetime',
		'id_localidad' => 'int',
		'estado' => 'bool',
		'DispHoraria' => 'int'
	];

	protected $fillable = [
		'DNI',
		'nombre',
		'apellido',
		'email',
		'telefono',
		'genero',
		'fecha_nac',
		'direccion',
		'id_localidad',
		'estado',
		'ExpProfecional',
		'DispHoraria',
		'estudios'
	];

	public function localidad()
	{
		return $this->belongsTo(Localidad::class, 'id_localidad');
	}

	public function cambio_docentes()
	{
		return $this->hasMany(CambioDocente::class, 'id_docente_nuevo');
	}

	public function disponibilidads()
	{
		return $this->hasMany(Disponibilidad::class, 'id_docente');
	}

	public function docente_ucs()
	{
		return $this->hasMany(DocenteUc::class, 'id_docente');
	}

	public function examen()
	{
		return $this->hasMany(Examan::class, 'id_docente');
	}

	public function horario_previo_docentes()
	{
		return $this->hasMany(HorarioPrevioDocente::class, 'id_docente');
	}
}
