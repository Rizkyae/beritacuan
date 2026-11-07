(() => {
    const groups = document.querySelectorAll('[data-market-group]');
    const status = document.querySelector('[data-market-status]');
    if (groups.length !== 2 || !status) return;

    const assets = [
        { symbol: 'BTC', stream: 'btcusdt@ticker' },
        { symbol: 'ETH', stream: 'ethusdt@ticker' }
    ];
    const numberFormat = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const changeFormat = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'always'
    });

    const assetMarkup = assets.map(({ symbol }) => `
        <span class="ticker-item">
            <span class="ticker-symbol">${symbol}</span>
            <b class="ticker-price" data-price="${symbol}">Menunggu harga...</b>
            <span class="ticker-change" data-change="${symbol}"></span>
        </span>`).join('');
    groups.forEach((group) => { group.innerHTML = `${assetMarkup}<span class="market-source">Sumber: Binance Spot - USDT</span>`; });

    const setStatus = (text, state) => {
        status.textContent = text;
        status.dataset.state = state;
    };

    const updateAsset = (ticker) => {
        const symbol = ticker.s?.replace(/USDT$/, '');
        const price = Number(ticker.c);
        const changePercent = Number(ticker.P);
        if (!assets.some((asset) => asset.symbol === symbol) || !Number.isFinite(price) || !Number.isFinite(changePercent)) return;

        const direction = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'flat';
        document.querySelectorAll(`[data-price="${symbol}"]`).forEach((element) => {
            element.textContent = `${numberFormat.format(price)} USDT`;
            element.dataset.direction = direction;
        });
        document.querySelectorAll(`[data-change="${symbol}"]`).forEach((element) => {
            element.textContent = `${changeFormat.format(changePercent)}%`;
            element.dataset.direction = direction;
        });
    };

    let reconnectDelay = 1000;
    let reconnectTimer;
    let socket;

    const connect = () => {
        setStatus('Menghubungkan ke feed...', 'connecting');
        try {
            socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${assets.map((asset) => asset.stream).join('/')}`);
        } catch (error) {
            console.error('Feed market tidak dapat dimulai:', error);
            setStatus('Feed tidak tersedia - mencoba ulang', 'error');
            reconnectTimer = window.setTimeout(connect, reconnectDelay);
            reconnectDelay = Math.min(reconnectDelay * 2, 30000);
            return;
        }

        socket.addEventListener('open', () => {
            reconnectDelay = 1000;
            setStatus('LIVE - Binance Spot', 'live');
        });
        socket.addEventListener('message', (event) => {
            let message;
            try {
                message = JSON.parse(event.data);
            } catch (error) {
                console.error('Data feed market tidak dapat dibaca:', error);
                return;
            }
            if (message.data) updateAsset(message.data);
        });
        socket.addEventListener('error', () => {
            setStatus('Feed terganggu - mencoba ulang', 'error');
        });
        socket.addEventListener('close', () => {
            setStatus('Terputus - mencoba ulang', 'error');
            reconnectTimer = window.setTimeout(connect, reconnectDelay);
            reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        });
    };

    connect();
    window.addEventListener('beforeunload', () => {
        window.clearTimeout(reconnectTimer);
        if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
    }, { once: true });
})();
