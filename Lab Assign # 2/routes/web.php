<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserRegistrationController;

Route::get('/', [UserRegistrationController::class, 'index'])->name('users.index');
Route::post('/users', [UserRegistrationController::class, 'store'])->name('users.store');
Route::get('/users/{id}/edit', [UserRegistrationController::class, 'edit'])->name('users.edit');
Route::put('/users/{id}', [UserRegistrationController::class, 'update'])->name('users.update');
Route::delete('/users/{id}', [UserRegistrationController::class, 'destroy'])->name('users.destroy');