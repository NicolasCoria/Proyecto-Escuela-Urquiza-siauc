<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DestinatarioMensaje extends Model
{
    protected $table = 'destinatarios_mensaje';
    protected $primaryKey = 'id_destinatario';
    public $timestamps = true;

    protected $fillable = [
        'id_mensaje',
        'id_alumno',
        'leido',
        'fecha_lectura'
    ];

    protected $casts = [
        'leido' => 'boolean',
        'fecha_lectura' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relación con el mensaje
     */
    public function mensaje(): BelongsTo
    {
        return $this->belongsTo(Mensaje::class, 'id_mensaje', 'id_mensaje');
    }

    /**
     * Relación con el alumno destinatario
     */
    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class, 'id_alumno', 'id_alumno');
    }

    /**
     * Marcar como leído
     */
    public function marcarComoLeido(): void
    {
        $this->update([
            'leido' => true,
            'fecha_lectura' => now()
        ]);
    }

    /**
     * Verificar si el mensaje ha sido leído
     */
    public function haSidoLeido(): bool
    {
        return $this->leido;
    }

    /**
     * Obtener el tiempo transcurrido desde la lectura
     */
    public function getTiempoDesdeLectura(): ?string
    {
        if (!$this->fecha_lectura) {
            return null;
        }

        $diferencia = now()->diff($this->fecha_lectura);
        
        if ($diferencia->days > 0) {
            return $diferencia->days . ' día(s)';
        } elseif ($diferencia->h > 0) {
            return $diferencia->h . ' hora(s)';
        } elseif ($diferencia->i > 0) {
            return $diferencia->i . ' minuto(s)';
        } else {
            return 'Hace un momento';
        }
    }
}