<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PeriodoInscripcion extends Model
{
    protected $table = 'periodos_inscripcion';
    
    protected $fillable = [
        'nombre_periodo',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'activo',
        'id_carrera',
        'id_grado'
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'activo' => 'boolean'
    ];

    public function carrera()
    {
        return $this->belongsTo(Carrera::class, 'id_carrera');
    }

    public function grado()
    {
        return $this->belongsTo(Grado::class, 'id_grado');
    }

    // Verificar si el período está activo actualmente
    public function estaActivo()
    {
        $ahora = Carbon::now();
        return $this->activo && 
               $ahora->gte($this->fecha_inicio) && 
               $ahora->lte($this->fecha_fin);
    }

    // Verificar si el período es para una carrera específica
    public function esParaCarrera($idCarrera)
    {
        return $this->id_carrera === null || $this->id_carrera == $idCarrera;
    }

    // Verificar si el período es para un grado específico
    public function esParaGrado($idGrado)
    {
        return $this->id_grado === null || $this->id_grado == $idGrado;
    }

    // Obtener el estado del período
    public function getEstado()
    {
        $ahora = Carbon::now();
        
        if (!$this->activo) {
            return 'inactivo';
        }
        
        if ($ahora->lt($this->fecha_inicio)) {
            return 'pendiente';
        }
        
        if ($ahora->gt($this->fecha_fin)) {
            return 'finalizado';
        }
        
        return 'activo';
    }

    // Obtener tiempo restante
    public function getTiempoRestante()
    {
        $ahora = Carbon::now();
        
        if ($ahora->lt($this->fecha_inicio)) {
            return $ahora->diffForHumans($this->fecha_inicio, ['parts' => 2]);
        }
        
        if ($ahora->gt($this->fecha_fin)) {
            return 'Finalizado';
        }
        
        return $ahora->diffForHumans($this->fecha_fin, ['parts' => 2]);
    }
} 