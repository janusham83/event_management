<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FunctionController;
use App\Http\Controllers\IssueTicketController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\PhotoShootController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/public/tickets/{qrToken}', [ParticipantController::class, 'publicTicket']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user()->load('functionEvent');
        });

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::get('/functions', [FunctionController::class, 'index']);
        Route::get('/functions/{function}', [FunctionController::class, 'show']);
        Route::middleware('role:admin')->group(function () {
            Route::post('/functions', [FunctionController::class, 'store']);
            Route::put('/functions/{function}', [FunctionController::class, 'update']);
            Route::delete('/functions/{function}', [FunctionController::class, 'destroy']);
            Route::post('/functions/{function}/toggle-status', [FunctionController::class, 'toggleStatus']);
        });

        Route::middleware('role:admin,organizer')->group(function () {
            Route::get('/participants/template', [ParticipantController::class, 'template']);
            Route::post('/participants/bulk', [ParticipantController::class, 'bulkStore']);
            Route::apiResource('participants', ParticipantController::class);
            Route::get('/participants/search', [ParticipantController::class, 'search']);

            Route::post('/attendance/scan', [AttendanceController::class, 'scan']);
            Route::post('/attendance/manual', [AttendanceController::class, 'manual']);
            Route::delete('/attendance/manual', [AttendanceController::class, 'unmark']);
            Route::get('/attendance/report', [ReportController::class, 'attendanceReport']);

            Route::post('/photo-shoot/scan', [PhotoShootController::class, 'scan']);
            Route::post('/photo-shoot/manual', [PhotoShootController::class, 'manual']);
            Route::delete('/photo-shoot/manual', [PhotoShootController::class, 'unmark']);
            Route::get('/photo-shoot/report', [ReportController::class, 'photoShootReport']);

            Route::post('/payment/manual', [PaymentController::class, 'manual']);
            Route::delete('/payment/manual', [PaymentController::class, 'unmark']);
            Route::post('/payment/scan', [PaymentController::class, 'scan']);

            Route::apiResource('tickets', IssueTicketController::class);
            Route::get('/tickets/search', [IssueTicketController::class, 'search']);
        });

        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/issue', [ReportController::class, 'issueReport']);
    });
});
