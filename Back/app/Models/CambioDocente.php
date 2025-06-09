<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class CambioDocente
 * 
 * @property int $id_cambio
 * @property int|null $id_docente_anterior
 * @property int|null $id_docente_nuevo
 * 
 * @property Docente|null $docente
 *
 * @package App\Models
 */
class CambioDocente extends Model
{
	protected $table = 'cambio_docente';
	protected $primaryKey = 'id_cambio';
	public $timestamps = false;

	protected $casts = [
		'id_docente_anterior' => 'int',
		'id_docente_nuevo' => 'int'
	];

	protected $fillable = [
		'id_docente_anterior',
		'id_docente_nuevo'
	];

	public function docente()
	{
		return $this->belongsTo(Docente::class, 'id_docente_nuevo');
	}
}
