<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Aula
 * 
 * @property int $id_aula
 * @property string|null $nombre
 * @property int|null $capacidad
 * @property string|null $tipo_aula
 * 
 * @property Collection|Disponibilidad[] $disponibilidads
 * @property Collection|Examan[] $examen
 * @property Collection|Horario[] $horarios
 *
 * @package App\Models
 */
class Aula extends Model
{
	protected $table = 'aula';
	protected $primaryKey = 'id_aula';
	public $timestamps = false;

	protected $casts = [
		'capacidad' => 'int'
	];

	protected $fillable = [
		'nombre',
		'capacidad',
		'tipo_aula'
	];

	public function disponibilidads()
	{
		return $this->hasMany(Disponibilidad::class, 'id_aula');
	}

	public function examen()
	{
		return $this->hasMany(Examan::class, 'id_aula');
	}

	public function horarios()
	{
		return $this->hasMany(Horario::class, 'id_aula');
	}
}
