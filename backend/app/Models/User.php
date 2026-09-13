<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'function_id',
        'phone',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function functionEvents(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(FunctionEvent::class, 'created_by');
    }

    public function functionEvent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(FunctionEvent::class, 'function_id');
    }

    public function attendances(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function photoShoots(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PhotoShoot::class);
    }

    public function issueTickets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(IssueTicket::class, 'created_by');
    }
}
