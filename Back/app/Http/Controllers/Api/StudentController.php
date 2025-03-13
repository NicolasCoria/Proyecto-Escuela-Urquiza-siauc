<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Mail\StudentMail;
use Illuminate\Http\Request;
use App\Http\Requests\UpdateStudentProfile;
use Illuminate\Support\Facades\Mail;
use \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class StudentController extends Controller
{
    /**
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        try {
            $students = Student::where('approved', false)->orderBy("id", "desc")->get();

            return StudentResource::collection($students);
        } catch (\Exception $e) {
            \Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function indexById($studentId)
    {
        try {
            $id = Student::find($studentId);

            if (!$id) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            return new StudentResource($id);
        } catch (\Exception $e) {
            \Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function updateProfilePhoto(UpdateStudentProfile $request)
    {
        try {
            $user = auth()->user();

            $oldProfilePhoto = $user->profile_photo;

            if ($oldProfilePhoto) {
                Cloudinary::destroy($oldProfilePhoto);
            }

            $profilePhoto = $request->file('profile_photo');
            $profilePhotoPath = $profilePhoto->storeOnCloudinary()->getPublicId();

            $user->update(['profile_photo' => $profilePhotoPath]);

            $userResource = new StudentResource($user);

            return response()->json([
                'success' => 'Foto actualizada correctamente.',
                'user' => $userResource,
            ]);
        } catch (\Exception $e) {
            \Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }

    }

    public function show(Student $student)
    {
        try {
            return new StudentResource($student);
        } catch (\Exception $e) {
            \Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function updateApprovalStatus(Request $request, Student $id)
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
            \Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }


    public function destroy(Request $request, Student $id)
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
            \Log::error($e);
            error_log($e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
