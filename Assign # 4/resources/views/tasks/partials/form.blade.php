<div class="field"><label>Task Title</label><input class="input" name="title" value="{{ old('title', $task->title ?? '') }}" required></div>
<div class="field"><label>Description</label><textarea class="textarea" name="description">{{ old('description', $task->description ?? '') }}</textarea></div>
<div class="grid" style="grid-template-columns:repeat(3,1fr)">
<div class="field"><label>Category</label><input class="input" name="category" value="{{ old('category', $task->category ?? 'General') }}" required></div>
<div class="field"><label>Priority</label><select class="select" name="priority">@foreach(['Low','Medium','High'] as $p)<option @selected(old('priority',$task->priority ?? 'Medium')==$p)>{{ $p }}</option>@endforeach</select></div>
<div class="field"><label>Status</label><select class="select" name="status">@foreach(['Pending','In Progress','Completed'] as $s)<option @selected(old('status',$task->status ?? 'Pending')==$s)>{{ $s }}</option>@endforeach</select></div>
</div>
<div class="field"><label>Due Date</label><input class="input" type="date" name="due_date" value="{{ old('due_date', isset($task) && $task->due_date ? $task->due_date->format('Y-m-d') : '') }}"></div>
@if($errors->any())<div class="alert" style="border-color:#fb7185;background:rgba(251,113,133,.12)">@foreach($errors->all() as $error)<div>{{ $error }}</div>@endforeach</div>@endif
<button class="btn" style="justify-content:center">{{ $button }}</button>
