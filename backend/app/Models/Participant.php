<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Participant extends Model
{
    protected $fillable = [
        'full_name',
        'mobile_number',
        'email',
        'organization',
        'number_of_guests',
        'registration_number',
        'function_id',
        'qr_token',
        'status',
        'created_by',
    ];

    public function functionEvent()
    {
        return $this->belongsTo(FunctionEvent::class, 'function_id');
    }

    public function attendance(): HasOne
    {
        return $this->hasOne(Attendance::class);
    }

    public function photoShoot(): HasOne
    {
        return $this->hasOne(PhotoShoot::class);
    }

    public function issueTickets(): HasMany
    {
        return $this->hasMany(IssueTicket::class);
    }
}
