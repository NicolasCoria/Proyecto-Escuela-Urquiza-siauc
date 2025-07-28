<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlumnoEncuesta extends Model
{
    protected $table = 'alumno_encuesta';
    public $incrementing = false;
    public $timestamps = false;
    
    // Configurar clave primaria compuesta
    protected $primaryKey = null;

    protected $casts = [
        'id_alumno' => 'int',
        'id_encuesta' => 'int',
        'fecha_asignacion' => 'datetime',
        'notificado' => 'boolean',
        'respondida' => 'boolean',
        'fecha_respuesta' => 'datetime'
    ];

    protected $fillable = [
        'id_alumno',
        'id_encuesta',
        'fecha_asignacion',
        'notificado',
        'respondida',
        'fecha_respuesta'
    ];

    public function alumno()
    {
        return $this->belongsTo(Alumno::class, 'id_alumno');
    }

    public function encuesta()
    {
        return $this->belongsTo(Encuesta::class, 'id_encuesta');
    }
}
