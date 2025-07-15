<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Encuesta extends Model
{
    protected $table = 'encuesta';
    protected $primaryKey = 'id_encuesta';
    protected $fillable = [
        'titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'activa', 'id_carrera'
    ];

    public function preguntas()
    {
        return $this->hasMany(Pregunta::class, 'id_encuesta');
    }

    public function carrera()
    {
        return $this->belongsTo(Carrera::class, 'id_carrera');
    }
} 