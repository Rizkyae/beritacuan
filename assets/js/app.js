document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            root.dataset.theme = theme;
            localStorage.setItem('bc-theme', theme);
        });
    });

    const menuButton = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-menu]');
    if (menuButton && menu) {
        menuButton.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    document.querySelectorAll('[data-dropdown-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const dropdown = button.closest('.nav-dropdown');
            const open = dropdown.classList.toggle('open');
            button.setAttribute('aria-expanded', String(open));
        });
    });

    const searchToggle = document.querySelector('[data-search-toggle]');
    const searchPanel = document.querySelector('[data-search-panel]');
    if (searchToggle && searchPanel) {
        searchToggle.addEventListener('click', () => {
            searchPanel.hidden = !searchPanel.hidden;
            if (!searchPanel.hidden) searchPanel.querySelector('input').focus();
        });
    }

    document.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest('[data-faq-button]');
        if (button) {
            const answer = document.getElementById(button.getAttribute('aria-controls'));
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            answer.hidden = expanded;
            button.querySelector('[data-faq-icon]').textContent = expanded ? '+' : '−';
            return;
        }

        const reactionButton = event.target.closest('[data-reaction]');
        if (!reactionButton) return;
        const likeButton = reactionButton;
        const key = `bc-like-${likeButton.dataset.reaction}`;
        const count = likeButton.querySelector('[data-reaction-count]');
        let likes = 0;
        try {
            likes = Number(localStorage.getItem(key) || 0);
        } catch {
            likes = 0;
        }
        count.textContent = String(Number(likeButton.dataset.likes || 0) + likes);
        likeButton.setAttribute('aria-pressed', String(likes > 0));
        const nextLikes = likes ? 0 : 1;
        try {
            localStorage.setItem(key, String(nextLikes));
        } catch {
            return;
        }
        count.textContent = String(Number(likeButton.dataset.likes || 0) + nextLikes);
        likeButton.setAttribute('aria-pressed', String(nextLikes > 0));
    });
});
