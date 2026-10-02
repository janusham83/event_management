<?php

namespace App\Http\Controllers;

use App\Models\FunctionEvent;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ParticipantController extends Controller
{
    public function index()
    {
        $query = Participant::with(['functionEvent', 'attendance', 'photoShoot', 'payment', 'issueTickets'])->latest();
        if (auth()->user()->role === 'organizer') {
            $query->where('function_id', auth()->user()->function_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'number_of_guests' => ['nullable', 'integer', 'min:0'],
            'function_id' => ['required', 'exists:function_events,id'],
        ]);

        $function = FunctionEvent::findOrFail($data['function_id']);
        if (auth()->user()->role === 'organizer' && (int) $function->id !== (int) auth()->user()->function_id) {
            return response()->json(['message' => 'You can only use your assigned function.'], 403);
        }
        $participant = $this->createParticipant([
            'full_name' => $data['full_name'],
            'mobile_number' => $data['mobile_number'],
            'email' => $data['email'] ?? null,
            'organization' => $data['organization'] ?? null,
            'number_of_guests' => $data['number_of_guests'] ?? 0,
            'function_id' => $function->id,
            'qr_token' => Str::random(32),
            'status' => 'registered',
            'created_by' => auth()->id(),
        ]);

        return response()->json($participant->load(['functionEvent', 'attendance', 'photoShoot']), 201);
    }

    public function template()
    {
        return response("full_name,mobile_number,email\nJohn Doe,0771234567,john@example.com\n")
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename=participant-registration-template.csv');
    }

    public function bulkStore(Request $request)
    {
        $request->validate(['file' => ['required', 'file', 'mimes:csv,txt', 'max:5120']]);
        $functionId = auth()->user()->role === 'organizer' ? auth()->user()->function_id : $request->input('function_id');
        validator(['function_id' => $functionId], ['function_id' => ['required', 'exists:function_events,id']])->validate();

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        $headers = array_map(fn ($header) => strtolower(trim($header)), fgetcsv($handle));
        $required = ['full_name', 'mobile_number', 'email'];
        if (array_diff($required, $headers)) {
            fclose($handle);
            return response()->json(['message' => 'Invalid template. Download the registration template and keep its column headers.'], 422);
        }

        $rows = [];
        $errors = [];
        $line = 1;
        while (($values = fgetcsv($handle)) !== false) {
            $line++;
            if (count(array_filter($values, fn ($value) => trim((string) $value) !== '')) === 0) continue;
            $row = array_combine($headers, array_pad(array_slice($values, 0, count($headers)), count($headers), null));
            $validation = validator($row, [
                'full_name' => ['required', 'string', 'max:255'],
                'mobile_number' => ['required', 'string', 'max:20'],
                'email' => ['nullable', 'email', 'max:255'],
            ]);
            if ($validation->fails()) {
                $errors[] = ['row' => $line, 'errors' => $validation->errors()->all()];
                continue;
            }
            $rows[] = $validation->validated();
        }
        fclose($handle);

        if ($errors) return response()->json(['message' => 'Some rows are invalid.', 'errors' => $errors], 422);
        if (! $rows) return response()->json(['message' => 'The file has no participant rows.'], 422);

        $created = DB::transaction(function () use ($rows, $functionId) {
            return collect($rows)->map(function ($row) use ($functionId) {
                return $this->createParticipant([
                    ...$row,
                    'number_of_guests' => $row['number_of_guests'] ?? 0,
                    'function_id' => $functionId,
                    'qr_token' => Str::random(32),
                    'status' => 'registered',
                    'created_by' => auth()->id(),
                ]);
            });
        });

        return response()->json(['message' => "{$created->count()} participants registered successfully.", 'count' => $created->count()]);
    }

    private function createParticipant(array $attributes): Participant
    {
        return DB::transaction(function () use ($attributes) {
            $participant = Participant::create([
                ...$attributes,
                'registration_number' => 'REG-PENDING-' . Str::uuid(),
            ]);

            $participant->registration_number = 'REG-' . date('Y') . '-' . str_pad((string) $participant->id, 6, '0', STR_PAD_LEFT);
            $participant->save();

            return $participant;
        });
    }

    public function show(Participant $participant)
    {
        return response()->json($participant->load(['functionEvent', 'attendance.user', 'photoShoot.user', 'issueTickets']));
    }

    public function publicTicket(string $qrToken)
    {
        $participant = Participant::where('qr_token', $qrToken)
            ->with('functionEvent')
            ->firstOrFail();

        return response()->json([
            ...$participant->only(['full_name', 'registration_number', 'qr_token']),
            'function_event' => $participant->functionEvent,
        ]);
    }

    public function update(Request $request, Participant $participant)
    {
        $data = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'mobile_number' => ['sometimes', 'string', 'max:20'],
            'email' => ['sometimes', 'email', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'number_of_guests' => ['sometimes', 'integer', 'min:0'],
            'function_id' => ['sometimes', 'exists:function_events,id'],
        ]);
        if (auth()->user()->role === 'organizer' && (int) ($data['function_id'] ?? $participant->function_id) !== (int) auth()->user()->function_id) {
            return response()->json(['message' => 'You can only use your assigned function.'], 403);
        }

        $participant->update($data);

        return response()->json($participant->fresh());
    }

    public function destroy(Participant $participant)
    {
        $participant->delete();

        return response()->json(['message' => 'Participant removed successfully']);
    }

    public function search(Request $request)
    {
        $query = $request->get('query');

        if (! $query) {
            return response()->json([]);
        }

        $participants = Participant::with(['functionEvent', 'attendance', 'photoShoot'])
            ->when(auth()->user()->role === 'organizer', fn ($query) => $query->where('function_id', auth()->user()->function_id))
            ->where('full_name', 'like', "%{$query}%")
            ->orWhere('mobile_number', 'like', "%{$query}%")
            ->orWhere('registration_number', 'like', "%{$query}%")
            ->orWhere('qr_token', 'like', "%{$query}%")
            ->get();

        return response()->json($participants);
    }
}
