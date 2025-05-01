function initAccordion() {
  const containers = document.querySelectorAll('.accordion-container');
  if (!containers.length) return;

  const handleClick = function() {
    const container = this.closest('.accordion-container');
    containers.forEach(c => {
      if (c !== container) c.classList.remove('active');
    });
    container.classList.toggle('active');
  };

  // Очистка старых обработчиков
  containers.forEach(c => {
    const header = c.querySelector('.header-accordion');
    if (header) {
      header.removeEventListener('click', handleClick);
      header.addEventListener('click', handleClick);
    }
  });
}

window.initAccordion = initAccordion;
document.addEventListener('DOMContentLoaded', initAccordion);