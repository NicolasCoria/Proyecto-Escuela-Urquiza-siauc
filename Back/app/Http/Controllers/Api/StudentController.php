<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Mail\StudentMail;
use Illuminate\Http\Request;
use App\Http\Requests\UpdateStudentProfile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StudentController extends Controller
{
    /**
     * @return AnonymousResourceCollection|JsonResponse
     */
    public function index()
    {
        try {
            $students = Student::where('approved', false)->orderBy("id", "desc")->get();

            return StudentResource::collection($students);
        } catch (\Exception $e) {
            Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    /**
     * @param int $studentId
     * @return JsonResponse|StudentResource
     */
    public function indexById(int $studentId)
    {
        try {
            $student = Student::find($studentId);

            if (!$student) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            return new StudentResource($student);
        } catch (\Exception $e) {
            Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    /**
     * @param UpdateStudentProfile $request
     * @return JsonResponse
     */
    public function updateProfilePhoto(UpdateStudentProfile $request): JsonResponse
    {
        try {
            /** @var Student $user */
            $user = auth()->user();

            $oldProfilePhoto = $user->profile_photo;

            if ($oldProfilePhoto) {
                Storage::disk('public')->delete($oldProfilePhoto);
            }

            $profilePhoto = $request->file('profile_photo');
            $profilePhotoPath = $profilePhoto->store('profile-photos', 'public');

            $user->profile_photo = $profilePhotoPath;
            $user->save();

            $userResource = new StudentResource($user);

            return response()->json([
                'success' => 'Foto actualizada correctamente.',
                'user' => $userResource,
            ]);
        } catch (\Exception $e) {
            Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    /**
     * @param Student $student
     * @return StudentResource|JsonResponse
     */
    public function show(Student $student)
    {
        try {
            return new StudentResource($student);
        } catch (\Exception $e) {
            Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    /**
     * @param Request $request
     * @param Student $id
     * @return JsonResponse
     */
    public function updateApprovalStatus(Request $request, Student $id): JsonResponse
    {
        try {
            $approved = $request->input('approved', false);

            $id->approved = $approved;
            $name = $id->name;
            $email = $id->email;
            $id->save();

            Mail::to($id->email)->send(new StudentMail($approved, $name, $email));

            return response()->json(['message' => 'Estado de aprobación actualizado con éxito.']);
        } catch (\Exception $e) {
            Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    /**
     * @param Request $request
     * @param Student $id
     * @return JsonResponse
     */
    public function destroy(Request $request, Student $id): JsonResponse
    {
        try {
            $approved = $request->input('approved', false);

            $id->approved = $approved;
            $name = $id->name;
            $email = $id->email;
            $id->delete();

            Mail::to($id->email)->send(new StudentMail($approved, $name, $email));

            return response()->json(['message' => 'Estado de aprobación actualizado con éxito.']);
        } catch (\Exception $e) {
            Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
