<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class UcPlan
 * 
 * @property int $id_uc
 * @property int $id_plan
 * 
 * @property UnidadCurricular $unidad_curricular
 * @property PlanEstudio $plan_estudio
 *
 * @package App\Models
 */
class UcPlan extends Model
{
	protected $table = 'uc_plan';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_uc' => 'int',
		'id_plan' => 'int'
	];

	public function unidad_curricular()
	{
		return $this->belongsTo(UnidadCurricular::class, 'id_uc');
	}

	public function plan_estudio()
	{
		return $this->belongsTo(PlanEstudio::class, 'id_plan');
	}
}
