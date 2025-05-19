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

// Verifica se existem links dentro do nav
if (ancora.length > 0 && nav && collapse) {
  ancora.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('collapse-true')
      collapse.classList.remove('open')
    })
  })
}

/*
new Chart(document.getElementById('evasaoChart'), {
  type: 'line',
  data: {
    labels: ['2019', '2020', '2021', '2022'],
    datasets: [{
      label: 'Evasão (%)',
      data: [12, 14, 13, 11],
      borderColor: '#8884d8',
      fill: false
    }]
  }
})

new Chart(document.getElementById('idebChart'), {
  type: 'bar',
  data: {
    labels: ['2019', '2020', '2021', '2022'],
    datasets: [{
      label: 'Nota IDEB',
      data: [4.2, 4.5, 4.7, 5.0],
      backgroundColor: '#82ca9d'
    }]
  }
})

new Chart(document.getElementById('internetChart'), {
  type: 'bar',
  data: {
    labels: ['Escola A', 'Escola B', 'Escola C'],
    datasets: [{
      label: '% Acesso',
      data: [60, 75, 90],
      backgroundColor: '#8884d8'
    }]
  }
})

new Chart(document.getElementById('infraChart'), {
  type: 'bar',
  data: {
    labels: ['Escola A', 'Escola B', 'Escola C'],
    datasets: [{
      label: '% Qualidade',
      data: [70, 85, 65],
      backgroundColor: '#ffc658'
    }]
  }
})*/


