document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Selectors ---
    // Basicamente, a gente "cacheia" os elementos do HTML que vamos manipular.
    // Fica mais organizado e um tiquinho mais rápido do que ficar buscando toda hora.
    const newsList = document.querySelector('.news-list');
    const quotesTableBody = document.querySelector('.quotes tbody');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const amountInput = document.getElementById('converter-amount');
    const resultText = document.getElementById('converter-result-text');
    const resultValue = document.getElementById('converter-result-value');
    const swapButton = document.querySelector('.swap');
    const refreshButton = document.querySelector('.refresh-btn');

    // --- Application State ---
    // Aqui a gente guarda os dados que o app precisa pra funcionar.
    let exchangeRates = {}; // Um objeto vazio pra guardar as cotações que vêm da API.
    // Uma lista das moedas que a gente considera "principais" pra mostrar na tabela e nos selects.
    const mainCurrencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'BRL'];
    
    // Um "dicionário" com infos extras das moedas, tipo o nome completo e o código do país pra gente poder mostrar a bandeirinha.
    const currencyData = {
        'USD': { name: 'US Dollar', country: 'us' },
        'EUR': { name: 'Euro', country: 'eu' },
        'JPY': { name: 'Japanese Yen', country: 'jp' },
        'GBP': { name: 'British Pound', country: 'gb' },
        'AUD': { name: 'Australian Dollar', country: 'au' },
        'CAD': { name: 'Canadian Dollar', country: 'ca' },
        'CHF': { name: 'Swiss Franc', country: 'ch' },
        'CNY': { name: 'Chinese Yuan', country: 'cn' },
        'HKD': { name: 'Hong Kong Dollar', country: 'hk' },
        'NZD': { name: 'New Zealand Dollar', country: 'nz' },
        'SEK': { name: 'Swedish Krona', country: 'se' },
        'KRW': { name: 'South Korean Won', country: 'kr' },
        'SGD': { name: 'Singapore Dollar', country: 'sg' },
        'NOK': { name: 'Norwegian Krone', country: 'no' },
        'BRL': { name: 'Brazilian Real', country: 'br' },
    };

    // --- Fetch Functions ---
    // Funções que buscam os dados lá no nosso back-end.
    async function fetchNews() {
        try {
            const response = await fetch('/api/news'); // Bate no nosso endpoint /api/news
            if (!response.ok) throw new Error('A resposta da rede não foi ok'); // Tratamento básico de erro de HTTP
            const data = await response.json();
            renderNews(data.articles); // Se deu bom, manda os artigos pra função que renderiza na tela.
        } catch (error) {
            console.error('Erro ao buscar notícias:', error);
            newsList.innerHTML = '<li>Não foi possível carregar as notícias.</li>'; // Se deu ruim, avisa o usuário.
        }
    }

    async function fetchExchangeRates() {
        try {
            const response = await fetch('/api/exchange'); // Mesma coisa, mas pras cotações.
            if (!response.ok) throw new Error('A resposta da rede não foi ok');
            const data = await response.json();
            exchangeRates = data.conversion_rates; // Guarda o objeto com as cotações no nosso estado.
            // Depois de pegar os dados, a gente chama as funções que atualizam a tela.
            renderQuotesTable();
            populateConverterSelects();
            updateConversion();
        } catch (error) {
            console.error('Erro ao buscar taxas de câmbio:', error);
            quotesTableBody.innerHTML = '<tr><td colspan="3">Não foi possível carregar as cotações.</td></tr>';
        }
    }

    // --- Render Functions ---
    // Funções que pegam os dados e transformam em HTML.
    function renderNews(articles) {
        newsList.innerHTML = ''; // Limpa a lista antes de adicionar as novas notícias.
        articles.slice(0, 10).forEach(article => { // Pega só as 10 primeiras pra não lotar a tela.
            const li = document.createElement('li');
            const timeAgo = getTimeAgo(new Date(article.publishedAt)); // Calcula há quanto tempo a notícia foi publicada.
            li.innerHTML = `
                <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                    <strong>${article.title}</strong>
                    <small>${article.source.name} · ${timeAgo}</small>
                </a>
            `;
            newsList.appendChild(li);
        });
    }

    function renderQuotesTable() {
        quotesTableBody.innerHTML = ''; // Limpa a tabela.
        const currenciesToShow = mainCurrencies.filter(c => c !== 'USD'); // Tira o Dólar da lista, já que ele é a base.

        currenciesToShow.forEach(currency => {
            const details = currencyData[currency];
            if (exchangeRates[currency] && details) {
                const tr = document.createElement('tr');
                const rate = exchangeRates[currency]; // A cotação já vem pronta da API (vs USD).
                // Essa parte da variação é só um charme visual, um número aleatório pra simular que tá mudando.
                const variation = (Math.random() * 0.2 - 0.1).toFixed(2);
                const variationClass = variation >= 0 ? 'up' : 'down';
                const variationIcon = variation >= 0 ? '▲' : '▼';

                tr.innerHTML = `
                    <td class="currency">
                        <img class="flag-icon" src="https://flagcdn.com/w20/${details.country}.png" alt="Bandeira de ${details.country}">
                        <div>
                            <strong>${currency}</strong><br>
                            <small>${details.name}</small>
                        </div>
                    </td>
                    <td>${rate.toFixed(4)}</td>
                    <td class="${variationClass}">${variationIcon} ${Math.abs(variation)}%</td>
                `;
                quotesTableBody.appendChild(tr);
            }
        });
    }

    function populateConverterSelects() {
        // Pega os dois <select> e preenche com as moedas da nossa lista `mainCurrencies`.
        [fromCurrencySelect, toCurrencySelect].forEach(select => {
            select.innerHTML = '';
            mainCurrencies.forEach(currency => {
                const details = currencyData[currency];
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = `${currency} - ${details.name}`;
                select.appendChild(option);
            });
        });
        // Deixa o conversor com valores padrão pra começar.
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'BRL';
    }

    // --- Converter Logic ---
    // A função que faz a conta de conversão acontecer.
    function updateConversion() {
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

        // Se não tiver número no input ou se as moedas não existirem, não faz nada.
        if (isNaN(amount) || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
            resultValue.textContent = '-';
            return;
        }
        
        // A mágica da conversão. Como a API nos dá tudo em relação ao USD, a gente faz uma regra de três simples.
        const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
        const convertedAmount = (amount * rate).toFixed(4);

        resultText.textContent = `${amount} ${fromCurrency} =`;
        resultValue.textContent = `${convertedAmount} ${toCurrency}`;
    }

    function swapCurrencies() {
        // Troca os valores dos selects. Bem simples.
        const fromValue = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = fromValue;
        updateConversion(); // E chama a conversão de novo pra atualizar o resultado.
    }

    // --- Helper Functions ---
    // Uma funçãozinha pra mostrar o tempo de forma amigável (ex: "5h ago").
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000; if (interval > 1) return `${Math.floor(interval)} years ago`;
        interval = seconds / 2592000; if (interval > 1) return `${Math.floor(interval)} months ago`;
        interval = seconds / 86400; if (interval > 1) return `${Math.floor(interval)}d ago`;
        interval = seconds / 3600; if (interval > 1) return `${Math.floor(interval)}h ago`;
        interval = seconds / 60; if (interval > 1) return `${Math.floor(interval)}min ago`;
        return `${Math.floor(seconds)}s ago`;
    }

    // --- Initialization & Events ---
    // A função que "liga" o app.
    function init() {
        // Busca os dados iniciais assim que a página carrega.
        fetchNews();
        fetchExchangeRates();

        // Adiciona os "escutadores" de eventos. Quando o usuário interage, eles chamam as funções certas.
        amountInput.addEventListener('input', updateConversion);
        fromCurrencySelect.addEventListener('change', updateConversion);
        toCurrencySelect.addEventListener('change', updateConversion);
        swapButton.addEventListener('click', swapCurrencies);
        refreshButton.addEventListener('click', () => {
            // O botão de refresh simplesmente chama as funções de busca de novo.
            fetchNews();
            fetchExchangeRates();
        });
    }

    init(); // Chama a função inicial pra tudo começar a funcionar!
});
