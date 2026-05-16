<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;

Route::get('/', fn() => view('welcome'))->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [TaskController::class, 'dashboard'])->name('dashboard');
    Route::get('/live-stats', [TaskController::class, 'liveStats'])->name('live.stats');
    Route::resource('tasks', TaskController::class);
    Route::get('/kanban', [TaskController::class, 'kanban'])->name('kanban');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
    Route::get('/calendar', [TaskController::class, 'calendar'])->name('calendar');
    Route::get('/analytics', [TaskController::class, 'analytics'])->name('analytics');
    Route::get('/settings', [TaskController::class, 'settings'])->name('settings');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
