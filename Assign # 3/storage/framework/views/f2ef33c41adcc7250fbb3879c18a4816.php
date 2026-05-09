

<?php $__env->startSection('content'); ?>

<div class="panel-head">
    <div class="page-title">
        <h1>My Tasks</h1>
        <p class="muted">Manage all database tasks here.</p>
    </div>

    <a href="<?php echo e(route('tasks.create')); ?>" class="btn">
        + Create Task
    </a>
</div>

<form method="GET" class="filters">

    <input
        name="search"
        placeholder="Search task..."
        value="<?php echo e(request('search')); ?>"
    >

    <select name="priority">
        <option value="">All Priority</option>

        <option
            value="High"
            <?php if(request('priority') == 'High'): echo 'selected'; endif; ?>
        >
            High
        </option>

        <option
            value="Medium"
            <?php if(request('priority') == 'Medium'): echo 'selected'; endif; ?>
        >
            Medium
        </option>

        <option
            value="Low"
            <?php if(request('priority') == 'Low'): echo 'selected'; endif; ?>
        >
            Low
        </option>
    </select>

    <select name="status">

        <option value="">All Status</option>

        <option
            value="Pending"
            <?php if(request('status') == 'Pending'): echo 'selected'; endif; ?>
        >
            Pending
        </option>

        <option
            value="In Progress"
            <?php if(request('status') == 'In Progress'): echo 'selected'; endif; ?>
        >
            In Progress
        </option>

        <option
            value="Completed"
            <?php if(request('status') == 'Completed'): echo 'selected'; endif; ?>
        >
            Completed
        </option>

    </select>

    <button class="btn">
        Search
    </button>

</form>

<?php if(session('success')): ?>

    <div class="success-msg">
        <?php echo e(session('success')); ?>

    </div>

<?php endif; ?>

<div class="panel">

    <div class="task-list">

        <?php $__empty_1 = true; $__currentLoopData = $tasks; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $task): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>

            <div class="task-card">

                
                <form
                    class="task-check"
                    method="POST"
                    action="<?php echo e(route('tasks.toggle', $task)); ?>"
                >

                    <?php echo csrf_field(); ?>
                    <?php echo method_field('PATCH'); ?>

                    <button>
                        ✓
                    </button>

                </form>

                
                <div class="task-info">

                    <h3 class="<?php echo e($task->is_completed ? 'done' : ''); ?>">

                        <?php echo e($task->title); ?>


                    </h3>

                    <p>

                        <?php echo e($task->description); ?>


                    </p>

                </div>

                
                <div class="task-meta">

                    <span class="badge">

                        <?php echo e($task->category); ?>


                    </span>

                    <span class="priority-<?php echo e(strtolower($task->priority)); ?>">

                        <?php echo e($task->priority); ?>


                    </span>

                    <span>

                        <?php echo e($task->status); ?>


                    </span>

                    <span>

                        <?php echo e($task->due_date ?? 'No Date'); ?>


                    </span>

                    
                    <a
                        href="<?php echo e(route('tasks.edit', $task)); ?>"
                        class="small"
                    >
                        Edit
                    </a>

                    
                    <form
                        method="POST"
                        action="<?php echo e(route('tasks.destroy', $task)); ?>"
                    >

                        <?php echo csrf_field(); ?>
                        <?php echo method_field('DELETE'); ?>

                        <button
                            type="button"
                            class="small danger delete-btn"
                            data-modal="delete-modal-<?php echo e($task->id); ?>"
                        >
                            Delete
                        </button>

                        
                        <div
                            class="delete-modal"
                            id="delete-modal-<?php echo e($task->id); ?>"
                        >

                            <div class="delete-box">

                                <h2>
                                    Delete Task
                                </h2>

                                <p>

                                    Are you sure you want to delete
                                    <strong><?php echo e($task->title); ?></strong> ?

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

        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>

            <p class="muted">
                No tasks found.
            </p>

        <?php endif; ?>

    </div>

</div>


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

<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH D:\XAMP\htdocs\todo-premium\resources\views/tasks/index.blade.php ENDPATH**/ ?>