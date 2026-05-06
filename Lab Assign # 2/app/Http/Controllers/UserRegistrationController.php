<?php

namespace App\Http\Controllers;

use App\Models\UserRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class UserRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->email;

        $users = UserRegistration::when($search, function ($query, $search) {
                return $query->where('email', 'LIKE', '%' . $search . '%');
            })
            ->latest()
            ->paginate(5);

        $totalUsers = UserRegistration::count();
        $activeUsers = UserRegistration::count();
        $newRegistrations = UserRegistration::whereDate('created_at', today())->count();

        return view('users.index', compact(
            'users',
            'search',
            'totalUsers',
            'activeUsers',
            'newRegistrations'
        ));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'cnic' => 'required|string|max:20',
            'telephone' => 'required|string|max:20',
            'comments' => 'nullable|string|max:1000',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $imageName = null;

        if ($request->hasFile('profile_picture')) {
            $imageName = time() . '_' . uniqid() . '.' . $request->profile_picture->extension();
            $request->profile_picture->move(public_path('uploads'), $imageName);
        }

        UserRegistration::create([
            'name' => $request->name,
            'email' => $request->email,
            'cnic' => $request->cnic,
            'telephone' => $request->telephone,
            'comments' => $request->comments,
            'profile_picture' => $imageName,
        ]);

        return redirect()->route('users.index')->with('success', 'User registered successfully.');
    }

    public function edit($id)
    {
        $user = UserRegistration::findOrFail($id);
        return view('users.edit', compact('user'));
    }

    public function update(Request $request, $id)
    {
        $user = UserRegistration::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'cnic' => 'required|string|max:20',
            'telephone' => 'required|string|max:20',
            'comments' => 'nullable|string|max:1000',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $imageName = $user->profile_picture;

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture && File::exists(public_path('uploads/' . $user->profile_picture))) {
                File::delete(public_path('uploads/' . $user->profile_picture));
            }

            $imageName = time() . '_' . uniqid() . '.' . $request->profile_picture->extension();
            $request->profile_picture->move(public_path('uploads'), $imageName);
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'cnic' => $request->cnic,
            'telephone' => $request->telephone,
            'comments' => $request->comments,
            'profile_picture' => $imageName,
        ]);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = UserRegistration::findOrFail($id);

        if ($user->profile_picture && File::exists(public_path('uploads/' . $user->profile_picture))) {
            File::delete(public_path('uploads/' . $user->profile_picture));
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}