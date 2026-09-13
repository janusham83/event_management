<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\FunctionEvent;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function scan(Request $request)
    {
        $data = $request->validate([
            'function_id' => ['required', 'exists:function_events,id'],
            'qr_token' => ['required', 'string'],
        ]);
        if (auth()->user()->role === 'organizer' && (int) $data['function_id'] !== (int) auth()->user()->function_id) {
            return response()->json(['message' => 'You can only use your assigned function.'], 403);
        }
        $function = FunctionEvent::findOrFail($data['function_id']);
        if ($function->status !== 'active') {
            return response()->json(['status' => 'invalid', 'message' => 'This event is inactive. QR scanning is not available.'], 422);
        }

        $participant = Participant::where('qr_token', $data['qr_token'])->first();

        if (! $participant) {
            return response()->json(['status' => 'invalid', 'message' => 'Invalid QR Code'], 404);
        }

        if ((int) $participant->function_id !== (int) $data['function_id']) {
            return response()->json(['status' => 'invalid', 'message' => 'Participant does not belong to this function'], 422);
        }

        return $this->markParticipant($participant, $data['function_id']);
    }

    public function manual(Request $request)
    {
        $data = $request->validate([
            'function_id' => ['required', 'exists:function_events,id'],
            'participant_id' => ['required', 'exists:participants,id'],
        ]);
        if (auth()->user()->role === 'organizer' && (int) $data['function_id'] !== (int) auth()->user()->function_id) {
            return response()->json(['message' => 'You can only use your assigned function.'], 403);
        }

        $participant = Participant::findOrFail($data['participant_id']);

        if ((int) $participant->function_id !== (int) $data['function_id']) {
            return response()->json(['status' => 'invalid', 'message' => 'Participant does not belong to this function'], 422);
        }

        return $this->markParticipant($participant, $data['function_id']);
    }

    public function unmark(Request $request)
    {
        $data = $request->validate([
            'function_id' => ['required', 'exists:function_events,id'],
            'participant_id' => ['required', 'exists:participants,id'],
        ]);
        if (auth()->user()->role === 'organizer' && (int) $data['function_id'] !== (int) auth()->user()->function_id) {
            return response()->json(['message' => 'You can only use your assigned function.'], 403);
        }

        $participant = Participant::findOrFail($data['participant_id']);

        if ((int) $participant->function_id !== (int) $data['function_id']) {
            return response()->json(['message' => 'Participant does not belong to this function'], 422);
        }

        $deleted = Attendance::where('participant_id', $participant->id)
            ->where('function_id', $data['function_id'])
            ->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Attendance is not marked for this participant.'], 404);
        }

        return response()->json([
            'status' => 'unmarked',
            'message' => 'Attendance undone',
        ]);
    }

    private function markParticipant(Participant $participant, int $functionId)
    {
        $attendance = Attendance::where('participant_id', $participant->id)->first();

        if ($attendance) {
            return response()->json([
                'status' => 'already_attended',
                'message' => 'Already Attended',
                'participant' => $participant,
                'previous_time' => $attendance->marked_at,
            ]);
        }

        $attendance = DB::transaction(function () use ($participant, $functionId) {
            return Attendance::create([
                'participant_id' => $participant->id,
            'function_id' => $functionId,
                'user_id' => auth()->id(),
                'marked_at' => now(),
            ]);
        });

        return response()->json([
            'status' => 'marked',
            'message' => 'Attendance Marked',
            'participant' => $participant,
            'attendance' => $attendance,
        ]);
    }
}
