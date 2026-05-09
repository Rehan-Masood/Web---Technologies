@extends('layouts.app')

@section('content')
<div class="page-title">
    <h1>Edit Task</h1>
    <p class="muted">Update your task information.</p>
</div>

<form method="POST" action="{{ route('tasks.update', $task) }}" class="form-card">
    @csrf
    @method('PUT')

    <input name="title" value="{{ $task->title }}" required>
    <textarea name="description">{{ $task->description }}</textarea>

    <select name="category">
        @foreach(['Personal','Work','Study','Fitness','Shopping'] as $cat)
            <option @selected($task->category == $cat)>{{ $cat }}</option>
        @endforeach
    </select>

    <select name="priority">
        @foreach(['Low','Medium','High'] as $p)
            <option @selected($task->priority == $p)>{{ $p }}</option>
        @endforeach
    </select>

    <select name="status">
        @foreach(['Pending','In Progress','Completed'] as $s)
            <option @selected($task->status == $s)>{{ $s }}</option>
        @endforeach
    </select>

    <input type="date" name="due_date" value="{{ $task->due_date }}">

    <button class="btn">Update Task</button>
</form>
@endsection