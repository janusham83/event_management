<?php

namespace App\Http\Controllers;

use App\Models\FunctionEvent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class FunctionController extends Controller
{
    public function index()
    {
        $query = FunctionEvent::with(['organizer:id,name,email,phone'])->withCount('participants')->latest();
        if (Auth::user()->role === 'organizer') {
            $query->where('id', Auth::user()->function_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'date' => ['required', 'date'],
            'start_time' => ['required'],
            'end_time' => ['required'],
            'venue' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive'],
            'organizer_name' => ['required', 'string', 'max:255'],
            'organizer_email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'organizer_password' => ['required', 'string', 'min:6'],
            'organizer_phone' => ['nullable', 'string', 'max:20'],
        ]);

        $logoUrl = ! empty($data['logo']) ? $this->storeLogo($data['logo']) : null;
        unset($data['logo']);

        $function = DB::transaction(function () use ($data, $logoUrl) {
            $organizer = User::create([
                'name' => $data['organizer_name'],
                'email' => $data['organizer_email'],
                'password' => $data['organizer_password'],
                'phone' => $data['organizer_phone'] ?? null,
                'role' => 'organizer',
                'is_active' => true,
            ]);

            $function = FunctionEvent::create([
                ...collect($data)->except(['organizer_name', 'organizer_email', 'organizer_password', 'organizer_phone'])->all(),
                'logo_url' => $logoUrl,
                'created_by' => Auth::id(),
                'organizer_id' => $organizer->id,
            ]);
            $organizer->update(['function_id' => $function->id]);
            return $function->load('organizer:id,name,email,phone');
        });

        return response()->json([
            'function' => $function,
            'credentials' => ['name' => $data['organizer_name'], 'email' => $data['organizer_email'], 'password' => $data['organizer_password']],
        ], 201);
    }

    public function show(FunctionEvent $function)
    {
        return response()->json($function->load('participants'));
    }

    public function update(Request $request, FunctionEvent $function)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'logo' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'date' => ['sometimes', 'date'],
            'start_time' => ['sometimes'],
            'end_time' => ['sometimes'],
            'venue' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:active,inactive'],
            'organizer_name' => ['sometimes', 'string', 'max:255'],
            'organizer_email' => ['sometimes', 'email', 'max:255', 'unique:users,email,'.$function->organizer_id],
            'organizer_password' => ['nullable', 'string', 'min:6'],
            'organizer_phone' => ['nullable', 'string', 'max:20'],
        ]);

        $organizerData = collect($data)->only(['organizer_name', 'organizer_email', 'organizer_password', 'organizer_phone'])->all();
        $functionData = collect($data)->except(['organizer_name', 'organizer_email', 'organizer_password', 'organizer_phone', 'logo'])->all();
        if (! empty($data['logo'])) {
            $functionData['logo_url'] = $this->storeLogo($data['logo']);
        }

        $function->update($functionData);
        if ($function->organizer && $organizerData) {
            $function->organizer->update(array_filter([
                'name' => $organizerData['organizer_name'] ?? null,
                'email' => $organizerData['organizer_email'] ?? null,
                'password' => $organizerData['organizer_password'] ?? null,
                'phone' => $organizerData['organizer_phone'] ?? null,
            ], fn ($value) => $value !== null && $value !== ''));
        }

        return response()->json($function->fresh()->load('organizer:id,name,email,phone'));
    }

    public function destroy(FunctionEvent $function)
    {
        $function->delete();

        return response()->json(['message' => 'Function deleted successfully']);
    }

    public function toggleStatus(FunctionEvent $function)
    {
        $function->status = $function->status === 'active' ? 'inactive' : 'active';
        $function->save();

        return response()->json($function);
    }

    private function storeLogo($logo): string
    {
        $directory = public_path('storage/function-logos');
        File::ensureDirectoryExists($directory);
        $filename = Str::uuid().'.'.$logo->getClientOriginalExtension();
        $logo->move($directory, $filename);

        return url('storage/function-logos/'.$filename);
    }
}
