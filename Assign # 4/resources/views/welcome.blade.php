<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskFlow Pro</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-[#07111f] text-white overflow-x-hidden">

<section class="min-h-screen bg-gradient-to-br from-[#07111f] via-[#111827] to-[#2d1746] px-6 py-8">
    <nav class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-2xl font-bold">✓</div>
            <div>
                <h1 class="text-3xl font-black">Task<span class="text-cyan-400">Flow</span></h1>
                <p class="text-slate-400 text-sm">Organize. Focus. Achieve.</p>
            </div>
        </div>

        <div class="flex gap-4">
            <a href="{{ route('login') }}" class="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10">Login</a>
            <a href="{{ route('register') }}" class="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 font-bold">Get Started</a>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center pt-24">
        <div>
            <span class="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-cyan-300">
                Premium Laravel To-Do Management System
            </span>

            <h2 class="text-6xl md:text-7xl font-black mt-8 leading-tight">
                Manage Tasks With  
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
                    Smart Productivity
                </span>
            </h2>

            <p class="text-xl text-slate-300 mt-6 max-w-2xl">
                A modern Laravel-based task management platform with secure authentication,
                dashboard analytics, calendar, priorities, status tracking and responsive premium UI.
            </p>

            <div class="flex flex-wrap gap-4 mt-10">
                <a href="{{ route('register') }}" class="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 font-bold text-lg shadow-lg">
                    Create Free Account
                </a>
                <a href="{{ route('login') }}" class="px-8 py-4 rounded-2xl bg-white/10 border border-white/10 font-bold text-lg">
                    Login Now
                </a>
            </div>

            <div class="grid sm:grid-cols-3 gap-4 mt-12">
                <div class="p-5 rounded-2xl bg-white/10 border border-white/10">
                    <h3 class="text-3xl font-black">100%</h3>
                    <p class="text-slate-400">Responsive</p>
                </div>
                <div class="p-5 rounded-2xl bg-white/10 border border-white/10">
                    <h3 class="text-3xl font-black">Secure</h3>
                    <p class="text-slate-400">Breeze Auth</p>
                </div>
                <div class="p-5 rounded-2xl bg-white/10 border border-white/10">
                    <h3 class="text-3xl font-black">Live</h3>
                    <p class="text-slate-400">Dashboard Stats</p>
                </div>
            </div>
        </div>

        <div class="p-6 rounded-[2rem] bg-white/10 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div class="grid grid-cols-2 gap-4">
                <div class="p-6 rounded-2xl bg-purple-500/20">
                    <p class="text-slate-300">Total Tasks</p>
                    <h3 class="text-5xl font-black mt-3">128</h3>
                </div>
                <div class="p-6 rounded-2xl bg-cyan-500/20">
                    <p class="text-slate-300">Completed</p>
                    <h3 class="text-5xl font-black mt-3">85</h3>
                </div>
                <div class="p-6 rounded-2xl bg-emerald-500/20">
                    <p class="text-slate-300">In Progress</p>
                    <h3 class="text-5xl font-black mt-3">32</h3>
                </div>
                <div class="p-6 rounded-2xl bg-orange-500/20">
                    <p class="text-slate-300">Pending</p>
                    <h3 class="text-5xl font-black mt-3">11</h3>
                </div>
            </div>

            <div class="mt-6 p-6 rounded-2xl bg-[#0f172a] border border-white/10">
                <h3 class="text-2xl font-bold mb-5">Advanced Features</h3>
                <div class="space-y-4 text-slate-300">
                    <p>✅ Task CRUD with validation</p>
                    <p>✅ Calendar due-date tracking</p>
                    <p>✅ Analytics and productivity reports</p>
                    <p>✅ Search, filters and priorities</p>
                    <p>✅ Premium responsive dashboard</p>
                </div>
            </div>
        </div>
    </div>
</section>

</body>
</html>