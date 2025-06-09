<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class CarreraUc
 * 
 * @property int $id_carrera
 * @property int $id_uc
 * 
 * @property Carrera $carrera
 * @property UnidadCurricular $unidad_curricular
 *
 * @package App\Models
 */
class CarreraUc extends Model
{
	protected $table = 'carrera_uc';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_carrera' => 'int',
		'id_uc' => 'int'
	];

	public function carrera()
	{
		return $this->belongsTo(Carrera::class, 'id_carrera');
	}

	public function unidad_curricular()
	{
		return $this->belongsTo(UnidadCurricular::class, 'id_uc');
	}
}
