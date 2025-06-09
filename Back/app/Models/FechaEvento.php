<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class FechaEvento
 * 
 * @property int $id_f_evento
 * @property string|null $detalle
 * @property Carbon|null $fecha_inicio
 * @property Carbon|null $fecha_fin
 *
 * @package App\Models
 */
class FechaEvento extends Model
{
	protected $table = 'fecha_evento';
	protected $primaryKey = 'id_f_evento';
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
}
