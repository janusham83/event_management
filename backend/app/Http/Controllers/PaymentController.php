<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Participant;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function scan(Request $request)
    {
        $data = $request->validate([
            'function_id' => ['required', 'exists:function_events,id'],
            'qr_token' => ['required', 'string'],
        ]);
        $this->authorizeFunction($data['function_id']);

        $function = \App\Models\FunctionEvent::findOrFail($data['function_id']);
        if ($function->status !== 'active') {
            return response()->json(['status' => 'invalid', 'message' => 'This event is inactive. QR scanning is not available.'], 422);
        }

        $participant = Participant::where('qr_token', $data['qr_token'])->first();
        if (! $participant) {
            return response()->json(['status' => 'invalid', 'message' => 'Invalid QR Code'], 404);
        }
        $this->ensureParticipantFunction($participant, $data['function_id']);

        $payment = Payment::where('participant_id', $participant->id)->first();
        if ($payment) {
            return response()->json([
                'status' => 'already_paid',
                'message' => 'Payment Already Completed',
                'participant' => $participant,
                'previous_time' => $payment->paid_at,
            ]);
        }

        $payment = Payment::create([
            'participant_id' => $participant->id,
            'function_id' => $data['function_id'],
            'user_id' => auth()->id(),
            'paid_at' => now(),
        ]);

        return response()->json([
            'status' => 'paid',
            'message' => 'Payment Completed',
            'participant' => $participant,
            'payment' => $payment,
        ]);
    }

    public function manual(Request $request)
    {
        $data = $request->validate([
            'function_id' => ['required', 'exists:function_events,id'],
            'participant_id' => ['required', 'exists:participants,id'],
        ]);
        $this->authorizeFunction($data['function_id']);

        $participant = Participant::findOrFail($data['participant_id']);
        $this->ensureParticipantFunction($participant, $data['function_id']);
        $payment = Payment::firstOrCreate(
            ['participant_id' => $participant->id],
            ['function_id' => $data['function_id'], 'user_id' => auth()->id(), 'paid_at' => now()]
        );

        return response()->json(['status' => 'paid', 'message' => 'Payment marked as paid', 'payment' => $payment]);
    }

    public function unmark(Request $request)
    {
        $data = $request->validate([
            'function_id' => ['required', 'exists:function_events,id'],
            'participant_id' => ['required', 'exists:participants,id'],
        ]);
        $this->authorizeFunction($data['function_id']);

        $participant = Participant::findOrFail($data['participant_id']);
        $this->ensureParticipantFunction($participant, $data['function_id']);
        $deleted = Payment::where('participant_id', $participant->id)->where('function_id', $data['function_id'])->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Payment is not marked for this participant.'], 404);
        }

        return response()->json(['status' => 'unmarked', 'message' => 'Payment undone']);
    }

    private function authorizeFunction(int $functionId): void
    {
        if (auth()->user()->role === 'organizer' && $functionId !== (int) auth()->user()->function_id) {
            abort(403, 'You can only use your assigned function.');
        }
    }

    private function ensureParticipantFunction(Participant $participant, int $functionId): void
    {
        if ((int) $participant->function_id !== $functionId) {
            abort(422, 'Participant does not belong to this function');
        }
    }
}