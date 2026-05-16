@extends('layouts.app')

@section('content')
<div class="page-title">
    <h1>Calendar</h1>
    <p class="muted">Tasks organized by due date.</p>
</div>

<div class="panel">
    <div class="calendar-list">
        @forelse($tasks as $task)
            <div class="calendar-card">
                <div>
                    <h3>{{ $task->title }}</h3>
                    <p class="muted">{{ $task->description }}</p>
                </div>

                <span class="date-pill">{{ $task->due_date }}</span>
                <span class="badge">{{ $task->priority }}</span>
            </div>
        @empty
            <p class="muted">No calendar tasks found.</p>
        @endforelse
    </div>
</div>
@endsection