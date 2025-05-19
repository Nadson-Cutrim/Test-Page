
// ============= Trazer o gráfico de IDEB da API do QEdu =====================

document.addEventListener('DOMContentLoaded', function () {
    const loadingElement = document.getElementById('loading')
    const errorElement = document.getElementById('error')
    const idebGraf = document.getElementById('idebChart2')

    const baseURL = 'https://api.qedu.org.br/v1/ideb'
    const token = 'VWFtMhR85XttcftnC0hmdPbvgf8dTPkQwDF86XpI'
    const municipios = [
        { nome: 'São Luís', id: 2111300 },
        { nome: 'Fortaleza', id: 2304400 }
    ]

    const paramsBase = {
        ano: 2019,
        dependencia_id: 2,
        ciclo_id: 'AI'
    }

    Promise.all(municipios.map(m => {
        return axios.get(baseURL, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            params: { ...paramsBase, id: m.id }
        }).then(res => ({
            nome: m.nome,
            data: res.data.data[0]
        }))
    }))
        .then(results => {

            const labels = ['IDEB', 'APRENDIZADO', 'FLUXO', 'APROVAÇÃO']

            const datasets = results.map((cidade, index) => {

                const colors = ['#F5004F', '#7C00FE']
                return {
                    label: cidade.nome,
                    data: [
                        parseFloat(cidade.data.ideb),
                        parseFloat(cidade.data.aprendizado),
                        parseFloat(cidade.data.fluxo),
                        parseFloat(cidade.data.aprovacao)
                    ],
                    backgroundColor: colors[index % colors.length]
                }
            })
            renderChart(labels, datasets)
            loadingElement.style.display = 'none'
            idebGraf.style.display = 'block'

        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error)
            errorElement.textContent = 'Erro ao buscar dados:' + error.message
            errorElement.style.display = 'block'
            loadingElement.style.display = 'none'
        })

    function renderChart(labels, datasets) {
        const ctx = document.getElementById('idebChart2').getContext('2d')

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparativo de Indicadores IDEB (2019)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })
    }
})


// =============== Gráfico e Chamada api pra dados do enem =============================


document.addEventListener('DOMContentLoaded', function () {
    const loading = document.getElementById('loading-enem')
    const error = document.getElementById('error-enem')
    const canvas = document.getElementById('enemChart')

    const apiUrl = 'https://api.qedu.org.br/v1/enem'
    const token = 'VWFtMhR85XttcftnC0hmdPbvgf8dTPkQwDF86XpI'

    const params = {
        id: 2111300,       // São Luís - MA
        ano: 2019
    }

    axios.get(apiUrl, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        params
    })
        .then(response => {
            const enemData = response.data.data[0]

            if (!enemData) {
                throw new Error('Nenhum dado encontrado para o ENEM')
            }

            const labels = [
                'Linguagens',
                'Matemática',
                'Ciências Humanas',
                'Ciências da Natureza',
                'Redação'
            ]

            const values = [
                parseFloat(enemData.media_LC),
                parseFloat(enemData.media_MT),
                parseFloat(enemData.media_CH),
                parseFloat(enemData.media_CN),
                parseFloat(enemData.media_redacao)
            ]

            renderChart(labels, values);
            loading.style.display = 'none'
            canvas.style.display = 'block'
        })
        .catch(err => {
            console.error('Erro ao buscar dados:', err)
            error.textContent = 'Erro ao buscar dados do ENEM: ' + err.message
            error.style.display = 'block'
            loading.style.display = 'none'
        })

    function renderChart(labels, values) {
        const ctx = canvas.getContext('2d')
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nota Média',
                    data: values,
                    backgroundColor: ['#4caf50', '#2196f3', '#ffc107', '#ff5722', '#9c27b0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `São Luís - MA - ENEM 2019`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        })
    }
})