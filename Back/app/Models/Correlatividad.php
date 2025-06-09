<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Correlatividad
 * 
 * @property int $id_correlativa
 * @property int|null $id_uc
 * @property int|null $correlativa
 * @property int|null $id_carrera
 * 
 * @property Carrera|null $carrera
 * @property UnidadCurricular|null $unidad_curricular
 *
 * @package App\Models
 */
class Correlatividad extends Model
{
	protected $table = 'correlatividad';
	protected $primaryKey = 'id_correlativa';
	public $timestamps = false;

	protected $casts = [
		'id_uc' => 'int',
		'correlativa' => 'int',
		'id_carrera' => 'int'
	];

	protected $fillable = [
		'id_uc',
		'correlativa',
		'id_carrera'
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
