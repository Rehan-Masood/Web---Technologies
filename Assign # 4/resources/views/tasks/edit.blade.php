@extends('layouts.premium', ['title' => 'Edit Task'])
@section('content')
<div class="page-head"><div><h2>Edit Task</h2><p>Update your task information.</p></div></div>
<form class="card form-grid" method="POST" action="{{ route('tasks.update',$task) }}">@csrf @method('PUT')
<div class="field"><label>Task Title</label><input class="input" name="title" value="{{ old('title',$task->title) }}" required minlength="3"></div>
<div class="field"><label>Description</label><textarea class="textarea" name="description">{{ old('description',$task->description) }}</textarea></div>
<div class="grid" style="grid-template-columns:repeat(3,1fr)"><div class="field"><label>Category</label><input class="input" name="category" value="{{ old('category',$task->category) }}" required></div><div class="field"><label>Priority</label><select class="select" name="priority"><option>Low</option>@foreach(['Low','Medium','High'] as $p)<option @selected(old('priority',$task->priority)==$p)>{{ $p }}</option>@endforeach<option>High</option></select></div><div class="field"><label>Status</label><select class="select" name="status">@foreach(['Pending','In Progress','Completed'] as $s)<option @selected(old('status',$task->status)==$s)>{{ $s }}</option>@endforeach</select></div></div>
<div class="field"><label>Due Date</label><input class="input" type="date" name="due_date" value="{{ old('due_date',$task->due_date?->format('Y-m-d')) }}"></div><button class="btn">Update Task</button>
</form>
@endsection
