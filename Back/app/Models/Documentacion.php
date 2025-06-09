<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Documentacion
 * 
 * @property int $id_documento
 * @property string|null $nombre
 *
 * @package App\Models
 */
class Documentacion extends Model
{
	protected $table = 'documentacion';
	protected $primaryKey = 'id_documento';
	public $timestamps = false;

	protected $fillable = [
		'nombre'
	];
}
