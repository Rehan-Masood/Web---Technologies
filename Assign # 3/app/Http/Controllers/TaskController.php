<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query();

        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->priority) {
            $query->where('priority', $request->priority);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return view('tasks.index', [
            'tasks' => $query->latest()->get()
        ]);
    }

    public function create()
    {
        return view('tasks.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|max:255',
            'priority' => 'required',
            'status' => 'required',
            'category' => 'required',
            'due_date' => 'nullable|date',
        ]);

        Task::create([
            ...$request->all(),
            'is_completed' => $request->status === 'Completed',
        ]);

        return redirect()->route('tasks.index')->with('success', 'Task created successfully.');
    }

    public function edit(Task $task)
    {
        return view('tasks.edit', compact('task'));
    }

    public function update(Request $request, Task $task)
    {
        $request->validate([
            'title' => 'required|max:255',
            'priority' => 'required',
            'status' => 'required',
            'category' => 'required',
            'due_date' => 'nullable|date',
        ]);

        $task->update([
            ...$request->all(),
            'is_completed' => $request->status === 'Completed',
        ]);

        return redirect()->route('tasks.index')->with('success', 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return back()->with('success', 'Task deleted successfully.');
    }

    public function toggle(Task $task)
    {
        $task->update([
            'is_completed' => !$task->is_completed,
            'status' => !$task->is_completed ? 'Completed' : 'Pending',
        ]);

        return back();
    }

    public function completed()
    {
        return view('tasks.index', [
            'tasks' => Task::where('is_completed', 1)->latest()->get()
        ]);
    }

    public function pending()
    {
        return view('tasks.index', [
            'tasks' => Task::where('status', 'Pending')->latest()->get()
        ]);
    }
}