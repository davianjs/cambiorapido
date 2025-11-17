# Visão Geral do Projeto

Este é um agregador de notícias de negócios e cotações de câmbio, feito pra te dar um panorama rápido do mercado financeiro. Ele é construído em Node.js com o framework Express.

O back-end serve os arquivos estáticos do front-end e expõe dois endpoints de API: um para buscar as últimas notícias de negócios nos EUA e outro para obter as cotações de câmbio mais recentes em relação ao dólar.

## Funcionalidades

*   **API de Notícias:** Busca as principais manchetes de negócios diretamente da [NewsAPI](https://newsapi.org).
*   **API de Câmbio:** Fornece taxas de câmbio atualizadas usando a [ExchangeRate-API](https://www.exchangerate-api.com).
*   **Front-end Simples:** Uma página HTML com JavaScript e CSS que consome as APIs do back-end e exibe as informações de forma clara.
*   **Servidor Express:** Um servidor simples e eficiente para gerenciar as rotas e servir o conteúdo.

## Primeiros Passos

Para rodar este projeto na sua máquina, você vai precisar do Node.js instalado.

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   Um editor de código (como o VS Code)
*   Um terminal (como o Git Bash, PowerShell ou o terminal integrado do seu editor)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```

2.  **Instale as dependências:**
    O `npm` (gerenciador de pacotes do Node) vai ler o arquivo `package.json` e baixar tudo o que o projeto precisa.
    ```bash
    npm install
    ```

### Configurando as Variáveis de Ambiente

Para que o aplicativo possa acessar as APIs externas, você precisa das suas chaves de acesso.

1.  **Crie um arquivo `.env`** na raiz do projeto. É aqui que suas chaves secretas vão ficar, seguras e fora do controle de versão.

2.  **Adicione suas chaves ao arquivo `.env`:**
    ```
    NEWS_API_KEY="SUA_CHAVE_DA_NEWSAPI"
    EXCHANGE_RATE_API_KEY="SUA_CHAVE_DA_EXCHANGERATEAPI"
    ```

    *   Você pode obter uma chave gratuita para a [NewsAPI aqui](https://newsapi.org/register).
    *   E para a [ExchangeRate-API aqui](https://www.exchangerate-api.com/pricing).

### Rodando o Projeto

Com tudo instalado e configurado, basta iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Isso vai usar o `nodemon` para iniciar o servidor. A vantagem do `nodemon` é que ele fica "escutando" qualquer alteração nos arquivos e reinicia o servidor automaticamente pra você.

Agora, abra seu navegador e acesse `http://localhost:3000`. Você deverá ver a página com as notícias e as cotações carregadas!

## Documentação da API

O back-end expõe duas rotas principais:

### `GET /api/news`

*   **O que faz:** Retorna as últimas notícias de negócios dos Estados Unidos.
*   **Como usar:** Basta fazer uma requisição GET para `http://localhost:3000/api/news`.
*   **Resposta (Sucesso):** Um objeto JSON contendo uma lista de artigos, no formato fornecido pela NewsAPI.
    ```json
    {
      "status": "ok",
      "totalResults": 38,
      "articles": [
        {
          "source": { "id": "...", "name": "..." },
          "author": "...",
          "title": "...",
          "description": "...",
          "url": "...",
          "urlToImage": "...",
          "publishedAt": "...",
          "content": "..."
        }
      ]
    }
    ```
*   **Resposta (Erro):** Se algo der errado ao buscar as notícias, retorna um status 500 com uma mensagem de erro.
    ```json
    {
      "message": "Falha ao buscar notícias."
    }
    ```

### `GET /api/exchange`

*   **O que faz:** Retorna as taxas de câmbio mais recentes, com o Dólar Americano (USD) como moeda base.
*   **Como usar:** Faça uma requisição GET para `http://localhost:3000/api/exchange`.
*   **Resposta (Sucesso):** Um objeto JSON com as taxas de conversão, no formato da ExchangeRate-API.
    ```json
    {
      "result": "success",
      "base_code": "USD",
      "conversion_rates": {
        "USD": 1,
        "EUR": 0.92,
        "BRL": 5.15,
        "JPY": 157.2
        // ... e outras moedas
      }
    }
    ```
*   **Resposta (Erro):** Se a busca falhar, retorna um status 500.
    ```json
    {
      "message": "Falha ao buscar taxas de câmbio."
    }
    ```

## Estrutura do Projeto

```
.
├── .env.example         # Exemplo de como seu arquivo .env deve ser
├── .gitignore           # Arquivos e pastas ignorados pelo Git
├── package.json         # Dependências e scripts do projeto
├── server.js            # O coração do back-end: servidor Express e rotas da API
└── src
    ├── index.html       # A estrutura da nossa página web
    ├── index.js         # O JavaScript do front-end, que chama as APIs
    └── style.css        # Onde a mágica do design acontece
```

*   `server.js`: É aqui que a mágica do back-end acontece. Ele usa o Express para criar um servidor, define as rotas `/api/news` e `/api/exchange`, busca os dados nas APIs externas e os envia para o front-end. Ele também é responsável por servir os arquivos estáticos da pasta `src`.
*   `src/index.html`: A estrutura HTML da página.
*   `src/index.js`: Este script é executado no navegador do usuário. Ele faz as chamadas (`fetch`) para as APIs do nosso back-end, recebe os dados (JSON) e os insere dinamicamente no HTML.
*   `src/style.css`: Deixa a página mais bonita e organizada.

É isso! Um projeto simples, mas que cobre conceitos importantes como desenvolvimento back-end com Node.js, consumo de APIs de terceiros e a conexão entre front-end e back-end. Sinta-se à vontade para explorar, modificar e expandir!
