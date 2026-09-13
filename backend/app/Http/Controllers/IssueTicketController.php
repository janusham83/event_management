<?php

namespace App\Http\Controllers;

use App\Models\IssueTicket;
use App\Models\Participant;
use Illuminate\Http\Request;

class IssueTicketController extends Controller
{
    public function index()
    {
        $query = IssueTicket::with(['participant', 'functionEvent', 'assignedUser'])->latest();
        if (auth()->user()->role === 'organizer') {
            $query->where('function_id', auth()->user()->function_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'participant_id' => ['required', 'exists:participants,id'],
            'function_id' => ['required', 'exists:function_events,id'],
            'category' => ['required', 'string'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'in:Low,Medium,High,Urgent'],
            'status' => ['nullable', 'in:Open,In Progress,Resolved,Closed'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);
        if (auth()->user()->role === 'organizer' && (int) $data['function_id'] !== (int) auth()->user()->function_id) {
            return response()->json(['message' => 'You can only use your assigned function.'], 403);
        }

        $participant = Participant::findOrFail($data['participant_id']);
        $ticketNumber = 'TKT-' . date('Y') . '-' . str_pad((IssueTicket::count() + 1), 6, '0', STR_PAD_LEFT);

        $ticket = IssueTicket::create([
            'ticket_number' => $ticketNumber,
            'participant_id' => $participant->id,
            'function_id' => $data['function_id'],
            'category' => $data['category'],
            'description' => $data['description'],
            'priority' => $data['priority'],
            'status' => $data['status'] ?? 'Open',
            'assigned_to' => $data['assigned_to'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return response()->json($ticket->load(['participant', 'functionEvent']), 201);
    }

    public function update(Request $request, IssueTicket $ticket)
    {
        $data = $request->validate([
            'participant_id' => ['required', 'exists:participants,id'],
            'function_id' => ['required', 'exists:function_events,id'],
            'category' => ['required', 'string'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'in:Low,Medium,High,Urgent'],
            'status' => ['required', 'in:Open,In Progress,Resolved,Closed'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $data['resolved_at'] = in_array($data['status'], ['Resolved', 'Closed'], true)
            ? ($ticket->resolved_at ?? now())
            : null;

        if (auth()->user()->role === 'organizer' && (int) $data['function_id'] !== (int) auth()->user()->function_id) {
            return response()->json(['message' => 'You can only use your assigned function.'], 403);
        }

        $ticket->update($data);

        return response()->json($ticket->fresh()->load(['participant', 'functionEvent', 'assignedUser']));
    }

    public function destroy(IssueTicket $ticket)
    {
        $ticket->delete();

        return response()->json(['message' => 'Ticket deleted successfully.']);
    }

    public function search(Request $request)
    {
        $query = $request->get('query');
        $status = $request->get('status');
        $priority = $request->get('priority');

        $tickets = IssueTicket::with(['participant', 'functionEvent'])
            ->when($query, function ($q) use ($query) {
                $q->where('ticket_number', 'like', "%{$query}%")
                    ->orWhereHas('participant', fn ($sub) => $sub->where('full_name', 'like', "%{$query}%"))
                    ->orWhereHas('participant', fn ($sub) => $sub->where('mobile_number', 'like', "%{$query}%"))
                    ->orWhere('status', 'like', "%{$query}%")
                    ->orWhere('priority', 'like', "%{$query}%");
            })
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($priority, fn ($q) => $q->where('priority', $priority))
            ->latest()
            ->get();

        return response()->json($tickets);
    }
}
