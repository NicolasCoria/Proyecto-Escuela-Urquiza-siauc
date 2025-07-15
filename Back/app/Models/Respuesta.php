<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Respuesta extends Model
{
    protected $table = 'respuesta';
    protected $primaryKey = 'id_respuesta';
    public $timestamps = false;
    protected $fillable = [
        'id_encuesta', 'id_pregunta', 'id_opcion', 'id_alumno', 'created_at'
    ];

    public function encuesta()
    {
        return $this->belongsTo(Encuesta::class, 'id_encuesta');
    }

    public function pregunta()
    {
        return $this->belongsTo(Pregunta::class, 'id_pregunta');
    }

    public function opcion()
    {
        return $this->belongsTo(Opcion::class, 'id_opcion');
    }

    public function alumno()
    {
        return $this->belongsTo(Alumno::class, 'id_alumno');
    }
} 