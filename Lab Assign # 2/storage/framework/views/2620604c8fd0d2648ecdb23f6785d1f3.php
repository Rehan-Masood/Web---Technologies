<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit User</title>

    <style>
        * {
            box-sizing: border-box;
            font-family: 'Segoe UI', sans-serif;
        }

        body {
            margin: 0;
            background: #020617;
            color: #e5e7eb;
            min-height: 100vh;
            display: grid;
            place-items: center;
        }

        .card {
            width: 720px;
            background: linear-gradient(145deg, #020617, #0f172a);
            border: 1px solid #1e293b;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.45);
        }

        h1 {
            margin-top: 0;
            color: white;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }

        input, textarea {
            width: 100%;
            background: #020617;
            border: 1px solid #334155;
            color: white;
            padding: 13px;
            border-radius: 10px;
            outline: none;
        }

        textarea {
            height: 100px;
            resize: none;
        }

        .form-group {
            margin-bottom: 18px;
        }

        .avatar {
            width: 90px;
            height: 90px;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid #2563eb;
            margin-bottom: 12px;
        }

        .btn {
            border: none;
            padding: 12px 18px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            color: white;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .btn-back {
            background: #111827;
            border: 1px solid #334155;
            margin-left: 10px;
        }

        .error {
            background: rgba(239,68,68,0.15);
            border: 1px solid #ef4444;
            color: #fecaca;
            padding: 13px 18px;
            border-radius: 12px;
            margin-bottom: 18px;
        }
    </style>
</head>

<body>

<div class="card">
    <h1>Edit User</h1>

    <?php if($errors->any()): ?>
        <div class="error">
            <?php $__currentLoopData = $errors->all(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <div><?php echo e($error); ?></div>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </div>
    <?php endif; ?>

    <form method="POST" action="<?php echo e(route('users.update', $user->id)); ?>" enctype="multipart/form-data">
        <?php echo csrf_field(); ?>
        <?php echo method_field('PUT'); ?>

        <?php if($user->profile_picture): ?>
            <img src="<?php echo e(asset('uploads/' . $user->profile_picture)); ?>" class="avatar" alt="Photo">
        <?php endif; ?>

        <div class="grid">
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" value="<?php echo e($user->name); ?>" required>
            </div>

            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="<?php echo e($user->email); ?>" required>
            </div>

            <div class="form-group">
                <label>CNIC</label>
                <input type="text" name="cnic" value="<?php echo e($user->cnic); ?>" required>
            </div>

            <div class="form-group">
                <label>Telephone</label>
                <input type="text" name="telephone" value="<?php echo e($user->telephone); ?>" required>
            </div>
        </div>

        <div class="form-group">
            <label>Comments</label>
            <textarea name="comments"><?php echo e($user->comments); ?></textarea>
        </div>

        <div class="form-group">
            <label>Change Profile Picture</label>
            <input type="file" name="profile_picture" accept="image/*">
        </div>

        <button type="submit" class="btn btn-primary">Update User</button>
        <a href="<?php echo e(route('users.index')); ?>" class="btn btn-back">Back</a>
    </form>
</div>

</body>
</html><?php /**PATH D:\XAMP\htdocs\user-management-system\resources\views/users/edit.blade.php ENDPATH**/ ?>