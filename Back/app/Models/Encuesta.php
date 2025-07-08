<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Encuesta extends Model
{
    protected $table = 'encuestas';
    protected $fillable = [
        'titulo',
        'descripcion',
        'link_google_forms',
        'creador_id',
        'fecha_creacion',
        'estado',
        'id_carrera',
    ];
    public $timestamps = false;

    public function carrera()
    {
        return $this->belongsTo(Carrera::class, 'id_carrera', 'id_carrera');
    }
} 