<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pregunta extends Model
{
    protected $table = 'pregunta';
    protected $primaryKey = 'id_pregunta';
    public $timestamps = false;
    protected $fillable = [
        'id_encuesta', 'texto', 'tipo', 'orden'
    ];

    public function encuesta()
    {
        return $this->belongsTo(Encuesta::class, 'id_encuesta');
    }

    public function opciones()
    {
        return $this->hasMany(Opcion::class, 'id_pregunta');
    }
} 