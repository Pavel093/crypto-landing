function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const handleScroll = () => {
    header.classList.toggle('post', window.scrollY > 0);
  };

  window.addEventListener('scroll', handleScroll);
  
  // Первоначальное состояние
  handleScroll();
}

