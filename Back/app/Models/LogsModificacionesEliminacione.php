<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class LogsModificacionesEliminacione
 * 
 * @property int $id_log
 * @property string $accion
 * @property string $usuario
 * @property Carbon $fecha_accion
 * @property string|null $detalles
 *
 * @package App\Models
 */
class LogsModificacionesEliminacione extends Model
{
	protected $table = 'logs_modificaciones_eliminaciones';
	protected $primaryKey = 'id_log';
	public $timestamps = false;

	protected $casts = [
		'fecha_accion' => 'datetime'
	];

	protected $fillable = [
		'accion',
		'usuario',
		'fecha_accion',
		'detalles'
	];
}
