
<?php $upcomingTasks = $upcomingTasks ?? collect(); ?>
<?php $__env->startSection('content'); ?>
<div class="page-head"><div><h2>Welcome back, <?php echo e(auth()->user()->name); ?> 👋</h2><p>Real-time overview of your productivity dashboard.</p></div><div class="card">📅 <?php echo e(now()->format('l, F d, Y')); ?></div></div>
<div class="grid stats">
    <div class="card stat purple"><p>Total Tasks</p><h3><?php echo e($total); ?></h3></div>
    <div class="card stat blue"><p>Completed</p><h3><?php echo e($completed); ?></h3></div>
    <div class="card stat green"><p>In Progress</p><h3><?php echo e($progress); ?></h3></div>
    <div class="card stat orange"><p>Overdue</p><h3><?php echo e($overdue); ?></h3></div>
</div>
<div class="grid two-col" style="margin-top:24px">
    <div class="card"><h2>Productivity Overview</h2><canvas id="lineChart" height="130"></canvas></div>
    <div class="card"><h2>Task Breakdown</h2><canvas id="pieChart" height="180"></canvas></div>
</div>
<div class="card" style="margin-top:24px"><h2>Upcoming Tasks</h2><?php $__empty_1 = true; $__currentLoopData = $upcomingTasks; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $task): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?><div class="task-card"><div><h3 class="task-title"><?php echo e($task->title); ?></h3><p class="task-desc"><?php echo e($task->description); ?></p></div><div class="badges"><span class="badge <?php echo e(strtolower($task->priority)); ?>"><?php echo e($task->priority); ?></span><span class="badge"><?php echo e($task->due_date?->format('M d, Y')); ?></span></div></div><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?><p style="color:#94a3b8">No upcoming tasks.</p><?php endif; ?></div>
<?php $__env->stopSection(); ?>
<?php $__env->startSection('scripts'); ?>
<script>
new Chart(document.getElementById('pieChart'),{type:'doughnut',data:{labels:['Pending','In Progress','Completed'],datasets:[{data:[<?php echo e($pending); ?>,<?php echo e($progress); ?>,<?php echo e($completed); ?>],backgroundColor:['#f59e0b','#22d3ee','#34d399']}]},options:{plugins:{legend:{labels:{color:'#fff'}}}}});
new Chart(document.getElementById('lineChart'),{type:'line',data:{labels:['Low','Medium','High'],datasets:[{label:'Priority Tasks',data:[<?php echo e($low); ?>,<?php echo e($medium); ?>,<?php echo e($high); ?>],borderColor:'#8b5cf6',backgroundColor:'rgba(139,92,246,.2)',fill:true,tension:.4}]},options:{scales:{x:{ticks:{color:'#cbd5e1'}},y:{ticks:{color:'#cbd5e1'}}},plugins:{legend:{labels:{color:'#fff'}}}}});
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.premium', ['title' => 'Dashboard'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH D:\XAMP\htdocs\todo-premium\resources\views/dashboard/index.blade.php ENDPATH**/ ?>