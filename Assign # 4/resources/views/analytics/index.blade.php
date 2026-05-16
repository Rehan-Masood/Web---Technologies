@extends('layouts.premium', ['title' => 'Analytics'])
@section('content')
<div class="page-head"><div><h2>Analytics</h2><p>Detailed productivity reports.</p></div></div>
<div class="grid stats"><div class="card stat purple"><p>Total</p><h3>{{ $total }}</h3></div><div class="card stat blue"><p>Completed</p><h3>{{ $completed }}</h3></div><div class="card stat orange"><p>Pending</p><h3>{{ $pending }}</h3></div><div class="card stat green"><p>Progress</p><h3>{{ $progress }}</h3></div></div>
<div class="card" style="margin-top:24px"><h2>Productivity Progress</h2><canvas id="analyticsChart" height="100"></canvas></div>
@endsection
@section('scripts')<script>new Chart(document.getElementById('analyticsChart'),{type:'bar',data:{labels:['Low','Medium','High','Pending','Progress','Completed'],datasets:[{label:'Tasks',data:[{{ $low }},{{ $medium }},{{ $high }},{{ $pending }},{{ $progress }},{{ $completed }}],backgroundColor:['#34d399','#facc15','#fb7185','#f59e0b','#22d3ee','#8b5cf6']}]},options:{plugins:{legend:{labels:{color:'#fff'}}},scales:{x:{ticks:{color:'#cbd5e1'}},y:{ticks:{color:'#cbd5e1'}}}}});</script>@endsection
