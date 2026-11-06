<?php
require_once dirname(__DIR__) . '/config.php';
require_admin();
$token = admin_token();
$error = '';
$editing = null;
if (isset($_GET['edit']) && is_string($_GET['edit'])) {
    $rows = fetch_rows($supabase, 'faqs', ['select' => '*', 'id' => 'eq.' . $_GET['edit'], 'limit' => '1'], $token);
    $editing = $rows[0] ?? null;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    try {
        if (form_value('action') === 'delete') {
            $supabase->request('DELETE', 'faqs', null, $token, ['id' => 'eq.' . form_value('id')]);
            flash('success', 'FAQ berhasil dihapus.');
            redirect('admin/manage-faqs.php');
        }
        $question = form_value('question');
        $answer = form_value('answer');
        $order = form_value('order_num', '0');
        if ($question === '' || $answer === '' || !ctype_digit($order)) throw new RuntimeException('Pertanyaan, jawaban, dan urutan valid wajib diisi.');
        $data = ['question' => $question, 'answer' => $answer, 'order_num' => (int) $order];
        if (form_value('id') !== '') {
            $supabase->request('PATCH', 'faqs', $data, $token, ['id' => 'eq.' . form_value('id')]);
            flash('success', 'FAQ berhasil diperbarui.');
        } else {
            $supabase->request('POST', 'faqs', $data, $token);
            flash('success', 'FAQ berhasil ditambahkan.');
        }
        redirect('admin/manage-faqs.php');
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        $error = $exception->getMessage();
    }
}
$faqs = fetch_rows($supabase, 'faqs', ['select' => '*', 'order' => 'order_num.asc'], $token);
$adminPage = 'faqs';
$adminTitle = 'Kelola FAQ';
require __DIR__ . '/_layout.php';
?>
<?php if ($error !== ''): ?><div class="alert alert-error"><?= e($error) ?></div><?php endif; ?>
<section class="admin-panel"><h2><?= $editing ? 'Edit FAQ' : 'Tambah FAQ' ?></h2><form method="post"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="id" value="<?= e($editing['id'] ?? '') ?>"><div class="field"><label>Pertanyaan</label><input name="question" required value="<?= e($editing['question'] ?? form_value('question')) ?>"></div><div class="field"><label>Jawaban</label><textarea name="answer" required><?= e($editing['answer'] ?? form_value('answer')) ?></textarea></div><div class="field"><label>Urutan</label><input name="order_num" type="number" min="0" required value="<?= e($editing['order_num'] ?? form_value('order_num', '0')) ?>"></div><button class="button button-dark" type="submit"><?= $editing ? 'Simpan perubahan' : 'Tambah FAQ' ?></button><?php if ($editing): ?> <a class="button" href="<?= e(url('admin/manage-faqs.php')) ?>">Batal</a><?php endif; ?></form></section>
<section class="admin-panel"><h2>Daftar FAQ</h2><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Pertanyaan</th><th>Urutan</th><th>Aksi</th></tr></thead><tbody><?php foreach ($faqs as $faq): ?><tr><td><?= e($faq['question']) ?></td><td><?= (int) $faq['order_num'] ?></td><td><div class="inline-actions"><a class="button button-dark button-small" href="<?= e(url('admin/manage-faqs.php?edit=' . rawurlencode((string) $faq['id']))) ?>">Edit</a><form method="post" onsubmit="return confirm('Hapus FAQ ini?')"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= e($faq['id']) ?>"><button class="button button-danger button-small" type="submit">Hapus</button></form></div></td></tr><?php endforeach; ?><?php if ($faqs === []): ?><tr><td colspan="3">Belum ada FAQ.</td></tr><?php endif; ?></tbody></table></div></section>
<?php require __DIR__ . '/_layout_end.php'; ?>
