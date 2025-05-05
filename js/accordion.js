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

  containers.forEach(c => {
    const header = c.querySelector('.header-accordion');
    header?.addEventListener('click', handleClick);
  });
}

document.addEventListener('DOMContentLoaded', initAccordion);