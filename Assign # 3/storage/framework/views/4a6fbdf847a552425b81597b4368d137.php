

<?php $__env->startSection('content'); ?>
<div class="page-title">
    <h1>Calendar</h1>
    <p class="muted">Tasks organized by due date.</p>
</div>

<div class="panel">
    <div class="calendar-list">
        <?php $__empty_1 = true; $__currentLoopData = $tasks; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $task): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
            <div class="calendar-card">
                <div>
                    <h3><?php echo e($task->title); ?></h3>
                    <p class="muted"><?php echo e($task->description); ?></p>
                </div>

                <span class="date-pill"><?php echo e($task->due_date); ?></span>
                <span class="badge"><?php echo e($task->priority); ?></span>
            </div>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
            <p class="muted">No calendar tasks found.</p>
        <?php endif; ?>
    </div>
</div>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH D:\XAMP\htdocs\todo-premium\resources\views/dashboard/calendar.blade.php ENDPATH**/ ?>