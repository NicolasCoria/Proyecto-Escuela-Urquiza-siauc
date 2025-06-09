<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Disponibilidad
 * 
 * @property int $id_disp
 * @property int|null $id_uc
 * @property int|null $id_docente
 * @property int|null $id_h_p_d
 * @property int|null $id_aula
 * @property int|null $id_grado
 * @property string|null $dia
 * @property string|null $modulo_inicio
 * @property string|null $modulo_fin
 * 
 * @property UnidadCurricular|null $unidad_curricular
 * @property Docente|null $docente
 * @property HorarioPrevioDocente|null $horario_previo_docente
 * @property Aula|null $aula
 * @property Grado|null $grado
 * @property Collection|Horario[] $horarios
 *
 * @package App\Models
 */
class Disponibilidad extends Model
{
	protected $table = 'disponibilidad';
	protected $primaryKey = 'id_disp';
	public $timestamps = false;

	protected $casts = [
		'id_uc' => 'int',
		'id_docente' => 'int',
		'id_h_p_d' => 'int',
		'id_aula' => 'int',
		'id_grado' => 'int'
	];

	protected $fillable = [
		'id_uc',
		'id_docente',
		'id_h_p_d',
		'id_aula',
		'id_grado',
		'dia',
		'modulo_inicio',
		'modulo_fin'
	];

	public function unidad_curricular()
	{
		return $this->belongsTo(UnidadCurricular::class, 'id_uc');
	}

	public function docente()
	{
		return $this->belongsTo(Docente::class, 'id_docente');
	}

	public function horario_previo_docente()
	{
		return $this->belongsTo(HorarioPrevioDocente::class, 'id_h_p_d');
	}

	public function aula()
	{
		return $this->belongsTo(Aula::class, 'id_aula');
	}

	public function grado()
	{
		return $this->belongsTo(Grado::class, 'id_grado');
	}

	public function horarios()
	{
		return $this->hasMany(Horario::class, 'id_disp');
	}
}
