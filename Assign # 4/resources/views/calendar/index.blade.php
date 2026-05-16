@extends('layouts.premium', ['title' => 'Calendar'])
@section('content')
<div class="page-head"><div><h2>Calendar</h2><p>Tasks organized by due date.</p></div><a href="{{ route('tasks.create') }}" class="btn">+ New Task</a></div>
<div class="card"><h2>Due Date Schedule</h2>@forelse($tasks as $task)<div class="task-card"><div><h3 class="task-title">{{ $task->title }}</h3><p class="task-desc">{{ $task->description ?? 'No description' }}</p></div><div class="badges"><span class="badge {{ strtolower($task->priority) }}">{{ $task->priority }}</span><span class="badge {{ str_replace(' ','-',strtolower($task->status)) }}">{{ $task->status }}</span><span class="badge">{{ $task->due_date ? $task->due_date->format('M d, Y') : 'No Date' }}</span></div></div>@empty<p style="color:#94a3b8;margin-top:15px">No tasks with due dates found.</p>@endforelse</div>
@endsection
