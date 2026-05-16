@extends('layouts.premium', ['title' => 'Dashboard'])
@php $upcomingTasks = $upcomingTasks ?? collect(); @endphp
@section('content')
<div class="page-head"><div><h2>Welcome back, {{ auth()->user()->name }} 👋</h2><p>Real-time overview of your productivity dashboard.</p></div><div class="card">📅 {{ now()->format('l, F d, Y') }}</div></div>
<div class="grid stats">
    <div class="card stat purple"><p>Total Tasks</p><h3>{{ $total }}</h3></div>
    <div class="card stat blue"><p>Completed</p><h3>{{ $completed }}</h3></div>
    <div class="card stat green"><p>In Progress</p><h3>{{ $progress }}</h3></div>
    <div class="card stat orange"><p>Overdue</p><h3>{{ $overdue }}</h3></div>
</div>
<div class="grid two-col" style="margin-top:24px">
    <div class="card"><h2>Productivity Overview</h2><canvas id="lineChart" height="130"></canvas></div>
    <div class="card"><h2>Task Breakdown</h2><canvas id="pieChart" height="180"></canvas></div>
</div>
<div class="card" style="margin-top:24px"><h2>Upcoming Tasks</h2>@forelse($upcomingTasks as $task)<div class="task-card"><div><h3 class="task-title">{{ $task->title }}</h3><p class="task-desc">{{ $task->description }}</p></div><div class="badges"><span class="badge {{ strtolower($task->priority) }}">{{ $task->priority }}</span><span class="badge">{{ $task->due_date?->format('M d, Y') }}</span></div></div>@empty<p style="color:#94a3b8">No upcoming tasks.</p>@endforelse</div>
@endsection
@section('scripts')
<script>
new Chart(document.getElementById('pieChart'),{type:'doughnut',data:{labels:['Pending','In Progress','Completed'],datasets:[{data:[{{ $pending }},{{ $progress }},{{ $completed }}],backgroundColor:['#f59e0b','#22d3ee','#34d399']}]},options:{plugins:{legend:{labels:{color:'#fff'}}}}});
new Chart(document.getElementById('lineChart'),{type:'line',data:{labels:['Low','Medium','High'],datasets:[{label:'Priority Tasks',data:[{{ $low }},{{ $medium }},{{ $high }}],borderColor:'#8b5cf6',backgroundColor:'rgba(139,92,246,.2)',fill:true,tension:.4}]},options:{scales:{x:{ticks:{color:'#cbd5e1'}},y:{ticks:{color:'#cbd5e1'}}},plugins:{legend:{labels:{color:'#fff'}}}}});
</script>
@endsection
