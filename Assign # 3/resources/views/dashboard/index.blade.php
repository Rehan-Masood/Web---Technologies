@extends('layouts.app')

@section('content')
<div class="page-title">
    <h1>Dashboard</h1>
    <p class="muted">Real-time overview from your database.</p>
</div>

<div class="stats">
    <div class="card"><h3>Total Tasks</h3><h2>{{ $total }}</h2></div>
    <div class="card"><h3>Completed</h3><h2>{{ $completed }}</h2></div>
    <div class="card"><h3>In Progress</h3><h2>{{ $progress }}</h2></div>
    <div class="card"><h3>Pending</h3><h2>{{ $pending }}</h2></div>
    <div class="card"><h3>Overdue</h3><h2>{{ $overdue }}</h2></div>
</div>

<div class="panel">
    <div class="panel-head">
        <h2>Recent Tasks</h2>
        <a href="{{ route('tasks.create') }}" class="btn">+ Add Task</a>
    </div>

    <div class="recent-list">
        @forelse($tasks as $task)
            <div class="recent-card">
                <div>
                    <h3>{{ $task->title }}</h3>
                    <p>{{ $task->description }}</p>
                </div>

                <span class="badge">{{ $task->priority }}</span>
                <span>{{ $task->status }}</span>
            </div>
        @empty
            <p class="muted">No recent tasks found.</p>
        @endforelse
    </div>
</div>
@endsection