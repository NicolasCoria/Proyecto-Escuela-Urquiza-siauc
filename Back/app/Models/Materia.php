<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Materia
 * 
 * @property int $id_uc
 * @property string|null $nombre_materia
 *
 * @package App\Models
 */
class Materia extends Model
{
	protected $table = 'materias';
	protected $primaryKey = 'id_uc';
	public $incrementing = false;
	public $timestamps = false;

	protected $casts = [
		'id_uc' => 'int'
	];

	protected $fillable = [
		'nombre_materia'
	];
}
