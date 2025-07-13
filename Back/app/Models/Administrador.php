<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class Administrador
 * 
 * @property int $id_admin
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
class Administrador extends Model
{
	protected $table = 'administrador';
	protected $primaryKey = 'id_admin';
	public $timestamps = false;
	use HasApiTokens;

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
		'password',
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
