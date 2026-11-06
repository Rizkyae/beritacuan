<?php
declare(strict_types=1);

$dotenvPath = __DIR__ . '/.env';
if (is_file($dotenvPath) && is_readable($dotenvPath)) {
    foreach (file($dotenvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim(trim($value), "\"'");
        if (preg_match('/^[A-Z][A-Z0-9_]*$/', $name)) {
            putenv($name . '=' . $value);
            $_ENV[$name] = $value;
        }
    }
}

$scriptDirectory = str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/')));
$scriptDirectory = $scriptDirectory === '/' || $scriptDirectory === '.' ? '' : rtrim($scriptDirectory, '/');
if (str_ends_with($scriptDirectory, '/admin')) {
    $scriptDirectory = substr($scriptDirectory, 0, -6);
}

define('APP_NAME', 'BERITA CUAN');
define('APP_URL', rtrim(getenv('APP_URL') ?: 'http://localhost' . $scriptDirectory, '/'));
define('SUPABASE_URL', rtrim(getenv('SUPABASE_URL') ?: '', '/'));
define('SUPABASE_ANON_KEY', getenv('SUPABASE_ANON_KEY') ?: '');
define('WHATSAPP_NUMBER', getenv('WHATSAPP_NUMBER') ?: '');
define('CURRENCY', 'IDR');

if (session_status() !== PHP_SESSION_ACTIVE) {
    ini_set('session.use_strict_mode', '1');
    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
    ]);
    session_start();
}

require_once __DIR__ . '/app/SupabaseClient.php';
require_once __DIR__ . '/app/helpers.php';

$supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
