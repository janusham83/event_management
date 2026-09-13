<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhotoShoot extends Model
{
    protected $fillable = [
        'participant_id',
        'function_id',
        'user_id',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
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
