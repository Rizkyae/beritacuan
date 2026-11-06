// Isi dengan Project URL dan anon/publishable key Supabase Anda.
// Jangan pernah meletakkan service_role key di file frontend.
window.BERITA_CUAN_SUPABASE = Object.freeze({
    url: 'https://kixjhtlakxrqzowpkhgs.supabase.co',
    anonKey: 'sb_publishable_Zhcee5LNtx4hZ8SZX2rT5w_Xr7qmx3w',
    whatsappNumber: '6281357441144'
});

window.BERITA_CUAN_ADSENSE = Object.freeze({
    clientId: '',
    slotId: ''
});

window.BERITA_CUAN_API = Object.freeze({
    isConfigured() {
        return Boolean(window.BERITA_CUAN_SUPABASE.url && window.BERITA_CUAN_SUPABASE.anonKey);
    },

    async select(table, query = {}) {
        if (!this.isConfigured()) {
            throw new Error('Supabase belum dikonfigurasi. Isi Project URL dan anon key di assets/js/supabase.js.');
        }

        const url = new URL(`${window.BERITA_CUAN_SUPABASE.url.replace(/\/+$/, '')}/rest/v1/${encodeURIComponent(table)}`);
        Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, String(value)));
        const response = await fetch(url, {
            headers: {
                apikey: window.BERITA_CUAN_SUPABASE.anonKey,
                Authorization: `Bearer ${window.BERITA_CUAN_SUPABASE.anonKey}`,
                Accept: 'application/json'
            }
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(result?.message || result?.msg || `Supabase mengembalikan HTTP ${response.status}.`);
        }
        if (!Array.isArray(result)) {
            throw new Error('Format data Supabase tidak sesuai.');
        }
        return result;
    },

    async rpc(name, payload) {
        if (!this.isConfigured()) {
            throw new Error('Supabase belum dikonfigurasi. Isi Project URL dan anon key di assets/js/supabase.js.');
        }
        const response = await fetch(`${window.BERITA_CUAN_SUPABASE.url.replace(/\/+$/, '')}/rest/v1/rpc/${encodeURIComponent(name)}`, {
            method: 'POST',
            headers: {
                apikey: window.BERITA_CUAN_SUPABASE.anonKey,
                Authorization: `Bearer ${window.BERITA_CUAN_SUPABASE.anonKey}`,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const result = await response.json().catch(() => null);
            throw new Error(result?.message || result?.msg || `Supabase mengembalikan HTTP ${response.status}.`);
        }
    }
});
