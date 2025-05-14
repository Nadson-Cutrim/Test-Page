/*
const btn_darck_mode = document.getElementById('darkModeToggle')

btn_darck_mode.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode')
  btn_darck_mode.textContent = document.body.classList.contains('dark-mode') ? "☀️" : "🌙"
}) */


const collapse = document.getElementById('collapse')
const nav = document.getElementById('nav')
const ancora = document.querySelectorAll('nav a')


collapse.addEventListener('click', () => {
  nav.classList.toggle('collapse-true')
  collapse.classList.toggle('open')
})

ancora.forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('collapse-true')
    collapse.classList.remove('open')
  })
})



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
});

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
});

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
});

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
});

