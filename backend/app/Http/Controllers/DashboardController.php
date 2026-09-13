<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\IssueTicket;
use App\Models\Participant;
use App\Models\PhotoShoot;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $functionId = auth()->user()->role === 'organizer' ? auth()->user()->function_id : null;
        $participants = Participant::when($functionId, fn ($query) => $query->where('function_id', $functionId));
        $attendances = Attendance::when($functionId, fn ($query) => $query->where('function_id', $functionId));
        $issueTickets = IssueTicket::when($functionId, fn ($query) => $query->where('function_id', $functionId));
        $photoShoots = PhotoShoot::when($functionId, fn ($query) => $query->where('function_id', $functionId));

        $totalRegistered = $participants->count();
        $totalAttended = $attendances->count();
        $attendancePercentage = $totalRegistered > 0 ? round(($totalAttended / $totalRegistered) * 100, 2) : 0;
        $totalIssueTickets = $issueTickets->count();
        $resolvedTickets = (clone $issueTickets)->whereIn('status', ['Resolved', 'Closed'])->count();
        $photoShootCompleted = $photoShoots->count();
        $photoShootPending = max($totalRegistered - $photoShootCompleted, 0);

        $recentActivities = collect([
            ...(clone $participants)->latest()->take(4)->get()->map(fn ($item) => [
                'type' => 'Person registered',
                'title' => $item->full_name,
                'time' => $item->created_at,
            ]),
            ...(clone $attendances)->with('participant')->latest()->take(4)->get()->map(fn ($item) => [
                'type' => 'Attendance marked',
                'title' => $item->participant?->full_name ?? 'Participant',
                'time' => $item->marked_at ?? $item->created_at,
            ]),
            ...(clone $issueTickets)->with('participant')->latest()->take(4)->get()->map(fn ($item) => [
                'type' => $item->status === 'Resolved' || $item->status === 'Closed' ? 'Issue ticket resolved' : 'Issue ticket created',
                'title' => $item->participant?->full_name ?? 'Participant',
                'time' => $item->updated_at,
            ]),
            ...(clone $photoShoots)->with('participant')->latest()->take(4)->get()->map(fn ($item) => [
                'type' => 'Photo shoot completed',
                'title' => $item->participant?->full_name ?? 'Participant',
                'time' => $item->completed_at ?? $item->created_at,
            ]),
        ])->sortByDesc('time')->take(10)->values();

        return response()->json([
            'total_registered' => $totalRegistered,
            'total_attended' => $totalAttended,
            'attendance_percentage' => $attendancePercentage,
            'total_issue_tickets' => $totalIssueTickets,
            'resolved_tickets' => $resolvedTickets,
            'photo_shoot_completed' => $photoShootCompleted,
            'photo_shoot_pending' => $photoShootPending,
            'recent_activities' => $recentActivities,
        ]);
    }
}
