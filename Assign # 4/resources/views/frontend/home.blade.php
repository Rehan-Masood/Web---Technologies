@extends('layouts.app')

@section('content')
<section class="hero">
    <div>
        <h1>Premium Laravel To-Do List Management System</h1>
        <p>Manage tasks, priorities, deadlines, productivity, calendar and analytics in one modern dashboard.</p>

        <div class="hero-actions">
            <a href="{{ route('dashboard') }}" class="btn">Open Dashboard</a>
            <a href="{{ route('tasks.create') }}" class="btn">Create Task</a>
        </div>
    </div>

    <div class="hero-card">
        <h2>🚀 Features</h2>
        <br>
        <p>✅ Add, edit and delete tasks</p>
        <p>✅ Priority and status tracking</p>
        <p>✅ Calendar page</p>
        <p>✅ Analytics page</p>
        <p>✅ Responsive premium UI</p>
    </div>
</section>
@endsection