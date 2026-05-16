<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | User Relationship
            |--------------------------------------------------------------------------
            */
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Task Information
            |--------------------------------------------------------------------------
            */
            $table->string('title');

            $table->text('description')
                  ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Category
            |--------------------------------------------------------------------------
            */
            $table->string('category')
                  ->default('General');

            /*
            |--------------------------------------------------------------------------
            | Priority System
            |--------------------------------------------------------------------------
            */
            $table->enum('priority', [
                'Low',
                'Medium',
                'High'
            ])->default('Medium');

            /*
            |--------------------------------------------------------------------------
            | Task Status
            |--------------------------------------------------------------------------
            */
            $table->enum('status', [
                'Pending',
                'In Progress',
                'Completed'
            ])->default('Pending');

            /*
            |--------------------------------------------------------------------------
            | Due Date
            |--------------------------------------------------------------------------
            */
            $table->date('due_date')
                  ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Completion Status
            |--------------------------------------------------------------------------
            */
            $table->boolean('is_completed')
                  ->default(false);

            /*
            |--------------------------------------------------------------------------
            | Premium Future Features
            |--------------------------------------------------------------------------
            */

            // Task color label
            $table->string('color')
                  ->nullable();

            // File attachments
            $table->string('attachment')
                  ->nullable();

            // Progress percentage
            $table->integer('progress')
                  ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Timestamps
            |--------------------------------------------------------------------------
            */
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};