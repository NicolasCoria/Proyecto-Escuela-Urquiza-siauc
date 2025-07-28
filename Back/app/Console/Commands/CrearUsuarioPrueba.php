<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Alumno;
use App\Models\AlumnoCarrera;
use App\Models\AlumnoGrado;
use Illuminate\Support\Facades\Hash;

class CrearUsuarioPrueba extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'usuario:crear-prueba {--email=prueba@terciariourquiza.edu.ar} {--password=Prueba123} {--carrera=2} {--grado=1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crear un usuario de prueba con dominio educativo para testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->option('email');
        $password = $this->option('password');
        $idCarrera = $this->option('carrera');
        $idGrado = $this->option('grado');

        // Verificar que el email tenga el dominio educativo
        if (!str_ends_with($email, '@terciariourquiza.edu.ar')) {
            $this->error('El email debe tener el dominio educativo @terciariourquiza.edu.ar');
            return 1;
        }

        // Verificar si el usuario ya existe
        $alumnoExistente = Alumno::where('email', $email)->first();
        
        if ($alumnoExistente) {
            $this->warn("El usuario {$email} ya existe.");
            $this->info("ID: " . $alumnoExistente->id_alumno);
            $this->info("Nombre: " . $alumnoExistente->nombre . " " . $alumnoExistente->apellido);
            return 0;
        }

        try {
            // Crear el alumno
            $alumno = new Alumno();
            $alumno->DNI = 12345678;
            $alumno->nombre = 'Usuario';
            $alumno->apellido = 'Prueba';
            $alumno->email = $email;
            $alumno->password = Hash::make($password);
            $alumno->telefono = '1234567890';
            $alumno->genero = 'Masculino';
            $alumno->fecha_nac = '2000-01-01';
            $alumno->nacionalidad = 'Argentina';
            $alumno->direccion = 'Calle de Prueba 123';
            $alumno->id_localidad = 1;
            $alumno->save();

            $this->info("✅ Alumno creado exitosamente:");
            $this->info("ID: " . $alumno->id_alumno);
            $this->info("Email: " . $alumno->email);

            // Asignar a la carrera
            $alumnoCarrera = new AlumnoCarrera();
            $alumnoCarrera->id_alumno = $alumno->id_alumno;
            $alumnoCarrera->id_carrera = $idCarrera;
            $alumnoCarrera->fecha_inscripcion = now();
            $alumnoCarrera->save();

            $this->info("✅ Asignado a la carrera con ID: {$idCarrera}");

            // Asignar a un grado
            $alumnoGrado = new AlumnoGrado();
            $alumnoGrado->id_alumno = $alumno->id_alumno;
            $alumnoGrado->id_grado = $idGrado;
            $alumnoGrado->fecha_inscripcion = now();
            $alumnoGrado->save();

            $this->info("✅ Asignado al grado con ID: {$idGrado}");

            // Mostrar información completa
            $this->newLine();
            $this->info("📋 Información completa del usuario:");
            $this->info("=====================================");
            $this->info("ID Alumno: " . $alumno->id_alumno);
            $this->info("DNI: " . $alumno->DNI);
            $this->info("Nombre: " . $alumno->nombre . " " . $alumno->apellido);
            $this->info("Email: " . $alumno->email);
            $this->info("Teléfono: " . $alumno->telefono);
            $this->info("Género: " . $alumno->genero);
            $this->info("Fecha de nacimiento: " . $alumno->fecha_nac);
            $this->info("Nacionalidad: " . $alumno->nacionalidad);
            $this->info("Dirección: " . $alumno->direccion);
            $this->info("ID Localidad: " . $alumno->id_localidad);
            $this->info("ID Carrera: {$idCarrera}");
            $this->info("ID Grado: {$idGrado}");

            $this->newLine();
            $this->info("🎯 Credenciales para login:");
            $this->info("Email: {$email}");
            $this->info("Contraseña: {$password}");

            return 0;

        } catch (Exception $e) {
            $this->error("❌ Error al crear el usuario: " . $e->getMessage());
            return 1;
        }
    }
} 