import express from 'express'; // O Express, nosso framework web. O "corpo" do projeto.
import axios from 'axios';   // O Axios, pra gente fazer as chamadas pras APIs externas (notícias e câmbio).
import cors from 'cors';       // O CORS, pra liberar o acesso do nosso front-end que roda em outra porta.
import dotenv from 'dotenv';   // O Dotenv, pra carregar as variáveis de ambiente do arquivo .env (nossas chaves secretas).
import path from 'path';       // O Path, pra lidar com caminhos de arquivos de um jeito mais seguro.
import { fileURLToPath } from 'url'; // E essa duplinha aqui é um truque pra gente conseguir usar o __dirname com ES Modules.

// carrega as variáveis do .env pra gente poder usar no código.
dotenv.config();

// verificação simples pra evitar dor de cabeça, se esquecer de botar as chaves no .env, o app já quebra na hora avisando
if (!process.env.NEWS_API_KEY || !process.env.EXCHANGE_RATE_API_KEY) {
    throw new Error('Opa! Parece que faltou a NEWS_API_KEY ou a EXCHANGE_RATE_API_KEY no arquivo .env');
}

// Inicializa o Express
const app = express();

// Esse bloco aqui é só pra dizer pro Express onde estão nossos arquivos do front-end (HTML, CSS, JS).
// O __filename e __dirname tão aqui pra garantir que ele ache a pasta 'src' sem erro, não importa de onde você rode o script.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'src')));
app.use(cors()); // Habilita o CORS pra todas as rotas. Sem estresse.


// Endpoint simples que o nosso front vai chamar
app.get('/api/news', async (req, res) => {
    try {
        // Usa o axios pra bater lá na NewsAPI e pegar as notícias de negócios dos EUA.
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${process.env.NEWS_API_KEY}`);
        
        // Se deu tudo certo, a gente só repassa o JSON que a API mandou direto pro nosso front.
        res.json(response.data);

    } catch (error) {
        // Se der ruim na chamada, a gente loga o erro no console do servidor e manda um 500 pro front saber que deu B.O.
        console.error('Deu ruim ao buscar notícias na NewsAPI:', error.message);
        res.status(500).json({ message: 'Falha ao buscar notícias.' });
    }
});


// --- Rota de Câmbio ---
// Mesma lógica da rota de notícias, só que pra cotações.
app.get('/api/exchange', async (req, res) => {
    try {
        // Bate na API de câmbio pra pegar as taxas mais recentes, usando o Dólar (USD) como base.
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`);
        
        // Deu bom? Manda o JSON com as cotações pro front.
        res.json(response.data);

    } catch (error) {
        // Deu ruim? Loga no servidor e avisa o front.
        console.error('Deu ruim ao buscar taxas de câmbio:', error.message);
        res.status(500).json({ message: 'Falha ao buscar taxas de câmbio.' });
    }
});


// Aqui a gente define a porta que o servidor vai "escutar".
// Ele tenta pegar a porta do ambiente (útil pra produção), mas se não tiver, usa a 3000 por padrão.
const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
    
    // E finalmente sobe o servidor e avisa no console que tá tudo no ar
    console.log(`Servidor rodando liso em http://localhost:${port}`);
});
