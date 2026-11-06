<?php
declare(strict_types=1);

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function url(string $path = ''): string
{
    return APP_URL . ($path !== '' ? '/' . ltrim($path, '/') : '');
}

function redirect(string $path): never
{
    header('Location: ' . url($path));
    exit;
}

function csrf_token(): string
{
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf(): void
{
    $token = $_POST['csrf_token'] ?? '';
    if (!is_string($token) || !hash_equals(csrf_token(), $token)) {
        http_response_code(419);
        exit('Sesi formulir tidak valid. Muat ulang halaman dan coba lagi.');
    }
}

function flash(string $type, string $message): void
{
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function take_flash(): ?array
{
    $message = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return is_array($message) ? $message : null;
}

function admin_token(): ?string
{
    return isset($_SESSION['admin_access_token']) ? (string) $_SESSION['admin_access_token'] : null;
}

function require_admin(): void
{
    if (admin_token() === null) {
        flash('error', 'Silakan masuk terlebih dahulu.');
        redirect('admin/login.php');
    }
}

function form_value(string $key, string $default = ''): string
{
    return isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : $default;
}

function fetch_rows(SupabaseClient $client, string $table, array $query = [], ?string $token = null): array
{
    try {
        return $client->request('GET', $table, null, $token, $query);
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        return [];
    }
}

function money(mixed $amount): string
{
    return 'Rp ' . number_format((float) $amount, 0, ',', '.');
}

function category_label(string $category): string
{
    return match ($category) {
        'pilihan' => 'Berita Pilihan',
        'politik' => 'Politik',
        'crypto' => 'Crypto',
        'meme' => 'Meme',
        'meme_politik' => 'Meme Politik',
        default => ucfirst(str_replace('_', ' ', $category)),
    };
}
