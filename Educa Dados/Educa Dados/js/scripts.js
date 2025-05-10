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
