window.addEventListener('load', function () {
  const splashScreen = document.getElementById('splash-screen')
  // Hide splash screen and show content after a delay
  setTimeout(() => {
    splashScreen.style.display = 'none'
  }, 2000) // 2 second delay
})
