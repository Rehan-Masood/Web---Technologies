@extends('layouts.premium', ['title' => 'Create Task'])
@section('content')
<div class="page-head"><div><h2>Create Task</h2><p>Add a new task to your workspace.</p></div></div>
<form class="card form-grid" method="POST" action="{{ route('tasks.store') }}">@csrf
<div class="field"><label>Task Title</label><input class="input" name="title" value="{{ old('title') }}" required minlength="3"></div>
<div class="field"><label>Description</label><textarea class="textarea" name="description">{{ old('description') }}</textarea></div>
<div class="grid" style="grid-template-columns:repeat(3,1fr)"><div class="field"><label>Category</label><input class="input" name="category" value="{{ old('category','General') }}" required></div><div class="field"><label>Priority</label><select class="select" name="priority"><option>Low</option><option selected>Medium</option><option>High</option></select></div><div class="field"><label>Status</label><select class="select" name="status"><option selected>Pending</option><option>In Progress</option><option>Completed</option></select></div></div>
<div class="field"><label>Due Date</label><input class="input" type="date" name="due_date" value="{{ old('due_date') }}"></div><button class="btn">Save Task</button>
</form>
@endsection
