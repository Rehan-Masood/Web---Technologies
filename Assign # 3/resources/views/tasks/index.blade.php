@extends('layouts.app')

@section('content')

<div class="panel-head">
    <div class="page-title">
        <h1>My Tasks</h1>
        <p class="muted">Manage all database tasks here.</p>
    </div>

    <a href="{{ route('tasks.create') }}" class="btn">
        + Create Task
    </a>
</div>

<form method="GET" class="filters">

    <input
        name="search"
        placeholder="Search task..."
        value="{{ request('search') }}"
    >

    <select name="priority">
        <option value="">All Priority</option>

        <option
            value="High"
            @selected(request('priority') == 'High')
        >
            High
        </option>

        <option
            value="Medium"
            @selected(request('priority') == 'Medium')
        >
            Medium
        </option>

        <option
            value="Low"
            @selected(request('priority') == 'Low')
        >
            Low
        </option>
    </select>

    <select name="status">

        <option value="">All Status</option>

        <option
            value="Pending"
            @selected(request('status') == 'Pending')
        >
            Pending
        </option>

        <option
            value="In Progress"
            @selected(request('status') == 'In Progress')
        >
            In Progress
        </option>

        <option
            value="Completed"
            @selected(request('status') == 'Completed')
        >
            Completed
        </option>

    </select>

    <button class="btn">
        Search
    </button>

</form>

@if(session('success'))

    <div class="success-msg">
        {{ session('success') }}
    </div>

@endif

<div class="panel">

    <div class="task-list">

        @forelse($tasks as $task)

            <div class="task-card">

                {{-- CHECK BUTTON --}}
                <form
                    class="task-check"
                    method="POST"
                    action="{{ route('tasks.toggle', $task) }}"
                >

                    @csrf
                    @method('PATCH')

                    <button>
                        ✓
                    </button>

                </form>

                {{-- TASK INFO --}}
                <div class="task-info">

                    <h3 class="{{ $task->is_completed ? 'done' : '' }}">

                        {{ $task->title }}

                    </h3>

                    <p>

                        {{ $task->description }}

                    </p>

                </div>

                {{-- TASK META --}}
                <div class="task-meta">

                    <span class="badge">

                        {{ $task->category }}

                    </span>

                    <span class="priority-{{ strtolower($task->priority) }}">

                        {{ $task->priority }}

                    </span>

                    <span>

                        {{ $task->status }}

                    </span>

                    <span>

                        {{ $task->due_date ?? 'No Date' }}

                    </span>

                    {{-- EDIT --}}
                    <a
                        href="{{ route('tasks.edit', $task) }}"
                        class="small"
                    >
                        Edit
                    </a>

                    {{-- DELETE --}}
                    <form
                        method="POST"
                        action="{{ route('tasks.destroy', $task) }}"
                    >

                        @csrf
                        @method('DELETE')

                        <button
                            type="button"
                            class="small danger delete-btn"
                            data-modal="delete-modal-{{ $task->id }}"
                        >
                            Delete
                        </button>

                        {{-- MODAL --}}
                        <div
                            class="delete-modal"
                            id="delete-modal-{{ $task->id }}"
                        >

                            <div class="delete-box">

                                <h2>
                                    Delete Task
                                </h2>

                                <p>

                                    Are you sure you want to delete
                                    <strong>{{ $task->title }}</strong> ?

                                </p>

                                <div class="delete-actions">

                                    <button
                                        type="submit"
                                        class="small danger"
                                    >
                                        Yes Delete
                                    </button>

                                    <button
                                        type="button"
                                        class="small cancel-btn"
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>

                        </div>

                    </form>

                </div>

            </div>

        @empty

            <p class="muted">
                No tasks found.
            </p>

        @endforelse

    </div>

</div>

{{-- MODAL SCRIPT --}}
<script>

document.querySelectorAll('.delete-btn').forEach(button => {

    button.addEventListener('click', () => {

        const modalId = button.dataset.modal;

        document
            .getElementById(modalId)
            .classList
            .add('active');

    });

});

document.querySelectorAll('.cancel-btn').forEach(button => {

    button.addEventListener('click', () => {

        button
            .closest('.delete-modal')
            .classList
            .remove('active');

    });

});

window.addEventListener('click', (e) => {

    if(e.target.classList.contains('delete-modal')){

        e.target.classList.remove('active');

    }

});

</script>

@endsection