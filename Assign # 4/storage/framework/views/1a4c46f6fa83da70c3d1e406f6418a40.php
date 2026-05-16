
<?php $__env->startSection('content'); ?>
<div class="page-head"><div><h2>Settings</h2><p>Your account and application preferences.</p></div></div>
<div class="grid two-col"><div class="card"><h2>Profile Settings</h2><p><strong>Name:</strong> <?php echo e(auth()->user()->name); ?></p><p><strong>Email:</strong> <?php echo e(auth()->user()->email); ?></p><p><strong>Theme:</strong> Premium Dark Gradient</p><p><strong>Status:</strong> Active</p></div><div class="card"><h2>Premium Features</h2><p>✅ Responsive layout</p><p>✅ Database task CRUD</p><p>✅ Kanban drag and drop</p><p>✅ Notification bell</p><p>✅ Dashboard charts</p><p>✅ Secure Breeze authentication</p></div></div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.premium', ['title' => 'Settings'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH D:\XAMP\htdocs\todo-premium\resources\views/settings/index.blade.php ENDPATH**/ ?>