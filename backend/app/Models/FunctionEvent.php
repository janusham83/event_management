<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

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

    public function scannerAvailability(): array
    {
        $start = Carbon::parse($this->date . ' ' . $this->start_time);
        $end = Carbon::parse($this->date . ' ' . $this->end_time);
        $now = now();

        if ($now->toDateString() !== $this->date) {
            return ['available' => false, 'message' => 'Scanning is available only on the function day.'];
        }

        if ($now->lt($start->copy()->subHours(2))) {
            return ['available' => false, 'message' => 'Scanning opens 2 hours before the function start time.'];
        }

        if ($now->gt($end)) {
            return ['available' => false, 'message' => 'Scanning has ended for this function.'];
        }

        return ['available' => true, 'message' => null];
    }

    public function getLogoUrlAttribute($value): ?string
    {
        if (! $value) {
            return null;
        }

        if (Str::startsWith($value, ['http://localhost', 'http://127.0.0.1', 'https://eventapi.juitlanka.lk/api'])) {
            return request()->getSchemeAndHttpHost().parse_url($value, PHP_URL_PATH);
        }

        return $value;
    }

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
