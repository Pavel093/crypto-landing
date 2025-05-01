function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const handleScroll = () => {
    header.classList.toggle('post', window.scrollY > 0);
  };

  // Очистка перед инициализацией
  window.removeEventListener('scroll', handleScroll);
  window.addEventListener('scroll', handleScroll);
  
  // Первоначальное состояние
  handleScroll();
}

// Экспорт для SPA
window.initHeader = initHeader;
document.addEventListener('DOMContentLoaded', initHeader);