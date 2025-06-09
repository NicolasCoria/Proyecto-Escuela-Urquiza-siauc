<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class HorarioPrevioDocente
 * 
 * @property int $id_h_p_d
 * @property int|null $id_docente
 * @property string|null $dia
 * @property Carbon|null $hora
 * 
 * @property Docente|null $docente
 * @property Collection|Disponibilidad[] $disponibilidads
 *
 * @package App\Models
 */
class HorarioPrevioDocente extends Model
{
	protected $table = 'horario_previo_docente';
	protected $primaryKey = 'id_h_p_d';
	public $timestamps = false;

	protected $casts = [
		'id_docente' => 'int',
		'hora' => 'datetime'
	];

	protected $fillable = [
		'id_docente',
		'dia',
		'hora'
	];

	public function docente()
	{
		return $this->belongsTo(Docente::class, 'id_docente');
	}

	public function disponibilidads()
	{
		return $this->hasMany(Disponibilidad::class, 'id_h_p_d');
	}
}
