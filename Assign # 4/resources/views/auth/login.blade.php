<x-guest-layout>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07111f] via-[#111827] to-[#2d1746] px-6">
        <div class="w-full max-w-md p-8 rounded-[2rem] bg-white/10 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div class="text-center mb-8">
                <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-3xl font-black">✓</div>
                <h1 class="text-4xl font-black text-white mt-4">Welcome Back</h1>
                <p class="text-slate-400">Login to your TaskFlow account</p>
            </div>

            <x-auth-session-status class="mb-4" :status="session('status')" />

            <form method="POST" action="{{ route('login') }}" class="space-y-5">
                @csrf

                <div>
                    <label class="text-white font-semibold">Email Address</label>
                    <input name="email" type="email" value="{{ old('email') }}" required autofocus
                        pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                        title="Enter a valid email address"
                        class="mt-2 w-full rounded-2xl bg-[#0f172a] border border-white/10 text-white px-5 py-4 focus:ring-2 focus:ring-cyan-400">
                    <x-input-error :messages="$errors->get('email')" class="mt-2" />
                </div>

                <div>
                    <label class="text-white font-semibold">Password</label>
                    <input name="password" type="password" required minlength="8"
                        title="Password must be at least 8 characters"
                        class="mt-2 w-full rounded-2xl bg-[#0f172a] border border-white/10 text-white px-5 py-4 focus:ring-2 focus:ring-cyan-400">
                    <x-input-error :messages="$errors->get('password')" class="mt-2" />
                </div>

                <div class="flex items-center justify-between text-slate-300">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" name="remember" class="rounded bg-[#0f172a]">
                        Remember me
                    </label>

                    @if (Route::has('password.request'))
                        <a href="{{ route('password.request') }}" class="text-cyan-300 hover:underline">
                            Forgot password?
                        </a>
                    @endif
                </div>

                <button class="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white font-black text-lg">
                    Login
                </button>

                <p class="text-center text-slate-400">
                    Don’t have an account?
                    <a href="{{ route('register') }}" class="text-cyan-300 font-bold">Register</a>
                </p>
            </form>
        </div>
    </div>
</x-guest-layout>