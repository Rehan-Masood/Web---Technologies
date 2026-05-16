<x-guest-layout>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07111f] via-[#111827] to-[#2d1746] px-6">
        <div class="w-full max-w-md p-8 rounded-[2rem] bg-white/10 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div class="text-center mb-8">
                <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-3xl font-black">✓</div>
                <h1 class="text-4xl font-black text-white mt-4">Create Account</h1>
                <p class="text-slate-400">Start managing tasks professionally</p>
            </div>

            <form method="POST" action="{{ route('register') }}" class="space-y-5">
                @csrf

                <div>
                    <label class="text-white font-semibold">Full Name</label>
                    <input name="name" type="text" value="{{ old('name') }}" required minlength="3" maxlength="50"
                        pattern="[A-Za-z\s]+"
                        title="Name must contain only letters and spaces"
                        class="mt-2 w-full rounded-2xl bg-[#0f172a] border border-white/10 text-white px-5 py-4 focus:ring-2 focus:ring-cyan-400">
                    <x-input-error :messages="$errors->get('name')" class="mt-2" />
                </div>

                <div>
                    <label class="text-white font-semibold">Email Address</label>
                    <input name="email" type="email" value="{{ old('email') }}" required
                        pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                        title="Enter a valid email address"
                        class="mt-2 w-full rounded-2xl bg-[#0f172a] border border-white/10 text-white px-5 py-4 focus:ring-2 focus:ring-cyan-400">
                    <x-input-error :messages="$errors->get('email')" class="mt-2" />
                </div>

                <div>
                    <label class="text-white font-semibold">Password</label>
                    <input name="password" type="password" required minlength="8"
                        pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                        title="Password must contain uppercase, lowercase, number and minimum 8 characters"
                        class="mt-2 w-full rounded-2xl bg-[#0f172a] border border-white/10 text-white px-5 py-4 focus:ring-2 focus:ring-cyan-400">
                    <x-input-error :messages="$errors->get('password')" class="mt-2" />
                </div>

                <div>
                    <label class="text-white font-semibold">Confirm Password</label>
                    <input name="password_confirmation" type="password" required minlength="8"
                        class="mt-2 w-full rounded-2xl bg-[#0f172a] border border-white/10 text-white px-5 py-4 focus:ring-2 focus:ring-cyan-400">
                    <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
                </div>

                <button class="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white font-black text-lg">
                    Register
                </button>

                <p class="text-center text-slate-400">
                    Already have an account?
                    <a href="{{ route('login') }}" class="text-cyan-300 font-bold">Login</a>
                </p>
            </form>
        </div>
    </div>
</x-guest-layout>