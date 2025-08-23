<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlantillaInforme extends Model
{
    use HasFactory;

    protected $table = 'plantillas_informe';

    protected $fillable = [
        'nombre',
        'campos_configurables',
        'admin_id',
        'descripcion',
    ];

    protected $casts = [
        'campos_configurables' => 'array',
    ];
}
