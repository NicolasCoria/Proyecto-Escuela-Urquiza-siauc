<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GruposDestinatarios extends Model
{
    use HasFactory;

    protected $table = 'grupos_destinatarios';
    protected $primaryKey = 'id_grupo';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
        'id_admin_creador',
        'activo'
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
        'activo' => 'boolean'
    ];

    // Relación con el administrador que creó el grupo
    public function admin()
    {
        return $this->belongsTo(Administrador::class, 'id_admin_creador', 'id_admin');
    }

    // Relación muchos a muchos con alumnos
    public function alumnos()
    {
        return $this->belongsToMany(
            Alumno::class,
            'grupo_destinatario_alumno',
            'id_grupo',
            'id_alumno',
            'id_grupo',
            'id_alumno'
        )->withPivot('fecha_agregado');
    }

    // Contar alumnos en el grupo
    public function getCantidadAlumnosAttribute()
    {
        return $this->alumnos()->count();
    }

    // Scope para grupos activos
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    // Scope para grupos de un admin específico
    public function scopePorAdmin($query, $idAdmin)
    {
        return $query->where('id_admin_creador', $idAdmin);
    }
}
