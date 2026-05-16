
<?php $__env->startSection('content'); ?>
<div class="page-head"><div><h2>Kanban Board</h2><p>Drag and drop tasks between workflow stages.</p></div><a href="<?php echo e(route('tasks.create')); ?>" class="btn">+ New Task</a></div>
<div class="kanban-grid">
    <div class="kanban-column"><h3>Pending</h3><div class="kanban-list" data-status="Pending"><?php $__currentLoopData = $pendingTasks; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $task): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?> <?php echo $__env->make('kanban.card',['task'=>$task], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?> <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?></div></div>
    <div class="kanban-column"><h3>In Progress</h3><div class="kanban-list" data-status="In Progress"><?php $__currentLoopData = $progressTasks; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $task): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?> <?php echo $__env->make('kanban.card',['task'=>$task], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?> <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?></div></div>
    <div class="kanban-column"><h3>Completed</h3><div class="kanban-list" data-status="Completed"><?php $__currentLoopData = $completedTasks; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $task): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?> <?php echo $__env->make('kanban.card',['task'=>$task], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?> <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?></div></div>
</div>
<?php $__env->stopSection(); ?>
<?php $__env->startSection('scripts'); ?>
<script>
document.querySelectorAll('.kanban-list').forEach(list=>{new Sortable(list,{group:'tasks',animation:200,ghostClass:'dragging',onAdd:e=>{fetch(`/tasks/${e.item.dataset.id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':'<?php echo e(csrf_token()); ?>','Accept':'application/json'},body:JSON.stringify({status:e.to.dataset.status})})}})});
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.premium', ['title' => 'Kanban Board'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH D:\XAMP\htdocs\todo-premium\resources\views/kanban/index.blade.php ENDPATH**/ ?>