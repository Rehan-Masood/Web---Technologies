@extends('layouts.premium', ['title' => 'Kanban Board'])
@section('content')
<div class="page-head"><div><h2>Kanban Board</h2><p>Drag and drop tasks between workflow stages.</p></div><a href="{{ route('tasks.create') }}" class="btn">+ New Task</a></div>
<div class="kanban-grid">
    <div class="kanban-column"><h3>Pending</h3><div class="kanban-list" data-status="Pending">@foreach($pendingTasks as $task) @include('kanban.card',['task'=>$task]) @endforeach</div></div>
    <div class="kanban-column"><h3>In Progress</h3><div class="kanban-list" data-status="In Progress">@foreach($progressTasks as $task) @include('kanban.card',['task'=>$task]) @endforeach</div></div>
    <div class="kanban-column"><h3>Completed</h3><div class="kanban-list" data-status="Completed">@foreach($completedTasks as $task) @include('kanban.card',['task'=>$task]) @endforeach</div></div>
</div>
@endsection
@section('scripts')
<script>
document.querySelectorAll('.kanban-list').forEach(list=>{new Sortable(list,{group:'tasks',animation:200,ghostClass:'dragging',onAdd:e=>{fetch(`/tasks/${e.item.dataset.id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':'{{ csrf_token() }}','Accept':'application/json'},body:JSON.stringify({status:e.to.dataset.status})})}})});
</script>
@endsection
