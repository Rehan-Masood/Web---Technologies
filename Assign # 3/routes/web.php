<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;
use App\Http\Controllers\TaskController;

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/dashboard', [PageController::class, 'dashboard'])->name('dashboard');
Route::get('/calendar', [PageController::class, 'calendar'])->name('calendar');
Route::get('/analytics', [PageController::class, 'analytics'])->name('analytics');
Route::get('/settings', [PageController::class, 'settings'])->name('settings');

Route::resource('/tasks', TaskController::class);
Route::get('/completed', [TaskController::class, 'completed'])->name('tasks.completed');
Route::get('/pending', [TaskController::class, 'pending'])->name('tasks.pending');
Route::patch('/tasks/{task}/toggle', [TaskController::class, 'toggle'])->name('tasks.toggle');