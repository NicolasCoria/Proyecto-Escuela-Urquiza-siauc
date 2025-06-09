<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Horario
 * 
 * @property int $id_horario
 * @property string|null $dia
 * @property string|null $modulo_inicio
 * @property string|null $modulo_fin
 * @property string|null $modalidad
 * @property int|null $id_disp
 * @property int|null $id_uc
 * @property int|null $id_aula
 * @property int|null $id_grado
 * 
 * @property Aula|null $aula
 * @property Grado|null $grado
 * @property UnidadCurricular|null $unidad_curricular
 * @property Disponibilidad|null $disponibilidad
 *
 * @package App\Models
 */
class Horario extends Model
{
	protected $table = 'horario';
	protected $primaryKey = 'id_horario';
	public $timestamps = false;

	protected $casts = [
		'id_disp' => 'int',
		'id_uc' => 'int',
		'id_aula' => 'int',
		'id_grado' => 'int'
	];

	protected $fillable = [
		'dia',
		'modulo_inicio',
		'modulo_fin',
		'modalidad',
		'id_disp',
		'id_uc',
		'id_aula',
		'id_grado'
	];

	public function aula()
	{
		return $this->belongsTo(Aula::class, 'id_aula');
	}

	public function grado()
	{
		return $this->belongsTo(Grado::class, 'id_grado');
	}

	public function unidad_curricular()
	{
		return $this->belongsTo(UnidadCurricular::class, 'id_uc');
	}

	public function disponibilidad()
	{
		return $this->belongsTo(Disponibilidad::class, 'id_disp');
	}
}
