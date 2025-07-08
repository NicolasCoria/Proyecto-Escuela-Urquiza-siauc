<?php

namespace App\Http\Controllers;

use App\Models\PlantillaInforme;
use Illuminate\Http\Request;

class PlantillaInformeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $plantillas = PlantillaInforme::all();
        return response()->json($plantillas);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'campos_configurables' => 'required|array',
        ]);

        $plantilla = PlantillaInforme::create([
            'nombre' => $validated['nombre'],
            'campos_configurables' => $validated['campos_configurables'],
        ]);

        return response()->json($plantilla, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PlantillaInforme $plantillaInforme)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PlantillaInforme $plantillaInforme)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'campos_configurables' => 'required|array',
        ]);

        $plantilla = PlantillaInforme::findOrFail($id);
        $plantilla->update([
            'nombre' => $validated['nombre'],
            'campos_configurables' => $validated['campos_configurables'],
        ]);

        return response()->json($plantilla);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $plantilla = PlantillaInforme::findOrFail($id);
        $plantilla->delete();
        return response()->json(['success' => true]);
    }
}
