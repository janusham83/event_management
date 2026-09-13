<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class OrganizerController extends Controller
{
    public function index()
    {
        return response()->json(User::where('role', 'organizer')->latest()->get([
            'id',
            'name',
            'email',
            'phone',
            'role',
            'is_active',
            'created_at',
        ]));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $organizer = User::create([
            ...$data,
            'role' => 'organizer',
            'is_active' => true,
        ]);

        return response()->json([
            'id' => $organizer->id,
            'name' => $organizer->name,
            'email' => $organizer->email,
            'phone' => $organizer->phone,
            'role' => $organizer->role,
            'password' => $data['password'],
        ], 201);
    }
}
