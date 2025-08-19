// Menambahkan efek suara dan interaksi
const buttons = document.querySelectorAll('.menu-btn');
const coreToolsBtn = document.getElementById('coreToolsBtn');

// Efek suara (opsional)
const hoverSound = new Audio('data:audio/wav;base64,UklGRpQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAFAACAgICAgICAgICAgICAgICAgICAgICAgID///////////////////////////////////////////////////////////////////////////////////////////////////////////////////8A');

buttons.forEach(button => {
  // Efek hover
  button.addEventListener('mouseenter', () => {
    // hoverSound.play(); // Uncomment jika ingin menambahkan suara
    button.style.transform = 'translateY(-5px)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
  });
  
  // Handler klik
  button.addEventListener('click', () => {
    // Animasi klik
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 100);
    
    // Tindakan berdasarkan tombol yang diklik
    if (button.classList.contains('about-btn')) {
      alert('Menu About diklik!');
    }
  });
});

// Fungsi untuk navigasi ke halaman Core Tools
coreToolsBtn.addEventListener('click', () => {
  // Tambahkan animasi loading sebelum redirect
  coreToolsBtn.innerHTML = 'Loading...';
  coreToolsBtn.style.opacity = '0.8';
  
  // Redirect ke halaman Core Tools setelah jeda singkat
  setTimeout(() => {
    window.location.href = '/Core Tools/index.html';
  }, 500);
});

// Animasi tambahan untuk latar belakang
document.addEventListener('mousemove', (e) => {
  const lights = document.querySelectorAll('.background-light');
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  
  lights.forEach(light => {
    light.style.transform = `translate(${x * 20 - 10}px, ${y * 20 - 10}px)`;
  });
});