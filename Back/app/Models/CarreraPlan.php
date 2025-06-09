<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class CarreraPlan
 * 
 * @property int $id_plan
 * @property int $id_carrera
 * 
 * @property PlanEstudio $plan_estudio
 * @property Carrera $carrera
 *
 * @package App\Models
 */
class CarreraPlan extends Model
{
	protected $table = 'carrera_plan';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_plan' => 'int',
		'id_carrera' => 'int'
	];

	public function plan_estudio()
	{
		return $this->belongsTo(PlanEstudio::class, 'id_plan');
	}

	public function carrera()
	{
		return $this->belongsTo(Carrera::class, 'id_carrera');
	}
}
