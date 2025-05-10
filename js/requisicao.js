import axios from 'axios';
import https from 'https';

const url =
    'https://api.qedu.org.br/v1/censo/territorio?ibge_id=21&ano=2019&dependencia_id=2&ciclo_id=EM';

const options = {
    headers: {
        Accept: 'application/json',
        Authorization: 'Bearer VWFtMhR85XttcftnC0hmdPbvgf8dTPkQwDF86XpI', // não apagar
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false, // apenas para testes locais
    })
};

axios
    .get(url, options)
    .then((response) => {
        console.log(response.data);
    })
    .catch((error) => {
        if (error.response) {
            console.error('Erro na requisição:', error.response.data);
        } else if (error.request) {
            console.error('Nenhuma resposta recebida:', error.request);
        } else {
            console.error('Erro ao configurar a requisição:', error.message);
        }
    });
