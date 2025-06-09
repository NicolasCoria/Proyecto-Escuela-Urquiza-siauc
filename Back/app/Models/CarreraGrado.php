<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class CarreraGrado
 * 
 * @property int $id_carrera
 * @property int $id_grado
 * 
 * @property Carrera $carrera
 * @property Grado $grado
 *
 * @package App\Models
 */
class CarreraGrado extends Model
{
	protected $table = 'carrera_grado';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_carrera' => 'int',
		'id_grado' => 'int'
	];

	public function carrera()
	{
		return $this->belongsTo(Carrera::class, 'id_carrera');
	}

	public function grado()
	{
		return $this->belongsTo(Grado::class, 'id_grado');
	}
}
