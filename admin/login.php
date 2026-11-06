<?php
require_once dirname(__DIR__) . '/config.php';
if (admin_token() !== null) redirect('admin/dashboard.php');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $email = form_value('email');
    $password = form_value('password');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        $error = 'Email atau kata sandi tidak valid.';
    } else {
        try {
            $auth = $supabase->auth('token?grant_type=password', ['email' => $email, 'password' => $password]);
            $token = (string) ($auth['access_token'] ?? '');
            $userId = (string) ($auth['user']['id'] ?? '');
            $profile = $supabase->request('GET', 'profiles', null, $token, ['select' => 'role', 'id' => 'eq.' . $userId, 'limit' => '1']);
            if ($token === '' || ($profile[0]['role'] ?? '') !== 'admin') {
                throw new RuntimeException('Akun ini tidak memiliki akses admin.');
            }
            session_regenerate_id(true);
            $_SESSION['admin_access_token'] = $token;
            $_SESSION['admin_user_id'] = $userId;
            flash('success', 'Berhasil masuk ke dashboard.');
            redirect('admin/dashboard.php');
        } catch (Throwable $exception) {
            error_log($exception->getMessage());
            $error = 'Login gagal. Periksa email, kata sandi, konfigurasi, dan role akun.';
        }
    }
}
$flash = take_flash();
$pageTitle = 'Masuk Admin';
require dirname(__DIR__) . '/includes/header.php';
?>
<section class="login-wrap"><div class="login-card"><span class="section-kicker">Area redaksi</span><h1>Masuk admin.</h1><p>Gunakan akun Supabase yang memiliki role admin.</p><?php if ($error !== ''): ?><div class="alert alert-error"><?= e($error) ?></div><?php endif; ?><?php if ($flash): ?><div class="alert alert-<?= e($flash['type']) ?>"><?= e($flash['message']) ?></div><?php endif; ?><form method="post" action="<?= e(url('admin/login.php')) ?>"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" required></div><div class="field"><label for="password">Kata sandi</label><input id="password" name="password" type="password" autocomplete="current-password" required></div><button class="button button-dark" type="submit">Masuk →</button></form></div></section>
<?php require dirname(__DIR__) . '/includes/footer.php'; ?>
