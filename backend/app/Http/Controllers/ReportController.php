<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\IssueTicket;
use App\Models\Participant;
use App\Models\PhotoShoot;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'attendance' => $this->attendanceReport($request, true),
            'photo_shoot' => $this->photoShootReport($request, true),
            'issues' => $this->issueReport($request, true),
        ]);
    }

    public function attendanceReport(Request $request, $asJson = false)
    {
        $query = Participant::query();
        $functionId = $this->scopedFunctionId($request);
        if ($functionId) $query->where('function_id', $functionId);
        if ($request->date) $query->whereDate('created_at', $request->date);

        $participants = $query->get();
        $total = $participants->count();
        $attended = Attendance::whereIn('participant_id', $participants->pluck('id'))->count();
        $notAttended = $total - $attended;
        $percentage = $total > 0 ? round(($attended / $total) * 100, 2) : 0;

        $payload = [
            'total_registered' => $total,
            'attended' => $attended,
            'not_attended' => $notAttended,
            'attendance_percentage' => $percentage,
        ];

        return $asJson ? $payload : response()->json($payload);
    }

    public function photoShootReport(Request $request, $asJson = false)
    {
        $query = Participant::query();
        $functionId = $this->scopedFunctionId($request);
        if ($functionId) $query->where('function_id', $functionId);
        if ($request->date) $query->whereDate('created_at', $request->date);

        $participants = $query->get();
        $total = $participants->count();
        $completed = PhotoShoot::whereIn('participant_id', $participants->pluck('id'))->count();
        $pending = $total - $completed;
        $percentage = $total > 0 ? round(($completed / $total) * 100, 2) : 0;

        $payload = [
            'total_participants' => $total,
            'completed' => $completed,
            'pending' => $pending,
            'completion_percentage' => $percentage,
        ];

        return $asJson ? $payload : response()->json($payload);
    }

    public function issueReport(Request $request, $asJson = false)
    {
        $query = IssueTicket::query();
        $functionId = $this->scopedFunctionId($request);
        if ($functionId) $query->where('function_id', $functionId);
        if ($request->date) $query->whereDate('created_at', $request->date);

        $issues = $query->get();
        $payload = [
            'total_issues' => $issues->count(),
            'open' => $issues->where('status', 'Open')->count(),
            'in_progress' => $issues->where('status', 'In Progress')->count(),
            'resolved' => $issues->where('status', 'Resolved')->count(),
            'closed' => $issues->where('status', 'Closed')->count(),
        ];

        return $asJson ? $payload : response()->json($payload);
    }

    private function scopedFunctionId(Request $request): mixed
    {
        return auth()->user()->role === 'organizer'
            ? auth()->user()->function_id
            : $request->function_id;
    }
}
