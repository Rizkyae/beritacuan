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

    document.querySelectorAll('[data-faq-button]').forEach((button) => {
        button.addEventListener('click', () => {
            const answer = document.getElementById(button.getAttribute('aria-controls'));
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            answer.hidden = expanded;
            button.querySelector('[data-faq-icon]').textContent = expanded ? '+' : '−';
        });
    });

    document.querySelectorAll('[data-reaction]').forEach((button) => {
        const key = `bc-like-${button.dataset.reaction}`;
        const count = button.querySelector('[data-reaction-count]');
        let likes = Number(localStorage.getItem(key) || 0);
        count.textContent = String(Number(button.dataset.likes || 0) + likes);
        button.setAttribute('aria-pressed', String(likes > 0));
        button.addEventListener('click', () => {
            likes = likes ? 0 : 1;
            localStorage.setItem(key, String(likes));
            count.textContent = String(Number(button.dataset.likes || 0) + likes);
            button.setAttribute('aria-pressed', String(likes > 0));
        });
    });
});
