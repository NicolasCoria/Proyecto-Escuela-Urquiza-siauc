<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class DocenteUc
 * 
 * @property int $id
 * @property int $id_docente
 * @property int $id_uc
 * @property int $id_carrera
 * @property int $id_grado
 * 
 * @property Docente $docente
 * @property UnidadCurricular $unidad_curricular
 * @property Carrera $carrera
 * @property Grado $grado
 *
 * @package App\Models
 */
class DocenteUc extends Model
{
	protected $table = 'docente_uc';
	public $timestamps = false;

	protected $casts = [
		'id_docente' => 'int',
		'id_uc' => 'int',
		'id_carrera' => 'int',
		'id_grado' => 'int'
	];

	protected $fillable = [
		'id_docente',
		'id_uc',
		'id_carrera',
		'id_grado'
	];

	public function docente()
	{
		return $this->belongsTo(Docente::class, 'id_docente');
	}

	public function unidad_curricular()
	{
		return $this->belongsTo(UnidadCurricular::class, 'id_uc');
	}

	public function carrera()
	{
		return $this->belongsTo(Carrera::class, 'id_carrera');
	}

	public function grado()
	{
		return $this->belongsTo(Grado::class, 'id_grado');
	}
}
