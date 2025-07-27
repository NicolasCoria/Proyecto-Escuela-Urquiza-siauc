<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * Obtener FAQs para administradores
     */
    public function getAdminFaqs()
    {
        $faqs = [
            [
                'id' => 1,
                'pregunta' => '¿Cómo gestionar las solicitudes de los alumnos?',
                'respuesta' => 'En la sección "Gestión de Solicitudes" puedes ver todas las solicitudes pendientes, filtrarlas por estado o categoría, y responder a cada una. Haz clic en "Ver Detalles" para ver el contenido completo y responder.'
            ],
            [
                'id' => 2,
                'pregunta' => '¿Cómo generar informes?',
                'respuesta' => 'Ve a la sección "Informes", selecciona una plantilla (alumnos, inscripciones, rendimiento, asistencia o solicitudes), elige el formato (PDF, Excel, CSV) y aplica los filtros que necesites.'
            ],
            [
                'id' => 3,
                'pregunta' => '¿Cómo cambiar el estado de una solicitud?',
                'respuesta' => 'Al responder una solicitud, puedes cambiar su estado a "En Proceso", "Respondida" o "Rechazada". El alumno recibirá una notificación automática del cambio.'
            ],
            [
                'id' => 4,
                'pregunta' => '¿Cómo filtrar solicitudes?',
                'respuesta' => 'Usa los filtros en la parte superior: por ID de solicitud, nombre del alumno, estado, categoría o rango de fechas. Puedes combinar varios filtros.'
            ],
            [
                'id' => 5,
                'pregunta' => '¿Cómo gestionar encuestas?',
                'respuesta' => 'En la sección "Encuestas" puedes crear nuevas encuestas, asignarlas a alumnos específicos o carreras completas, y ver las estadísticas de respuestas.'
            ]
        ];

        return response()->json([
            'success' => true,
            'faqs' => $faqs
        ]);
    }

    /**
     * Obtener FAQs para alumnos
     */
    public function getAlumnoFaqs()
    {
        $faqs = [
            [
                'id' => 1,
                'pregunta' => '¿Cómo enviar una solicitud?',
                'respuesta' => 'Ve a la sección "Solicitudes", completa el formulario con la categoría, asunto y mensaje, luego haz clic en "Enviar Solicitud".'
            ],
            [
                'id' => 2,
                'pregunta' => '¿Cómo ver el estado de mis solicitudes?',
                'respuesta' => 'En la sección "Solicitudes" puedes ver todas tus solicitudes enviadas, su estado actual y las respuestas recibidas.'
            ],
            [
                'id' => 3,
                'pregunta' => '¿Qué tipos de solicitudes puedo enviar?',
                'respuesta' => 'Puedes enviar solicitudes generales, solicitar certificados, homologaciones internas o externas. Selecciona la categoría que corresponda.'
            ],
            [
                'id' => 4,
                'pregunta' => '¿Cómo inscribirme a materias?',
                'respuesta' => 'Ve a la sección "Inscripciones", selecciona las materias disponibles y confirma tu inscripción. Recibirás un comprobante por email.'
            ],
            [
                'id' => 5,
                'pregunta' => '¿Cómo responder encuestas?',
                'respuesta' => 'Si tienes encuestas asignadas, aparecerán en tu dashboard. Haz clic en "Responder" y completa todas las preguntas.'
            ],
            [
                'id' => 6,
                'pregunta' => '¿Recibiré notificaciones de mis solicitudes?',
                'respuesta' => 'Sí, recibirás notificaciones por email cuando el estado de tu solicitud cambie. También verás alertas en el sistema.'
            ]
        ];

        return response()->json([
            'success' => true,
            'faqs' => $faqs
        ]);
    }
} 