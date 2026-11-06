<?php
require_once dirname(__DIR__) . '/config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Metode tidak diizinkan.');
}
verify_csrf();
unset($_SESSION['admin_access_token'], $_SESSION['admin_user_id']);
session_regenerate_id(true);
flash('success', 'Anda sudah keluar.');
redirect('admin/login.php');
