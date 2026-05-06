<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRegistration extends Model
{
    protected $table = 'userRegistration';

    protected $fillable = [
        'name',
        'email',
        'cnic',
        'telephone',
        'comments',
        'profile_picture',
    ];
}