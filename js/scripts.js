
// Função para verificar se o elemento está visível na tela
const collapse = document.getElementById('collapse')
const nav = document.getElementById('nav')
const ancora = document.querySelectorAll('nav a')

// Verifica se collapse e nav existem antes de adicionar eventos
if (collapse && nav) {
  collapse.addEventListener('click', () => {
    nav.classList.toggle('collapse-true')
    collapse.classList.toggle('open')
  })
}
// filtros aplicaves
const estadoSelect = document.getElementById('estado');
const cidadeSelect = document.getElementById('cidade');

// Carrega os estados do Brasil
fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
.then(res => res.json())
.then(estados => {
  let maranhaoId = null;

  estados.forEach(estado => {
    const opt = document.createElement('option');
    opt.value = estado.id;
    opt.textContent = estado.nome;

    if (estado.sigla === 'MA') {
      opt.selected = true; 
      maranhaoId = estado.id;
    }

    estadoSelect.appendChild(opt);
  });

  
  if (maranhaoId) {
    carregarCidades(maranhaoId);
    carregarGraficos()
  }
});


function carregarCidades(estadoId) {
  cidadeSelect.innerHTML = '<option value="">Carregando...</option>';

  fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`)
    .then(res => res.json())
    .then(cidades => {
      cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>';
      cidades.forEach(cidade => {
        const opt = document.createElement('option');
        opt.value = cidade.id;
        opt.textContent = cidade.nome;
        cidadeSelect.appendChild(opt);
      });
    });
}

// Quando um estado for selecionado, carrega as cidades
estadoSelect.addEventListener('change', () => {
  const estadoId = estadoSelect.value;
  if (estadoId) {
    carregarCidades(estadoId);
    carregarGraficos()
  }
});

// tratamento dos dados
const token = 'VWFtMhR85XttcftnC0hmdPbvgf8dTPkQwDF86XpI';

async function dadosIdeb() {
  const categoria = [2019, 2017, 2015, 2013, 2011];
  const mediasIdeb = [];
  let estadoId = estadoSelect.value ||21; // maranhao
  let cidadeId = cidadeSelect.value;
  let codigoIbge = cidadeId != ''? estadoId: estadoId;

  for (let ano of categoria) {
    const url = `https://api.qedu.org.br/v1/ideb?id=${codigoIbge}&ano=${ano}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const dados = json.data; // <-- Corrigido aqui

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
  return mediasIdeb;
}


async function dadoAcessoInternet() {
  const errorMsg = document.getElementById('error-ideb');
  const categoria = [2024, 2023, 2022, 2021, 2020];
  const porcentagemInternet = [];
  const porcentagemBandaLarga = [];

  let estadoId = estadoSelect.value || 21;
  let cidadeId = cidadeSelect.value;
  let codigoIbge = cidadeId !== '' ? cidadeId : estadoId;

  const urls = categoria.map(ano =>
    `https://api.qedu.org.br/v1/censo/territorio?ano=${ano}&ibge_id=${codigoIbge}`
  );

  try {
    const responses = await Promise.all(
      urls.map(url =>
        fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      )
    );

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];

      if (!response.ok) {
        errorMsg.innerHTML = 'Erro ao fazer requisição dos dados de acesso à internet.';
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const dados = json.data;

      if (Array.isArray(dados) && dados.length > 0) {
        const totalEscolas = dados.reduce((soma, item) => soma + (item.qtd_escolas || 0), 0);
        const totalInternet = dados.reduce((soma, item) => soma + (item.tecnologia_internet || 0), 0);
        const totalBandaLarga = dados.reduce((soma, item) => soma + (item.tecnologia_banda_larga || 0), 0);

        if (totalEscolas > 0) {
          const porcentInternet = (totalInternet / totalEscolas) * 100;
          const porcentBandaLarga = (totalBandaLarga / totalEscolas) * 100;

          porcentagemInternet.push(porcentInternet.toFixed(2));
          porcentagemBandaLarga.push(porcentBandaLarga.toFixed(2));
        } else {
          porcentagemInternet.push(0);
          porcentagemBandaLarga.push(0);
        }
      } else {
        porcentagemInternet.push(0);
        porcentagemBandaLarga.push(0);
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error.message);
    errorMsg.innerHTML = 'Erro ao carregar os dados de acesso à internet.';
    categoria.forEach(() => {
      porcentagemInternet.push(null);
      porcentagemBandaLarga.push(null);
    });
  }

  return {
    anos: categoria,
    internet: porcentagemInternet,
    bandaLarga: porcentagemBandaLarga
  };
}

async function dadoInfraestrutura() {
  const errorMsg = document.getElementById('error-Infraestrutura');
  const ano = document.getElementById('ano').value || 2024;
  let estadoId = estadoSelect.value || 21; // Maranhão
  let cidadeId = cidadeSelect.value;
  let codigoIbge = cidadeId !== '' ? cidadeId : estadoId;

  // dados retornados
  let soma_acessibilidade_escola = 0;
  let soma_alimentacao_fornecida = 0;
  let soma_alimentacao_agua_filtrada = 0;
  let soma_dependencias_sanitario_dentro_predio = 0;
  let soma_dependencias_sanitario_fora_predio = 0;
  let soma_dependencias_biblioteca = 0;
  let soma_dependencias_cozinha = 0;
  let soma_dependencias_lab_informatica = 0;
  let soma_dependencias_lab_ciencias = 0;
  let soma_dependencias_sala_leitura = 0;
  let soma_dependencias_quadra_esportes = 0;
  let soma_dependencias_sala_diretora = 0;
  let soma_dependencias_sala_professores = 0;
  let soma_dependencias_sala_atendimento_especial = 0;

  
    const url = `https://api.qedu.org.br/v1/censo/territorio?ano=${ano}&ibge_id=${codigoIbge}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        errorMsg.innerHTML = 'Erro ao fazer requisição dos dados de infraestrutura.';
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const dados = json.data;

      if (Array.isArray(dados) && dados.length > 0) {
        soma_acessibilidade_escola = dados.reduce((soma, item) => soma + (item.acessibilidade_escola || 0), 0);
        soma_alimentacao_fornecida = dados.reduce((soma, item) => soma + (item.alimentacao_fornecida || 0), 0);
        soma_alimentacao_agua_filtrada = dados.reduce((soma, item) => soma + (item.alimentacao_agua_filtrada || 0), 0);
        soma_dependencias_sanitario_dentro_predio = dados.reduce((soma, item) => soma + (item.dependencias_sanitario_dentro_predio || 0), 0);
        soma_dependencias_sanitario_fora_predio = dados.reduce((soma, item) => soma + (item.dependencias_sanitario_fora_predio || 0), 0);
        soma_dependencias_biblioteca = dados.reduce((soma, item) => soma + (item.dependencias_biblioteca || 0), 0);
        soma_dependencias_cozinha = dados.reduce((soma, item) => soma + (item.dependencias_cozinha || 0), 0);
        soma_dependencias_lab_informatica = dados.reduce((soma, item) => soma + (item.dependencias_lab_informatica || 0), 0);
        soma_dependencias_lab_ciencias = dados.reduce((soma, item) => soma + (item.dependencias_lab_ciencias || 0), 0);
        soma_dependencias_sala_leitura = dados.reduce((soma, item) => soma + (item.dependencias_sala_leitura || 0), 0);
        soma_dependencias_quadra_esportes = dados.reduce((soma, item) => soma + (item.dependencias_quadra_esportes || 0), 0);
        soma_dependencias_sala_diretora = dados.reduce((soma, item) => soma + (item.dependencias_sala_diretora || 0), 0);
        soma_dependencias_sala_professores = dados.reduce((soma, item) => soma + (item.dependencias_sala_professores || 0), 0);
        soma_dependencias_sala_atendimento_especial = dados.reduce((soma, item) => soma + (item.dependencias_sala_atendimento_especial || 0), 0);

      } else {
        errorMsg.innerHTML = 'Erro ao tratar os dados de infraestrutura.';
        console.error(`json não foi convertido para array`,dados );
       
      }

    } catch (error) {
      console.error(`Erro ao buscar dados:`, error.message);
    }
   let labels = [
      "Acessibilidade Escola",
      "Alimentação Fornecida",
      "Água Filtrada",
      "Sanitário Dentro do Prédio",
      "Sanitário Fora do Prédio",
      "Biblioteca",
      "Cozinha",
      "Laboratório de Informática",
      "Laboratório de Ciências",
      "Sala de Leitura",
      "Quadra de Esportes",
      "Sala da Diretora",
      "Sala dos Professores",
      "Sala de Atendimento Especial"
    ]
     let values = [
      soma_acessibilidade_escola,
      soma_alimentacao_fornecida,
      soma_alimentacao_agua_filtrada,
      soma_dependencias_sanitario_dentro_predio,
      soma_dependencias_sanitario_fora_predio,
      soma_dependencias_biblioteca,
      soma_dependencias_cozinha,
      soma_dependencias_lab_informatica,
      soma_dependencias_lab_ciencias,
      soma_dependencias_sala_leitura,
      soma_dependencias_quadra_esportes,
      soma_dependencias_sala_diretora,
      soma_dependencias_sala_professores,
      soma_dependencias_sala_atendimento_especial
    ]
  // Retorna os dois arrays para uso no gráfico
  return {
   Labels: labels,
   Values: values
  };
}

async function buscarDadosEnem() {
    const loading = document.getElementById('loading-enem');
    const error = document.getElementById('error-enem');

    let cidadeId = cidadeSelect.value || 2111300;
    let anoSelecionado = document.getElementById('ano').value || 2019;
    const apiUrl = 'https://api.qedu.org.br/v1/enem';
   

    const params = { id: cidadeId, ano: anoSelecionado };
    loading.style.display = 'block';
    error.style.display = 'none';
    

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            params
        });

        const listaDados = response.data.data;
        if (!listaDados || listaDados.length === 0) {
            throw new Error('Nenhum dado encontrado para o ENEM');
        }

        let somaLC = 0, somaMT = 0, somaCH = 0, somaCN = 0, somaRedacao = 0;
        let total = 0;

        listaDados.forEach(item => {
            if (item.media_LC && item.media_MT && item.media_CH && item.media_CN && item.media_redacao) {
                somaLC += parseFloat(item.media_LC);
                somaMT += parseFloat(item.media_MT);
                somaCH += parseFloat(item.media_CH);
                somaCN += parseFloat(item.media_CN);
                somaRedacao += parseFloat(item.media_redacao);
                total++;
            }
        });

        if (total === 0) throw new Error('Não há dados válidos para calcular a média');

        const labels = ['Linguagens', 'Matemática', 'Ciências Humanas', 'Ciências da Natureza', 'Redação'];
        const values = [
            (somaLC / total).toFixed(2),
            (somaMT / total).toFixed(2),
            (somaCH / total).toFixed(2),
            (somaCN / total).toFixed(2),
            (somaRedacao / total).toFixed(2)
        ];

        

        
        loading.style.display = 'none';
       
        return { labels, values };

    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        error.textContent = 'Erro ao buscar dados do ENEM: ' + err.message;
        error.style.display = 'block';
        loading.style.display = 'none';
    }
}



// variaves dos graficos 
let idebChartInstance = null; 
let internetChartInstance = null;
let infraChartInstance = null;
let enemChartInstance = null;



// Verifica se existem links dentro do nav
if (ancora.length > 0 && nav && collapse) {
  ancora.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('collapse-true')
      collapse.classList.remove('open')
    })
  })
}

async function renderChart() {
    const ctx = document.getElementById('enemChart').getContext('2d');
   const cidadeTitulo = cidadeSelect.value !== ''
    ? cidadeSelect.options[cidadeSelect.selectedIndex].text
    : `${cidadeSelect.options[cidadeSelect.selectedIndex].text}`; 

    
    const estado = cidadeSelect.options[cidadeSelect.selectedIndex]?.dataset.estado || `${estadoSelect.options[estadoSelect.selectedIndex].text}`;
    const anoSelecionado = document.getElementById('ano').value || 2019;

    const dados = await buscarDadosEnem();

    if (enemChartInstance) {
      console.log('Destruindo gráfico existente');
      enemChartInstance.destroy();
    }

    enemChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: dados.labels,
            datasets: [{
                data: dados.values,
                backgroundColor: ['#5409DA', '#C5172E', '#ffc107', '#ff5722', '#9c27b0']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${cidadeTitulo} - ${estado} - ENEM ${anoSelecionado}`
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = Number(context.raw);
                            if (isNaN(value)) return label;
                            return `${label}: ${value.toFixed(2)} pts`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}


async function graficoIdeb() {
  const ctx = document.getElementById('idebChart').getContext('2d');
  const loadingMsg = document.getElementById('loading-ideb');
  const errorMsg = document.getElementById('error-ideb');

  // Exibe a mensagem de carregamento
  loadingMsg.style.display = 'block';
  errorMsg.innerHTML = '';

  try {
    // Destroi o gráfico anterior, se existir
    if (idebChartInstance) {
      idebChartInstance.destroy();
    }

    const dadosIdebObtio = await dadosIdeb();

   idebChartInstance = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['2019', '2017', '2015', '2013', '2011'],
    datasets: [{
      label: 'Nota IDEB',
      data: dadosIdebObtio,
      backgroundColor: ['#0079FF', '#00DFA2', '#ffc107', '#ff5722', '#9c27b0']
            
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Evolução da Nota do IDEB |' + (cidadeSelect.value? cidadeSelect.options[cidadeSelect.selectedIndex].text+ "-" + estadoSelect.options[estadoSelect.selectedIndex].text: estadoSelect.options[estadoSelect.selectedIndex].text),
      }, 
      tooltip: {
        mode: 'index',
        intersect: false
      },
      legend: {
        position: 'top'
      },
    }
  }
});


  } catch (erro) {
    console.error(erro);
    errorMsg.innerHTML = 'Erro ao carregar os dados do IDEB.';
  } finally {
    // Oculta a mensagem de carregamento
    loadingMsg.style.display = 'none';
  }
}


async function graficoAcessoInternet(){
 const loadingMsg = document.getElementById('loading-internet');
 

 const ctx = document.getElementById('internetChart').getContext('2d');
 if (internetChartInstance) {
    internetChartInstance.destroy();
  }
  loadingMsg.style.display = 'block';
  const dadosAcessoInternet = await dadoAcessoInternet();

  internetChartInstance = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: dadosAcessoInternet.anos,
    datasets: [
      {
        label: '% Acesso à Internet',
        data: dadosAcessoInternet.internet,
        backgroundColor: 'rgb(0, 255, 209)',
      },
      {
        label: '% Acesso à Banda Larga',
        data: dadosAcessoInternet.bandaLarga,
        backgroundColor: 'rgb(84, 9, 218)',
      }
      
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Acesso à Internet nas Escolas por Ano |' +(cidadeSelect.value? cidadeSelect.options[cidadeSelect.selectedIndex].text+ "-" + estadoSelect.options[estadoSelect.selectedIndex].text: estadoSelect.options[estadoSelect.selectedIndex].text)
      },
      tooltip: {
        mode: 'index',
        intersect: false
      },
      legend: {
        position: 'top'
      },
    },
    scales: {
      x: {
        stacked: false,  // DESATIVAR empilhamento no eixo X
        title: {
          display: true
        }
      },
      y: {
        stacked: false,  // DESATIVAR empilhamento no eixo Y
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Porcentagem (%)'
        }
      }
    }
  }
})
loadingMsg.style.display = 'none';
}
async function carregarInfraestrutura() {
  const loadingMsg = document.getElementById('loading-Infraestrutura');
  loadingMsg.style.display = 'block';
  const ctx = document.getElementById('infraChart');
  if (infraChartInstance) {
    infraChartInstance.destroy();
  }
  const dadosInfraestrutura = await dadoInfraestrutura();
  

  infraChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: dadosInfraestrutura.Labels,
      datasets: [{
        label: '', // deixamos vazio ou removemos
        data: dadosInfraestrutura.Values,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        pointBackgroundColor: 'rgb(75, 192, 192)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Distribuição de Infraestrutura nas Escolas no ano de ${document.getElementById('ano').value} | `+ (cidadeSelect.value? cidadeSelect.options[cidadeSelect.selectedIndex].text+ "-" + estadoSelect.options[estadoSelect.selectedIndex].text: estadoSelect.options[estadoSelect.selectedIndex].text),
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.chart.data.labels[context.dataIndex];
              const value = context.raw;
              return `${value.toLocaleString()} escolas com ${label}`;
            }
          }
        },
        legend: {
          display: false // ocultar legenda já que não usamos nome do dataset
        }
      },
      scales: {
        r: {
          beginAtZero: true,
        }
      }
    }
  });
  loadingMsg.style.display = 'none';
}

// contruindo os graficos
function carregarGraficos() {
  graficoIdeb()
  graficoAcessoInternet()
  carregarInfraestrutura()
  renderChart()

}

