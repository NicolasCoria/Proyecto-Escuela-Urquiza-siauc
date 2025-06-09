<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class InscripcionAspirante
 * 
 * @property int $id_inscripcion
 * @property Carbon|null $fechahora
 * @property int|null $id_aspirante
 * @property int|null $id_carrera
 * @property int|null $id_grado
 * 
 * @property Aspirante|null $aspirante
 * @property Carrera|null $carrera
 * @property Grado|null $grado
 *
 * @package App\Models
 */
class InscripcionAspirante extends Model
{
	protected $table = 'inscripcion_aspirante';
	protected $primaryKey = 'id_inscripcion';
	public $timestamps = false;

	protected $casts = [
		'fechahora' => 'datetime',
		'id_aspirante' => 'int',
		'id_carrera' => 'int',
		'id_grado' => 'int'
	];

	protected $fillable = [
		'fechahora',
		'id_aspirante',
		'id_carrera',
		'id_grado'
	];

	public function aspirante()
	{
		return $this->belongsTo(Aspirante::class, 'id_aspirante');
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
