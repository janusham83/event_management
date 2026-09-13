<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FunctionEvent extends Model
{
    protected $fillable = [
        'name',
        'logo_url',
        'date',
        'start_time',
        'end_time',
        'venue',
        'description',
        'status',
        'created_by',
        'organizer_id',
    ];

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class, 'function_id');
    }

    public function issueTickets(): HasMany
    {
        return $this->hasMany(IssueTicket::class, 'function_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }
}
