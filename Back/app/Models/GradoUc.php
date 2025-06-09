<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class GradoUc
 * 
 * @property int $id_grado
 * @property int $id_uc
 * 
 * @property UnidadCurricular $unidad_curricular
 * @property Grado $grado
 *
 * @package App\Models
 */
class GradoUc extends Model
{
	protected $table = 'grado_uc';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_grado' => 'int',
		'id_uc' => 'int'
	];

	public function unidad_curricular()
	{
		return $this->belongsTo(UnidadCurricular::class, 'id_uc');
	}

	public function grado()
	{
		return $this->belongsTo(Grado::class, 'id_grado');
	}
}
