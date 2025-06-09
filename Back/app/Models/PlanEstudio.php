<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class PlanEstudio
 * 
 * @property int $id_plan
 * @property string|null $detalle
 * @property Carbon|null $fecha_inicio
 * @property Carbon|null $fecha_fin
 * 
 * @property Collection|AlumnoPlan[] $alumno_plans
 * @property Collection|CarreraPlan[] $carrera_plans
 * @property Collection|UcPlan[] $uc_plans
 *
 * @package App\Models
 */
class PlanEstudio extends Model
{
	protected $table = 'plan_estudio';
	protected $primaryKey = 'id_plan';
	public $timestamps = false;

	protected $casts = [
		'fecha_inicio' => 'datetime',
		'fecha_fin' => 'datetime'
	];

	protected $fillable = [
		'detalle',
		'fecha_inicio',
		'fecha_fin'
	];

	public function alumno_plans()
	{
		return $this->hasMany(AlumnoPlan::class, 'id_plan');
	}

	public function carrera_plans()
	{
		return $this->hasMany(CarreraPlan::class, 'id_plan');
	}

	public function uc_plans()
	{
		return $this->hasMany(UcPlan::class, 'id_plan');
	}
}
