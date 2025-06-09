<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Cupo
 * 
 * @property int $id_cupo
 * @property int|null $id_carrera
 * @property Carbon|null $ano_lectivo
 * @property int $cupos_disp
 * 
 * @property Carrera|null $carrera
 *
 * @package App\Models
 */
class Cupo extends Model
{
	protected $table = 'cupo';
	protected $primaryKey = 'id_cupo';
	public $timestamps = false;

	protected $casts = [
		'id_carrera' => 'int',
		'ano_lectivo' => 'datetime',
		'cupos_disp' => 'int'
	];

	protected $fillable = [
		'id_carrera',
		'ano_lectivo',
		'cupos_disp'
	];

	public function carrera()
	{
		return $this->belongsTo(Carrera::class, 'id_carrera');
	}
}
