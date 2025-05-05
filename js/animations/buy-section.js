// Конфигурация анимации
const buyConfig = {
    delay: 0.3,
    duration: 1.0,
    yOffset: 20,
    blurAmount: 5,
    ease: "power2.out"
  };
  
  // Скрываем секцию сразу после загрузки HTML
  document.addEventListener('DOMContentLoaded', function() {
    const section = document.querySelector('.buy-section');
    if (!section) return;
    
    // Важно: inline-стили для мгновенного скрытия
    section.style.cssText = `
      opacity: 0 !important;
      visibility: hidden !important;
      will-change: opacity, transform, filter;
    `;
  });
  
  // Функция анимации
  function animateBuySection() {
    const section = document.querySelector('.buy-section');
    if (!section || section.classList.contains('animated')) return;
  
    // Начальное состояние
    gsap.set(section, {
      y: buyConfig.yOffset,
      filter: `blur(${buyConfig.blurAmount}px)`,
      // Сохраняем важные стили
      opacity: 0,
      visibility: 'visible'
    });
  
    // Плавное появление
    gsap.to(section, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      delay: buyConfig.delay,
      duration: buyConfig.duration,
      ease: buyConfig.ease,
      onComplete: () => {
        section.classList.add('animated');
        section.style.willChange = 'auto';
      }
    });
  }
  
  // Инициализация Intersection Observer
  function initBuyAnimation() {
    const section = document.querySelector('.buy-section');
    if (!section) return;
  
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateBuySection();
        observer.unobserve(section);
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px 0px'
    });
  
    observer.observe(section);
  }
  
  // Запуск после полной загрузки
  window.addEventListener('load', function() {
    // Добавляем класс для JS
    document.documentElement.classList.add('js-enabled');
    initBuyAnimation();
  });