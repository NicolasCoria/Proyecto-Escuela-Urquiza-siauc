<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Bedel
 * 
 * @property int $id_bedel
 * @property int|null $DNI
 * @property string|null $nombre
 * @property string|null $apellido
 * @property string|null $email
 * @property string|null $telefono
 * @property string|null $genero
 * @property Carbon|null $fecha_nac
 * @property string|null $nacionalidad
 * @property string|null $direccion
 * @property int|null $id_localidad
 * 
 * @property Localidad|null $localidad
 *
 * @package App\Models
 */
class Bedel extends Model
{
	protected $table = 'bedel';
	protected $primaryKey = 'id_bedel';
	public $timestamps = false;

	protected $casts = [
		'DNI' => 'int',
		'fecha_nac' => 'datetime',
		'id_localidad' => 'int'
	];

	protected $fillable = [
		'DNI',
		'nombre',
		'apellido',
		'email',
		'telefono',
		'genero',
		'fecha_nac',
		'nacionalidad',
		'direccion',
		'id_localidad'
	];

	public function localidad()
	{
		return $this->belongsTo(Localidad::class, 'id_localidad');
	}
}
