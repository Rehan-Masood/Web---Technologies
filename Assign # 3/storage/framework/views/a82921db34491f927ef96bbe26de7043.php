

<?php $__env->startSection('content'); ?>
<section class="hero">
    <div>
        <h1>Premium Laravel To-Do List Management System</h1>
        <p>Manage tasks, priorities, deadlines, productivity, calendar and analytics in one modern dashboard.</p>

        <div class="hero-actions">
            <a href="<?php echo e(route('dashboard')); ?>" class="btn">Open Dashboard</a>
            <a href="<?php echo e(route('tasks.create')); ?>" class="btn">Create Task</a>
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
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH D:\XAMP\htdocs\todo-premium\resources\views/frontend/home.blade.php ENDPATH**/ ?>