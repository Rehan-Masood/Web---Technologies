<aside class="sidebar">
    <div class="logo">
        <div class="logo-icon">✓</div>
        <div>
            <h2>Task<span>Master</span></h2>
            <p>Organize. Focus. Achieve.</p>
        </div>
    </div>

    <a href="{{ route('home') }}" class="nav">🏠 Home</a>
    <a href="{{ route('dashboard') }}" class="nav">📊 Dashboard</a>
    <a href="{{ route('tasks.index') }}" class="nav">🧑‍💻 My Tasks</a>
    <a href="{{ route('tasks.create') }}" class="nav">➕ Create Task</a>
    <a href="{{ route('tasks.completed') }}" class="nav">✅ Completed</a>
    <a href="{{ route('tasks.pending') }}" class="nav">🔥 Pending</a>
    <a href="{{ route('calendar') }}" class="nav">📅 Calendar</a>
    <a href="{{ route('analytics') }}" class="nav">📈 Analytics</a>
    <a href="{{ route('settings') }}" class="nav">⚙ Settings</a>
</aside>