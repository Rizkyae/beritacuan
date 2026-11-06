<?php
require_once dirname(__DIR__) . '/config.php';
require_admin();
$token = admin_token();
$error = '';
$categories = ['pilihan', 'politik', 'crypto', 'meme', 'meme_politik'];
$editing = null;
if (isset($_GET['edit']) && is_string($_GET['edit'])) {
    $rows = fetch_rows($supabase, 'posts', ['select' => '*', 'id' => 'eq.' . $_GET['edit'], 'limit' => '1'], $token);
    $editing = $rows[0] ?? null;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    try {
        $action = form_value('action');
        if ($action === 'delete') {
            $supabase->request('DELETE', 'posts', null, $token, ['id' => 'eq.' . form_value('id')]);
            flash('success', 'Berita berhasil dihapus.');
            redirect('admin/manage-posts.php');
        }
        $title = form_value('title');
        $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', form_value('slug') ?: $title), '-'));
        $category = form_value('category');
        $content = form_value('content');
        $thumbnail = form_value('thumbnail_url');
        if ($title === '' || $content === '' || !in_array($category, $categories, true) || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            throw new RuntimeException('Lengkapi judul, isi, kategori, dan slug yang valid.');
        }
        if ($thumbnail !== '' && !filter_var($thumbnail, FILTER_VALIDATE_URL)) throw new RuntimeException('URL gambar tidak valid.');
        $data = ['title' => $title, 'slug' => $slug, 'content' => $content, 'category' => $category, 'thumbnail_url' => $thumbnail !== '' ? $thumbnail : null];
        if (form_value('id') !== '') {
            $supabase->request('PATCH', 'posts', $data, $token, ['id' => 'eq.' . form_value('id')]);
            flash('success', 'Berita berhasil diperbarui.');
        } else {
            $supabase->request('POST', 'posts', $data, $token);
            flash('success', 'Berita berhasil ditambahkan.');
        }
        redirect('admin/manage-posts.php');
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        $error = $exception->getMessage();
    }
}
$posts = fetch_rows($supabase, 'posts', ['select' => '*', 'order' => 'created_at.desc', 'limit' => '100'], $token);
$adminPage = 'posts';
$adminTitle = 'Berita & Meme';
require __DIR__ . '/_layout.php';
?>
<?php if ($error !== ''): ?><div class="alert alert-error"><?= e($error) ?></div><?php endif; ?>
<section class="admin-panel"><h2><?= $editing ? 'Edit konten' : 'Tambah konten' ?></h2><form method="post"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="id" value="<?= e($editing['id'] ?? '') ?>"><div class="form-grid"><div class="field"><label>Judul</label><input name="title" required value="<?= e($editing['title'] ?? form_value('title')) ?>"></div><div class="field"><label>Slug (kosongkan untuk otomatis)</label><input name="slug" value="<?= e($editing['slug'] ?? form_value('slug')) ?>"></div><div class="field"><label>Kategori</label><select name="category"><?php foreach ($categories as $category): ?><option value="<?= e($category) ?>" <?= ($editing['category'] ?? form_value('category', 'pilihan')) === $category ? 'selected' : '' ?>><?= e(category_label($category)) ?></option><?php endforeach; ?></select></div><div class="field"><label>URL gambar (opsional)</label><input type="url" name="thumbnail_url" value="<?= e($editing['thumbnail_url'] ?? form_value('thumbnail_url')) ?>"></div><div class="field full"><label>Isi berita</label><textarea name="content" required><?= e($editing['content'] ?? form_value('content')) ?></textarea></div></div><button class="button button-dark" type="submit"><?= $editing ? 'Simpan perubahan' : 'Terbitkan berita' ?></button><?php if ($editing): ?> <a class="button" href="<?= e(url('admin/manage-posts.php')) ?>">Batal</a><?php endif; ?></form></section>
<section class="admin-panel"><h2>Daftar konten</h2><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Judul</th><th>Kategori</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody><?php foreach ($posts as $post): ?><tr><td><?= e($post['title']) ?></td><td><?= e(category_label((string) $post['category'])) ?></td><td><?= e(date('d M Y', strtotime((string) $post['created_at']))) ?></td><td><div class="inline-actions"><a class="button button-dark button-small" href="<?= e(url('admin/manage-posts.php?edit=' . rawurlencode((string) $post['id']))) ?>">Edit</a><form method="post" onsubmit="return confirm('Hapus konten ini?')"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= e($post['id']) ?>"><button class="button button-danger button-small" type="submit">Hapus</button></form></div></td></tr><?php endforeach; ?><?php if ($posts === []): ?><tr><td colspan="4">Belum ada konten.</td></tr><?php endif; ?></tbody></table></div></section>
<?php require __DIR__ . '/_layout_end.php'; ?>
