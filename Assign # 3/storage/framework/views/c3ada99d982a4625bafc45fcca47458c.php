<!DOCTYPE html>
<html>
<head>
    <title>TaskMaster</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="<?php echo e(asset('css/app.css')); ?>">
</head>
<body>

<div class="app">
    <?php echo $__env->make('layouts.sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <main class="main">
        <?php echo $__env->yieldContent('content'); ?>
    </main>
</div>

</body>
</html><?php /**PATH D:\XAMP\htdocs\todo-premium\resources\views/layouts/app.blade.php ENDPATH**/ ?>