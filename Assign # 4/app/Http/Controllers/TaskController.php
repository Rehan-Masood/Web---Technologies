<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TaskController extends Controller
{
    public function dashboard()
    {
        $tasks = auth()->user()->tasks()->latest()->get();
        $upcomingTasks = auth()->user()->tasks()->whereNotNull('due_date')->whereDate('due_date', '>=', now())->where('status', '!=', 'Completed')->orderBy('due_date')->take(5)->get();
        return view('dashboard.index', array_merge($this->stats($tasks), $this->notifications(), ['upcomingTasks' => $upcomingTasks]));
    }

    public function index(Request $request)
    {
        $query = auth()->user()->tasks()->latest();
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')->orWhere('description', 'like', '%' . $request->search . '%')->orWhere('category', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('priority')) $query->where('priority', $request->priority);
        if ($request->filled('status')) $query->where('status', $request->status);
        $tasks = $query->paginate(8)->withQueryString();
        return view('tasks.index', array_merge(compact('tasks'), $this->notifications()));
    }

    public function create(){ return view('tasks.create', $this->notifications()); }

    public function store(Request $request)
    {
        $data = $this->validateTask($request);
        $data['user_id'] = auth()->id();
        $data['is_completed'] = $data['status'] === 'Completed';
        Task::create($data);
        return redirect()->route('tasks.index')->with('success', 'Task created successfully.');
    }

    public function edit(Task $task)
    {
        $this->authorizeTask($task);
        return view('tasks.edit', array_merge(compact('task'), $this->notifications()));
    }

    public function update(Request $request, Task $task)
    {
        $this->authorizeTask($task);
        $data = $this->validateTask($request);
        $data['is_completed'] = $data['status'] === 'Completed';
        $task->update($data);
        return redirect()->route('tasks.index')->with('success', 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $this->authorizeTask($task);
        $task->delete();
        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully.');
    }

    public function kanban()
    {
        $pendingTasks = auth()->user()->tasks()->where('status', 'Pending')->latest()->get();
        $progressTasks = auth()->user()->tasks()->where('status', 'In Progress')->latest()->get();
        $completedTasks = auth()->user()->tasks()->where('status', 'Completed')->latest()->get();
        return view('kanban.index', array_merge(compact('pendingTasks','progressTasks','completedTasks'), $this->notifications()));
    }

    public function updateStatus(Request $request, Task $task)
    {
        $this->authorizeTask($task);
        $request->validate(['status' => 'required|in:Pending,In Progress,Completed']);
        $task->update(['status' => $request->status, 'is_completed' => $request->status === 'Completed']);
        return response()->json(['success' => true, 'message' => 'Task status updated successfully.']);
    }

    public function calendar()
    {
        $tasks = auth()->user()->tasks()->whereNotNull('due_date')->orderBy('due_date')->get();
        return view('calendar.index', array_merge(compact('tasks'), $this->notifications()));
    }

    public function analytics()
    {
        $tasks = auth()->user()->tasks()->latest()->get();
        return view('analytics.index', array_merge($this->stats($tasks), $this->notifications()));
    }

    public function settings(){ return view('settings.index', $this->notifications()); }

    public function liveStats(){ $tasks = auth()->user()->tasks()->get(); return response()->json($this->stats($tasks)); }

    private function validateTask(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|min:3|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|min:2|max:100',
            'priority' => 'required|in:Low,Medium,High',
            'status' => 'required|in:Pending,In Progress,Completed',
            'due_date' => 'nullable|date',
        ]);
    }

    private function authorizeTask(Task $task): void{ abort_unless($task->user_id === auth()->id(), 403); }

    private function stats($tasks): array
    {
        $today = Carbon::today();
        return [
            'tasks' => $tasks,
            'total' => $tasks->count(),
            'completed' => $tasks->where('status','Completed')->count(),
            'progress' => $tasks->where('status','In Progress')->count(),
            'pending' => $tasks->where('status','Pending')->count(),
            'overdue' => $tasks->filter(fn($task) => $task->due_date && Carbon::parse($task->due_date)->lt($today) && $task->status !== 'Completed')->count(),
            'high' => $tasks->where('priority','High')->count(),
            'medium' => $tasks->where('priority','Medium')->count(),
            'low' => $tasks->where('priority','Low')->count(),
        ];
    }

    private function notifications(): array
    {
        $nearDue = auth()->user()->tasks()->whereNotNull('due_date')->whereDate('due_date','<=',now()->addDays(2))->where('status','!=','Completed')->orderBy('due_date')->take(4)->get();
        $overdue = auth()->user()->tasks()->whereNotNull('due_date')->whereDate('due_date','<',now())->where('status','!=','Completed')->count();
        $notes = collect();
        if($overdue > 0) $notes->push("You have {$overdue} overdue task(s). Please review them.");
        foreach($nearDue as $task){ $notes->push("Upcoming deadline: {$task->title} due on ".Carbon::parse($task->due_date)->format('M d, Y')); }
        return ['notifications' => $notes, 'notificationCount' => $notes->count()];
    }
}
