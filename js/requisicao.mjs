import axios from 'axios';
import https from 'https';

const token = 'VWFtMhR85XttcftnC0hmdPbvgf8dTPkQwDF86XpI'

async function dadosIdeb() {
    const categoria = [2019, 2017, 2015, 2013, 2011];
    const mediasIdeb = [];

    const agent = new https.Agent({ rejectUnauthorized: false }); // apenas para testes

    for (let ano of categoria) {
        const url = `https://api.qedu.org.br/v1/ideb?id=21&ano=${ano}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                },
                httpsAgent: agent // ignora certificado inválido
            });

            const dados = response.data;

            if (Array.isArray(dados) && dados.length > 0) {
                const somaIdeb = dados.reduce((soma, item) => soma + parseFloat(item.ideb), 0);
                const media = somaIdeb / dados.length;
                mediasIdeb.push(media.toFixed(2));
            } else {
                console.warn(`Ano ${ano} não retornou dados válidos.`);
                mediasIdeb.push(0);
            }

        } catch (error) {
            console.error(`Erro ao buscar dados do ano ${ano}:`, error.message);
            mediasIdeb.push(null);
        }
    }

    console.log(mediasIdeb);
    return mediasIdeb;
}

dadosIdeb()

