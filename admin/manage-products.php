<?php
require_once dirname(__DIR__) . '/config.php';
require_admin();
$token = admin_token();
$error = '';
$editing = null;
if (isset($_GET['edit']) && is_string($_GET['edit'])) {
    $rows = fetch_rows($supabase, 'digital_products', ['select' => '*', 'id' => 'eq.' . $_GET['edit'], 'limit' => '1'], $token);
    $editing = $rows[0] ?? null;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    try {
        if (form_value('action') === 'delete') {
            $supabase->request('DELETE', 'digital_products', null, $token, ['id' => 'eq.' . form_value('id')]);
            flash('success', 'Produk berhasil dihapus.');
            redirect('admin/manage-products.php');
        }
        $name = form_value('name');
        $price = form_value('price');
        $image = form_value('thumbnail_url');
        $link = form_value('file_url');
        if ($name === '' || !is_numeric($price) || (float) $price < 0) throw new RuntimeException('Nama dan harga produk yang valid wajib diisi.');
        if ($image !== '' && !filter_var($image, FILTER_VALIDATE_URL)) throw new RuntimeException('URL thumbnail tidak valid.');
        if ($link !== '' && !filter_var($link, FILTER_VALIDATE_URL)) throw new RuntimeException('URL produk tidak valid.');
        $data = ['name' => $name, 'description' => form_value('description'), 'price' => (float) $price, 'file_url' => $link ?: null, 'thumbnail_url' => $image ?: null];
        if (form_value('id') !== '') {
            $supabase->request('PATCH', 'digital_products', $data, $token, ['id' => 'eq.' . form_value('id')]);
            flash('success', 'Produk berhasil diperbarui.');
        } else {
            $supabase->request('POST', 'digital_products', $data, $token);
            flash('success', 'Produk berhasil ditambahkan.');
        }
        redirect('admin/manage-products.php');
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        $error = $exception->getMessage();
    }
}
$products = fetch_rows($supabase, 'digital_products', ['select' => '*', 'order' => 'created_at.desc'], $token);
$adminPage = 'products';
$adminTitle = 'Produk Digital';
require __DIR__ . '/_layout.php';
?>
<?php if ($error !== ''): ?><div class="alert alert-error"><?= e($error) ?></div><?php endif; ?>
<section class="admin-panel"><h2><?= $editing ? 'Edit produk' : 'Tambah produk' ?></h2><form method="post"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="id" value="<?= e($editing['id'] ?? '') ?>"><div class="form-grid"><div class="field"><label>Nama produk</label><input name="name" required value="<?= e($editing['name'] ?? form_value('name')) ?>"></div><div class="field"><label>Harga (IDR)</label><input name="price" type="number" min="0" step="1" required value="<?= e($editing['price'] ?? form_value('price')) ?>"></div><div class="field"><label>URL pembelian / file (opsional)</label><input name="file_url" type="url" value="<?= e($editing['file_url'] ?? form_value('file_url')) ?>"></div><div class="field"><label>URL thumbnail (opsional)</label><input name="thumbnail_url" type="url" value="<?= e($editing['thumbnail_url'] ?? form_value('thumbnail_url')) ?>"></div><div class="field full"><label>Deskripsi</label><textarea name="description"><?= e($editing['description'] ?? form_value('description')) ?></textarea></div></div><button class="button button-dark" type="submit"><?= $editing ? 'Simpan perubahan' : 'Tambah produk' ?></button><?php if ($editing): ?> <a class="button" href="<?= e(url('admin/manage-products.php')) ?>">Batal</a><?php endif; ?></form></section>
<section class="admin-panel"><h2>Daftar produk</h2><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Nama</th><th>Harga</th><th>Aksi</th></tr></thead><tbody><?php foreach ($products as $product): ?><tr><td><?= e($product['name']) ?></td><td><?= e(money($product['price'])) ?></td><td><div class="inline-actions"><a class="button button-dark button-small" href="<?= e(url('admin/manage-products.php?edit=' . rawurlencode((string) $product['id']))) ?>">Edit</a><form method="post" onsubmit="return confirm('Hapus produk ini?')"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= e($product['id']) ?>"><button class="button button-danger button-small" type="submit">Hapus</button></form></div></td></tr><?php endforeach; ?><?php if ($products === []): ?><tr><td colspan="3">Belum ada produk.</td></tr><?php endif; ?></tbody></table></div></section>
<?php require __DIR__ . '/_layout_end.php'; ?>
