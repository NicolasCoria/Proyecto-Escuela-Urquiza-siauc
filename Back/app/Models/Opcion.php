<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Opcion extends Model
{
    protected $table = 'opcion';
    protected $primaryKey = 'id_opcion';
    protected $fillable = [
        'id_pregunta', 'texto', 'valor'
    ];

    public function pregunta()
    {
        return $this->belongsTo(Pregunta::class, 'id_pregunta');
    }
} 