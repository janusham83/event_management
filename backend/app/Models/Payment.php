<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['participant_id', 'function_id', 'user_id', 'paid_at'];

    protected $casts = ['paid_at' => 'datetime'];

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }
}