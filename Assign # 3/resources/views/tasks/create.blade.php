@extends('layouts.app')

@section('content')
<div class="page-title">
    <h1>Create Task</h1>
    <p class="muted">Add a new task to your database.</p>
</div>

<form method="POST" action="{{ route('tasks.store') }}" class="form-card">
    @csrf

    <input name="title" placeholder="Task title" required>
    <textarea name="description" placeholder="Task description"></textarea>

    <select name="category">
        <option>Personal</option>
        <option>Work</option>
        <option>Study</option>
        <option>Fitness</option>
        <option>Shopping</option>
    </select>

    <select name="priority">
        <option>Low</option>
        <option selected>Medium</option>
        <option>High</option>
    </select>

    <select name="status">
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
    </select>

    <input type="date" name="due_date">

    <button class="btn">Save Task</button>
</form>
@endsection