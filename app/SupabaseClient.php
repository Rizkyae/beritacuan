<?php
declare(strict_types=1);

final class SupabaseClient
{
    public function __construct(
        private readonly string $url,
        private readonly string $anonKey
    ) {
    }

    public function request(
        string $method,
        string $path,
        ?array $payload = null,
        ?string $accessToken = null,
        array $query = [],
        string $prefer = 'return=representation'
    ): array {
        if ($this->url === '' || $this->anonKey === '') {
            throw new RuntimeException('Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_ANON_KEY.');
        }
        if (!extension_loaded('curl')) {
            throw new RuntimeException('Ekstensi PHP cURL harus diaktifkan.');
        }

        $url = $this->url . '/rest/v1/' . ltrim($path, '/');
        if ($query !== []) {
            $url .= '?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986);
        }
        $headers = [
            'apikey: ' . $this->anonKey,
            'Authorization: Bearer ' . ($accessToken ?: $this->anonKey),
            'Content-Type: application/json',
            'Accept: application/json',
            'Prefer: ' . $prefer,
        ];

        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_CUSTOMREQUEST => strtoupper($method),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 15,
        ]);
        if ($payload !== null) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($payload, JSON_THROW_ON_ERROR));
        }

        $response = curl_exec($curl);
        if ($response === false) {
            $message = curl_error($curl);
            curl_close($curl);
            throw new RuntimeException('Koneksi ke Supabase gagal: ' . $message);
        }
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        $decoded = $response === '' ? [] : json_decode($response, true);

        if ($status < 200 || $status >= 300) {
            $message = is_array($decoded)
                ? ($decoded['message'] ?? $decoded['msg'] ?? $decoded['error_description'] ?? 'Permintaan Supabase gagal.')
                : 'Permintaan Supabase gagal.';
            throw new RuntimeException((string) $message);
        }
        return is_array($decoded) ? $decoded : [];
    }

    public function auth(string $path, array $payload): array
    {
        if ($this->url === '' || $this->anonKey === '') {
            throw new RuntimeException('Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_ANON_KEY.');
        }
        if (!extension_loaded('curl')) {
            throw new RuntimeException('Ekstensi PHP cURL harus diaktifkan.');
        }
        $curl = curl_init($this->url . '/auth/v1/' . ltrim($path, '/'));
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'apikey: ' . $this->anonKey,
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_THROW_ON_ERROR),
            CURLOPT_TIMEOUT => 15,
        ]);
        $response = curl_exec($curl);
        if ($response === false) {
            $message = curl_error($curl);
            curl_close($curl);
            throw new RuntimeException('Koneksi autentikasi Supabase gagal: ' . $message);
        }
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        $decoded = json_decode($response, true);
        if ($status < 200 || $status >= 300 || !is_array($decoded)) {
            $message = is_array($decoded)
                ? ($decoded['msg'] ?? $decoded['message'] ?? $decoded['error_description'] ?? 'Login gagal.')
                : 'Login gagal.';
            throw new RuntimeException((string) $message);
        }
        return $decoded;
    }
}
