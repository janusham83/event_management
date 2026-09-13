<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'participant_id',
        'function_id',
        'user_id',
        'marked_at',
    ];

    protected $casts = [
        'marked_at' => 'datetime',
    ];

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function functionEvent()
    {
        return $this->belongsTo(FunctionEvent::class, 'function_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
