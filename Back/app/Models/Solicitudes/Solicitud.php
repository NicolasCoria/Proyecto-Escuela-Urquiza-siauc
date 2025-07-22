<?php

namespace App\Models\Solicitudes;

use App\Models\Alumno;
use Illuminate\Database\Eloquent\Model;

class Solicitud extends Model
{
    protected $table = 'solicitudes';
    public $timestamps = false;
    protected $fillable = [
        'id_alumno',
        'categoria',
        'asunto',
        'mensaje',
        'estado',
        'respuesta',
        'fecha_creacion',
        'fecha_respuesta',
        'id_admin',
    ];

    public function alumno()
    {
        return $this->belongsTo(Alumno::class, 'id_alumno', 'id_alumno');
    }
} 