@extends('layouts.app')

@section('content')
<h1>Analytics</h1>

<div class="stats">
    <div class="card"><h3>Total</h3><h2>{{ $total }}</h2></div>
    <div class="card"><h3>Completed</h3><h2>{{ $completed }}</h2></div>
    <div class="card"><h3>Pending</h3><h2>{{ $pending }}</h2></div>
    <div class="card"><h3>Progress</h3><h2>{{ $progress }}</h2></div>
</div>

<div class="panel">
    <h2>Productivity Progress</h2>
    <div class="progress">
        <div style="width: {{ $total > 0 ? ($completed / $total) * 100 : 0 }}%"></div>
    </div>
</div>
@endsection