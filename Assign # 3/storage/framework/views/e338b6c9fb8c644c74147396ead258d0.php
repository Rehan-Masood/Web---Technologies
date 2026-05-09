

<?php $__env->startSection('content'); ?>
<div class="page-title">
    <h1>Edit Task</h1>
    <p class="muted">Update your task information.</p>
</div>

<form method="POST" action="<?php echo e(route('tasks.update', $task)); ?>" class="form-card">
    <?php echo csrf_field(); ?>
    <?php echo method_field('PUT'); ?>

    <input name="title" value="<?php echo e($task->title); ?>" required>
    <textarea name="description"><?php echo e($task->description); ?></textarea>

    <select name="category">
        <?php $__currentLoopData = ['Personal','Work','Study','Fitness','Shopping']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cat): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <option <?php if($task->category == $cat): echo 'selected'; endif; ?>><?php echo e($cat); ?></option>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </select>

    <select name="priority">
        <?php $__currentLoopData = ['Low','Medium','High']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $p): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <option <?php if($task->priority == $p): echo 'selected'; endif; ?>><?php echo e($p); ?></option>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </select>

    <select name="status">
        <?php $__currentLoopData = ['Pending','In Progress','Completed']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $s): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <option <?php if($task->status == $s): echo 'selected'; endif; ?>><?php echo e($s); ?></option>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </select>

    <input type="date" name="due_date" value="<?php echo e($task->due_date); ?>">

    <button class="btn">Update Task</button>
</form>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH D:\XAMP\htdocs\todo-premium\resources\views/tasks/edit.blade.php ENDPATH**/ ?>