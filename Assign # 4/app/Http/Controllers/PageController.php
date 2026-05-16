<?php

namespace App\Http\Controllers;

use App\Models\Task;

class PageController extends Controller
{
    public function home()
    {
        return view('frontend.home');
    }

    public function dashboard()
    {
        return view('dashboard.index', [
            'total' => Task::count(),
            'completed' => Task::where('is_completed', 1)->count(),
            'pending' => Task::where('status', 'Pending')->count(),
            'progress' => Task::where('status', 'In Progress')->count(),
            'overdue' => Task::whereDate('due_date', '<', now())->where('is_completed', 0)->count(),
            'tasks' => Task::latest()->take(6)->get(),
        ]);
    }

    public function calendar()
    {
        return view('dashboard.calendar', [
            'tasks' => Task::whereNotNull('due_date')->orderBy('due_date')->get()
        ]);
    }

    public function analytics()
    {
        return view('dashboard.analytics', [
            'total' => Task::count(),
            'completed' => Task::where('is_completed', 1)->count(),
            'pending' => Task::where('status', 'Pending')->count(),
            'progress' => Task::where('status', 'In Progress')->count(),
        ]);
    }

    public function settings()
    {
        return view('dashboard.settings');
    }
}