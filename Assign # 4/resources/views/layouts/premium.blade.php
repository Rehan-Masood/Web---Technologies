<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'TaskFlow Premium' }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
    <style>
        :root{--bg:#07111f;--panel:#101b2f;--panel2:#16243b;--border:#263855;--muted:#94a3b8;--text:#f8fafc;--cyan:#22d3ee;--purple:#8b5cf6;--pink:#e879f9;--green:#34d399;--orange:#fb923c;--red:#fb7185;--yellow:#facc15}
        *{box-sizing:border-box} html,body{margin:0;min-height:100%;overflow:hidden} body{background:radial-gradient(circle at top right,#321d45 0,#07111f 38%,#050b14 100%);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Arial,sans-serif}.app{display:grid;grid-template-columns:280px 1fr;height:100vh;overflow:hidden}.sidebar{height:100vh;padding:24px;background:rgba(15,23,42,.92);border-right:1px solid var(--border);backdrop-filter:blur(18px);overflow-y:auto}.brand{display:flex;gap:14px;align-items:center;margin-bottom:32px}.logo{width:58px;height:58px;border-radius:18px;background:linear-gradient(135deg,#d946ef,#22d3ee);display:grid;place-items:center;font-size:34px;font-weight:900;box-shadow:0 18px 45px rgba(139,92,246,.35)}.brand h1{font-size:28px;margin:0}.brand h1 span{color:var(--cyan)}.brand p{margin:3px 0 0;color:var(--muted)}.nav{display:flex;flex-direction:column;gap:10px}.nav a{display:flex;align-items:center;gap:12px;padding:14px 16px;color:#cbd5e1;text-decoration:none;border-radius:16px;font-size:16px;border:1px solid transparent;transition:.2s}.nav a:hover,.nav a.active{background:linear-gradient(90deg,rgba(139,92,246,.65),rgba(37,99,235,.25));border-color:rgba(139,92,246,.35);transform:translateX(4px)}.user-card{margin-top:28px;padding:18px;border-radius:20px;background:rgba(30,41,59,.75);border:1px solid var(--border);color:var(--muted)}.user-card strong{display:block;color:white;margin-top:4px}.main{height:100vh;min-width:0;overflow-y:auto}.topbar{height:86px;border-bottom:1px solid var(--border);background:rgba(15,23,42,.78);backdrop-filter:blur(18px);display:flex;align-items:center;justify-content:space-between;padding:0 32px;position:sticky;top:0;z-index:10}.search{width:min(420px,45vw);background:#0b1324;border:1px solid var(--border);border-radius:18px;color:white;padding:16px 20px;font-size:15px;outline:none}.search:focus{border-color:var(--purple);box-shadow:0 0 0 4px rgba(139,92,246,.15)}.btn{border:0;border-radius:16px;padding:14px 22px;font-weight:800;color:white;background:linear-gradient(135deg,#e879f9,#8b5cf6,#22d3ee);text-decoration:none;display:inline-flex;align-items:center;gap:8px;cursor:pointer}.btn.secondary{background:#18243a;border:1px solid var(--border)}.btn.danger{background:linear-gradient(135deg,#ef4444,#fb923c)}.actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.content{padding:34px}.page-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:26px}.page-head h2{font-size:44px;line-height:1.05;margin:0 0 8px}.page-head p{color:#9db7d8;font-size:18px;margin:0}.grid{display:grid;gap:20px}.stats{grid-template-columns:repeat(4,minmax(0,1fr))}.card{background:linear-gradient(145deg,rgba(30,41,59,.9),rgba(15,23,42,.88));border:1px solid var(--border);border-radius:24px;padding:24px;box-shadow:0 24px 70px rgba(0,0,0,.22)}.stat{min-height:150px;position:relative;overflow:hidden}.stat:after{content:"";position:absolute;inset:auto -30px -40px auto;width:110px;height:110px;border-radius:999px;background:rgba(255,255,255,.08)}.stat p{margin:0;color:#cbd5e1;font-size:17px}.stat h3{font-size:42px;margin:18px 0 0}.purple{background:linear-gradient(145deg,#3b1d68,#131c31)}.blue{background:linear-gradient(145deg,#173b76,#111c30)}.green{background:linear-gradient(145deg,#0f5b4c,#102033)}.orange{background:linear-gradient(145deg,#71351d,#111c30)}.two-col{grid-template-columns:1.3fr .9fr}.form-grid{display:grid;gap:18px}.field label{display:block;margin-bottom:8px;color:#cbd5e1;font-weight:700}.input,.select,.textarea{width:100%;border:1px solid var(--border);background:#0b1324;color:white;border-radius:16px;padding:15px 16px;font-size:15px;outline:none}.input:focus,.select:focus,.textarea:focus{border-color:var(--purple);box-shadow:0 0 0 4px rgba(139,92,246,.15)}.textarea{min-height:130px}.task-card{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;margin-bottom:14px;background:rgba(15,23,42,.7);border:1px solid var(--border);border-radius:20px;padding:18px}.task-title{font-size:22px;font-weight:900;margin:0}.task-desc{color:var(--muted);margin:6px 0 0}.badges{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.badge{padding:8px 12px;border-radius:999px;font-weight:800;background:#263855;color:white}.badge.high{color:#fb7185}.badge.medium{color:#facc15}.badge.low{color:#34d399}.badge.pending{background:rgba(245,158,11,.16);color:#fbbf24}.badge.in-progress{background:rgba(34,211,238,.16);color:#67e8f9}.badge.completed{background:rgba(52,211,153,.16);color:#6ee7b7}.alert{padding:16px 18px;border:1px solid #22c55e;border-radius:16px;background:rgba(34,197,94,.13);margin-bottom:20px}.filters{display:grid;grid-template-columns:1fr 220px 220px auto;gap:14px;margin-bottom:24px}.kanban-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.kanban-column{background:rgba(30,41,59,.76);border:1px solid var(--border);border-radius:24px;padding:20px;min-height:560px}.kanban-column h3{margin:0 0 16px;font-size:22px}.kanban-list{min-height:460px;display:flex;flex-direction:column;gap:14px}.kanban-card{background:linear-gradient(145deg,rgba(15,23,42,.95),rgba(30,41,59,.9));border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:18px;cursor:grab;transition:.25s}.kanban-card:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(0,0,0,.25)}.kanban-card h4{margin:0;font-size:19px}.kanban-card p{color:var(--muted);margin:8px 0 14px}.dragging{opacity:.45}.notify{position:relative}.notify-btn{width:50px;height:50px;border-radius:16px;background:#18243a;border:1px solid var(--border);color:white;font-size:20px;cursor:pointer}.notify-badge{position:absolute;top:-6px;right:-6px;background:#ef4444;color:white;border-radius:999px;font-size:12px;font-weight:900;padding:3px 7px}.notify-menu{display:none;position:absolute;right:0;top:60px;width:320px;background:#101b2f;border:1px solid var(--border);border-radius:20px;padding:16px;box-shadow:0 24px 60px rgba(0,0,0,.35)}.notify.open .notify-menu{display:block}.notify-item{padding:12px;border-radius:14px;background:rgba(15,23,42,.9);margin-bottom:10px;color:#cbd5e1}.mobile-toggle{display:none}@media(max-width:1100px){.stats,.two-col,.kanban-grid{grid-template-columns:1fr}.filters{grid-template-columns:1fr}}@media(max-width:980px){html,body{overflow:auto}.app{display:block;height:auto}.sidebar{position:fixed;z-index:30;transform:translateX(-105%);transition:.25s;width:280px}.sidebar.open{transform:none}.main{height:auto;overflow:visible}.mobile-toggle{display:inline-flex}.topbar{padding:0 16px}.content{padding:22px}.page-head{flex-direction:column}.page-head h2{font-size:34px}.search{display:none}.task-card{grid-template-columns:1fr}.notify-menu{right:-90px}}
    </style>
</head>
<body>
<div class="app">
    <aside class="sidebar" id="sidebar">
        <div class="brand"><div class="logo">✓</div><div><h1>Task<span>Flow</span></h1><p>Organize. Focus. Achieve.</p></div></div>
        <nav class="nav">
            <a class="{{ request()->routeIs('dashboard') ? 'active' : '' }}" href="{{ route('dashboard') }}">📊 Dashboard</a>
            <a class="{{ request()->routeIs('tasks.index') ? 'active' : '' }}" href="{{ route('tasks.index') }}">✅ Tasks</a>
            <a class="{{ request()->routeIs('tasks.create') ? 'active' : '' }}" href="{{ route('tasks.create') }}">➕ Create Task</a>
            <a class="{{ request()->routeIs('kanban') ? 'active' : '' }}" href="{{ route('kanban') }}">🗂 Kanban Board</a>
            <a class="{{ request()->routeIs('calendar') ? 'active' : '' }}" href="{{ route('calendar') }}">📅 Calendar</a>
            <a class="{{ request()->routeIs('analytics') ? 'active' : '' }}" href="{{ route('analytics') }}">📈 Analytics</a>
            <a class="{{ request()->routeIs('settings') ? 'active' : '' }}" href="{{ route('settings') }}">⚙️ Settings</a>
        </nav>
        <div class="user-card">Logged in as <strong>{{ auth()->user()->name }}</strong><span>{{ auth()->user()->email }}</span></div>
    </aside>
    <main class="main">
        <header class="topbar">
            <button class="btn secondary mobile-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
            <input class="search" placeholder="Search tasks, projects..." onkeydown="if(event.key==='Enter'){location.href='{{ route('tasks.index') }}?search='+encodeURIComponent(this.value)}">
            <div class="actions">
                <div class="notify" id="notifyBox">
                    <button class="notify-btn" type="button" onclick="document.getElementById('notifyBox').classList.toggle('open')">🔔</button>
                    @if(($notificationCount ?? 0) > 0)<span class="notify-badge">{{ $notificationCount }}</span>@endif
                    <div class="notify-menu">
                        <h3 style="margin:0 0 12px">Notifications</h3>
                        @forelse(($notifications ?? collect()) as $note)
                            <div class="notify-item">{{ $note }}</div>
                        @empty
                            <div class="notify-item">No new notifications.</div>
                        @endforelse
                    </div>
                </div>
                <a class="btn" href="{{ route('tasks.create') }}">+ New Task</a>
                <form method="POST" action="{{ route('logout') }}">@csrf<button class="btn secondary">Logout</button></form>
            </div>
        </header>
        <section class="content">
            @if(session('success'))<div class="alert">{{ session('success') }}</div>@endif
            @yield('content')
        </section>
    </main>
</div>
@yield('scripts')
</body>
</html>
