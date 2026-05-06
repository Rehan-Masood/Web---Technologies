<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User Management System</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', sans-serif;
        }

        body {
            background: #020617;
            color: #e5e7eb;
        }

        .app {
            display: flex;
            min-height: 100vh;
        }

        .sidebar {
            width: 260px;
            background: linear-gradient(180deg, #020617, #0f172a);
            border-right: 1px solid #1e293b;
            padding: 25px 18px;
            position: fixed;
            height: 100vh;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 35px;
        }

        .logo-icon {
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            border-radius: 15px;
            display: grid;
            place-items: center;
            font-size: 24px;
        }

        .logo h2 {
            font-size: 22px;
        }

        .logo span {
            font-size: 13px;
            color: #94a3b8;
        }

        .nav a {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #cbd5e1;
            text-decoration: none;
            padding: 15px;
            border-radius: 14px;
            margin-bottom: 10px;
            transition: 0.3s;
            font-weight: 500;
        }

        .nav a.active,
        .nav a:hover {
            background: linear-gradient(135deg, #2563eb, #4f46e5, #7c3aed);
            color: white;
            box-shadow: 0 0 25px rgba(37, 99, 235, 0.5);
        }

        .secure-card {
            margin-top: 90px;
            background: linear-gradient(135deg, rgba(79,70,229,0.25), rgba(124,58,237,0.15));
            border: 1px solid #312e81;
            border-radius: 18px;
            padding: 22px;
        }

        .secure-card h3 {
            margin-bottom: 10px;
        }

        .secure-card p {
            color: #cbd5e1;
            font-size: 14px;
            line-height: 1.6;
        }

        .main {
            margin-left: 260px;
            width: calc(100% - 260px);
            padding: 25px;
        }

        .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            border-bottom: 1px solid #1e293b;
            padding-bottom: 20px;
        }

        .topbar h1 {
            font-size: 28px;
            color: white;
        }

        .top-search input {
            width: 330px;
            background: #020617;
            border: 1px solid #1e293b;
            color: white;
            padding: 13px 18px;
            border-radius: 12px;
            outline: none;
        }

        .cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 18px;
            margin-bottom: 22px;
        }

        .stat-card {
            background: linear-gradient(145deg, #020617, #0f172a);
            border: 1px solid #1e293b;
            border-radius: 18px;
            padding: 25px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }

        .stat-card h2 {
            font-size: 30px;
            color: white;
            margin-bottom: 6px;
        }

        .stat-card p {
            color: #94a3b8;
            margin-bottom: 8px;
        }

        .stat-card span {
            color: #22c55e;
            font-size: 13px;
        }

        .grid {
            display: grid;
            grid-template-columns: 2fr 0.9fr;
            gap: 22px;
        }

        .panel {
            background: linear-gradient(145deg, #020617, #0f172a);
            border: 1px solid #1e293b;
            border-radius: 18px;
            padding: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.25);
            margin-bottom: 22px;
        }

        .panel h2 {
            color: white;
            font-size: 20px;
            margin-bottom: 22px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
        }

        .form-group {
            margin-bottom: 17px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #e5e7eb;
            font-weight: 500;
            font-size: 14px;
        }

        input, textarea {
            width: 100%;
            background: #020617;
            border: 1px solid #334155;
            color: white;
            padding: 13px 15px;
            border-radius: 10px;
            outline: none;
        }

        input:focus, textarea:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }

        textarea {
            height: 95px;
            resize: none;
        }

        .upload-box {
            border: 1px dashed #475569;
            border-radius: 14px;
            padding: 28px;
            text-align: center;
            color: #94a3b8;
            background: rgba(15,23,42,0.6);
        }

        .btn {
            border: none;
            padding: 12px 18px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            color: white;
        }

        .btn-primary {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            box-shadow: 0 0 25px rgba(37,99,235,0.45);
        }

        .btn-edit {
            background: rgba(37,99,235,0.15);
            border: 1px solid #2563eb;
            color: #60a5fa;
            padding: 7px 12px;
            font-size: 13px;
        }

        .btn-delete {
            background: rgba(239,68,68,0.15);
            border: 1px solid #ef4444;
            color: #f87171;
            padding: 7px 12px;
            font-size: 13px;
        }

        .btn-reset {
            background: #111827;
            border: 1px solid #334155;
            color: #e5e7eb;
            width: 100%;
            margin-top: 12px;
            text-align: center;
        }

        .success {
            background: rgba(34,197,94,0.15);
            border: 1px solid #22c55e;
            color: #86efac;
            padding: 13px 18px;
            border-radius: 12px;
            margin-bottom: 18px;
        }

        .error {
            background: rgba(239,68,68,0.15);
            border: 1px solid #ef4444;
            color: #fecaca;
            padding: 13px 18px;
            border-radius: 12px;
            margin-bottom: 18px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 14px 10px;
            border-bottom: 1px solid #1e293b;
            text-align: left;
            font-size: 14px;
        }

        th {
            color: #cbd5e1;
            font-weight: 600;
        }

        td {
            color: #e5e7eb;
        }

        .avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #2563eb;
        }

        .placeholder-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            display: grid;
            place-items: center;
            color: white;
            font-weight: bold;
        }

        .search-result {
            background: rgba(34,197,94,0.15);
            color: #86efac;
            padding: 14px;
            border-radius: 12px;
            border: 1px solid rgba(34,197,94,0.4);
            margin-top: 15px;
            font-size: 14px;
        }

        .activity-item, .status-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 13px 0;
            border-bottom: 1px solid #1e293b;
            font-size: 14px;
        }

        .activity-item small {
            color: #94a3b8;
        }

        .online {
            color: #22c55e;
        }

        .modal-bg {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.65);
            z-index: 999;
            align-items: center;
            justify-content: center;
        }

        .modal {
            width: 380px;
            background: #020617;
            border: 1px solid #334155;
            border-radius: 18px;
            padding: 28px;
            text-align: center;
            box-shadow: 0 30px 80px rgba(0,0,0,0.6);
        }

        .modal h2 {
            margin-bottom: 10px;
        }

        .modal p {
            color: #94a3b8;
            margin-bottom: 20px;
        }

        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .cancel {
            background: #111827;
            border: 1px solid #334155;
        }

        .danger {
            background: #dc2626;
        }

        .pagination {
            margin-top: 18px;
        }

        .pagination nav {
            display: flex;
            justify-content: flex-end;
        }

        .pagination svg {
            width: 20px;
        }

        @media(max-width: 1100px) {
            .cards, .grid, .form-grid {
                grid-template-columns: 1fr;
            }

            .sidebar {
                position: relative;
                width: 100%;
                height: auto;
            }

            .main {
                margin-left: 0;
                width: 100%;
            }

            .app {
                flex-direction: column;
            }

            .topbar {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }

            .top-search input {
                width: 100%;
            }

            table {
                display: block;
                overflow-x: auto;
            }
        }
    </style>
</head>

<body>
<div class="app">

    <aside class="sidebar">
        <div class="logo">
            <div class="logo-icon">👥</div>
            <div>
                <h2>UMS</h2>
                <span>Laravel</span>
            </div>
        </div>

        <div class="nav">
            <a href="{{ route('users.index') }}" class="active">🏠 Dashboard</a>
            <a href="#register">👤 Register User</a>
            <a href="#users">👥 Users List</a>
            <a href="#search">🔍 Search</a>
            <a href="#">📊 Reports</a>
            <a href="#">⚙ Settings</a>
        </div>

        <div class="secure-card">
            <h3>🛡 Secure & Reliable</h3>
            <p>Your data is protected with enterprise-grade security and Laravel validation.</p>
        </div>
    </aside>

    <main class="main">
        <div class="topbar">
            <h1>User Management System</h1>
            <form class="top-search" method="GET" action="{{ route('users.index') }}">
                <input type="text" name="email" value="{{ $search }}" placeholder="Search users, emails...">
            </form>
        </div>

        @if(session('success'))
            <div class="success">{{ session('success') }}</div>
        @endif

        @if($errors->any())
            <div class="error">
                @foreach($errors->all() as $error)
                    <div>{{ $error }}</div>
                @endforeach
            </div>
        @endif

        <section class="cards">
            <div class="stat-card">
                <h2>{{ $totalUsers }}</h2>
                <p>Total Users</p>
                <span>↑ 12.5% vs last month</span>
            </div>

            <div class="stat-card">
                <h2>{{ $activeUsers }}</h2>
                <p>Active Users</p>
                <span>↑ 8.4% vs last month</span>
            </div>

            <div class="stat-card">
                <h2>{{ $newRegistrations }}</h2>
                <p>New Registrations Today</p>
                <span>↑ Live database data</span>
            </div>

            <div class="stat-card">
                <h2>24.6 GB</h2>
                <p>Storage Used</p>
                <span>38% of 64 GB</span>
            </div>
        </section>

        <section class="grid">
            <div>
                <div class="panel" id="register">
                    <h2>👤 Register New User</h2>

                    <form method="POST" action="{{ route('users.store') }}" enctype="multipart/form-data">
                        @csrf

                        <div class="form-grid">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" name="name" placeholder="Enter full name" required>
                            </div>

                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" placeholder="Enter email address" required>
                            </div>

                            <div class="form-group">
                                <label>CNIC</label>
                                <input type="text" name="cnic" placeholder="Enter CNIC e.g. 12345-1234567-1" required>
                            </div>

                            <div class="form-group">
                                <label>Telephone</label>
                                <input type="text" name="telephone" placeholder="Enter telephone number" required>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label>Comments</label>
                                <textarea name="comments" placeholder="Enter any additional comments..."></textarea>
                            </div>

                            <div class="form-group">
                                <label>Profile Picture</label>
                                <div class="upload-box">
                                    <p>☁ Click to upload or drag and drop</p>
                                    <br>
                                    <input type="file" name="profile_picture" accept="image/*">
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary">+ Create User</button>
                    </form>
                </div>

                <div class="panel" id="users">
                    <h2>👥 Users List</h2>

                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>CNIC</th>
                            <th>Telephone</th>
                            <th>Comments</th>
                            <th>Photo</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        @forelse($users as $user)
                            <tr>
                                <td>{{ $user->name }}</td>
                                <td>{{ $user->email }}</td>
                                <td>{{ $user->cnic }}</td>
                                <td>{{ $user->telephone }}</td>
                                <td>{{ $user->comments }}</td>
                                <td>
                                    @if($user->profile_picture)
                                        <img class="avatar" src="{{ asset('uploads/' . $user->profile_picture) }}" alt="Photo">
                                    @else
                                        <div class="placeholder-avatar">{{ strtoupper(substr($user->name, 0, 1)) }}</div>
                                    @endif
                                </td>
                                <td>
                                    <a href="{{ route('users.edit', $user->id) }}" class="btn btn-edit">Edit</a>

                                    <button type="button"
                                            class="btn btn-delete"
                                            onclick="confirmDelete('{{ route('users.destroy', $user->id) }}')">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7">No users found.</td>
                            </tr>
                        @endforelse
                        </tbody>
                    </table>

                    <div class="pagination">
                        {{ $users->links() }}
                    </div>
                </div>
            </div>

            <div>
                <div class="panel" id="search">
                    <h2>🔍 Search Users</h2>

                    <form method="GET" action="{{ route('users.index') }}">
                        <input type="text" name="email" value="{{ $search }}" placeholder="Search by email address...">
                        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:12px;">Search</button>
                        <a href="{{ route('users.index') }}" class="btn btn-reset">Reset Filters</a>
                    </form>

                    <div class="search-result">
                        Showing {{ $users->count() }} result(s)
                    </div>
                </div>

                <div class="panel">
                    <h2>⚡ Recent Activity</h2>

                    @foreach($users->take(4) as $user)
                        <div class="activity-item">
                            <div>
                                <strong>{{ $user->name }}</strong><br>
                                <small>{{ $user->email }}</small>
                            </div>
                            <small>{{ $user->created_at->diffForHumans() }}</small>
                        </div>
                    @endforeach
                </div>

                <div class="panel">
                    <h2>✅ System Status</h2>

                    <div class="status-row">
                        <span>Application</span>
                        <span class="online">Online</span>
                    </div>

                    <div class="status-row">
                        <span>Database</span>
                        <span class="online">Online</span>
                    </div>

                    <div class="status-row">
                        <span>Storage</span>
                        <span>24.6 GB / 64 GB</span>
                    </div>

                    <div class="status-row">
                        <span>Mail Server</span>
                        <span class="online">Online</span>
                    </div>
                </div>
            </div>
        </section>
    </main>
</div>

<div class="modal-bg" id="deleteModal">
    <div class="modal">
        <h2>⚠ Delete User</h2>
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>

        <div class="modal-actions">
            <button class="btn cancel" onclick="closeModal()">Cancel</button>

            <form id="deleteForm" method="POST">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn danger">Yes, Delete</button>
            </form>
        </div>
    </div>
</div>

<script>
    function confirmDelete(url) {
        document.getElementById('deleteForm').action = url;
        document.getElementById('deleteModal').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('deleteModal').style.display = 'none';
    }
</script>

</body>
</html>