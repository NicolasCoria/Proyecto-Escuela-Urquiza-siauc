<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Examan
 * 
 * @property int $id_examen
 * @property Carbon|null $fecha
 * @property Carbon|null $hora
 * @property int|null $id_aula
 * @property int|null $id_docente
 * @property int|null $id_uc
 * 
 * @property UnidadCurricular|null $unidad_curricular
 * @property Docente|null $docente
 * @property Aula|null $aula
 *
 * @package App\Models
 */
class Examan extends Model
{
	protected $table = 'examen';
	protected $primaryKey = 'id_examen';
	public $timestamps = false;

	protected $casts = [
		'fecha' => 'datetime',
		'hora' => 'datetime',
		'id_aula' => 'int',
		'id_docente' => 'int',
		'id_uc' => 'int'
	];

	protected $fillable = [
		'fecha',
		'hora',
		'id_aula',
		'id_docente',
		'id_uc'
	];

	public function unidad_curricular()
	{
		return $this->belongsTo(UnidadCurricular::class, 'id_uc');
	}

	public function docente()
	{
		return $this->belongsTo(Docente::class, 'id_docente');
	}

	public function aula()
	{
		return $this->belongsTo(Aula::class, 'id_aula');
	}
}
