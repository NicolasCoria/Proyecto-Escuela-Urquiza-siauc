<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class AlumnoPlan
 * 
 * @property int $id_plan
 * @property int $id_alumno
 * 
 * @property PlanEstudio $plan_estudio
 * @property Alumno $alumno
 *
 * @package App\Models
 */
class AlumnoPlan extends Model
{
	protected $table = 'alumno_plan';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_plan' => 'int',
		'id_alumno' => 'int'
	];

	public function plan_estudio()
	{
		return $this->belongsTo(PlanEstudio::class, 'id_plan');
	}

	public function alumno()
	{
		return $this->belongsTo(Alumno::class, 'id_alumno');
	}
}
