<!DOCTYPE html>
<html>
<head>
    <title>TaskMaster</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
</head>
<body>

<div class="app">
    @include('layouts.sidebar')

    <main class="main">
        @yield('content')
    </main>
</div>

</body>
</html>