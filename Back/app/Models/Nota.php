<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nota extends Model
{
    protected $table = 'nota';
    protected $primaryKey = 'id_nota';
    public $timestamps = false;

    protected $fillable = [
        'id_alumno',
        'id_uc',
        'nota',
        'fecha',
        'tipo',
        'observaciones',
    ];

    public function alumno()
    {
        return $this->belongsTo(Alumno::class, 'id_alumno');
    }

    public function unidadCurricular()
    {
        return $this->belongsTo(UnidadCurricular::class, 'id_uc');
    }
} 