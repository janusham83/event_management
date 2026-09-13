<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IssueTicket extends Model
{
    protected $fillable = [
        'ticket_number',
        'participant_id',
        'function_id',
        'category',
        'description',
        'priority',
        'status',
        'assigned_to',
        'created_by',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function functionEvent()
    {
        return $this->belongsTo(FunctionEvent::class, 'function_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
