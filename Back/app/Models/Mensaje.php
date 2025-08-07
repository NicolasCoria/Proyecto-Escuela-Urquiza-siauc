<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mensaje extends Model
{
    protected $table = 'mensajes';
    protected $primaryKey = 'id_mensaje';
    public $timestamps = true;

    protected $fillable = [
        'titulo',
        'contenido',
        'prioridad',
        'id_admin_creador'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relación con el administrador que creó el mensaje
     */
    public function admin_creador(): BelongsTo
    {
        return $this->belongsTo(Administrador::class, 'id_admin_creador', 'id_admin');
    }

    /**
     * Relación con los destinatarios del mensaje
     */
    public function destinatarios(): HasMany
    {
        return $this->hasMany(DestinatarioMensaje::class, 'id_mensaje', 'id_mensaje');
    }

    /**
     * Obtener el color de prioridad para la UI
     */
    public function getColorPrioridad(): string
    {
        return match($this->prioridad) {
            'baja' => 'green',
            'media' => 'blue',
            'alta' => 'orange',
            'urgente' => 'red',
            default => 'gray'
        };
    }

    /**
     * Obtener el texto de prioridad formateado
     */
    public function getPrioridadTexto(): string
    {
        return match($this->prioridad) {
            'baja' => 'Baja',
            'media' => 'Media',
            'alta' => 'Alta',
            'urgente' => 'Urgente',
            default => 'Sin prioridad'
        };
    }

    /**
     * Verificar si el mensaje es urgente
     */
    public function esUrgente(): bool
    {
        return $this->prioridad === 'urgente';
    }

    /**
     * Verificar si el mensaje es de alta prioridad
     */
    public function esAltaPrioridad(): bool
    {
        return in_array($this->prioridad, ['alta', 'urgente']);
    }
}