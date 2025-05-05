// Конфигурация анимации футера
const footerConfig = {
    delay: 0.4,        // Чуть больше задержка для футера
    duration: 1.2,     // Более плавное появление
    yOffset: 30,       // Большее начальное смещение
    blurAmount: 8,     // Более заметное размытие
    ease: "power3.out" // Более мягкая кривая анимации
  };
  
  // Мгновенное скрытие футера при загрузке
  document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    // Применяем инлайновые стили для мгновенного скрытия
    footer.style.cssText = `
      opacity: 0 !important;
      visibility: hidden !important;
      will-change: opacity, transform, filter;
    `;
  });
  
  // Функция анимации футера
  function animateFooter() {
    const footer = document.querySelector('footer');
    if (!footer || footer.classList.contains('animated-footer')) return;
  
    // Начальное состояние
    gsap.set(footer, {
      y: footerConfig.yOffset,
      filter: `blur(${footerConfig.blurAmount}px)`,
      opacity: 0,
      visibility: 'visible'
    });
  
    // Анимация появления
    gsap.to(footer, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      delay: footerConfig.delay,
      duration: footerConfig.duration,
      ease: footerConfig.ease,
      onComplete: () => {
        footer.classList.add('animated-footer');
        footer.style.willChange = 'auto';
      }
    });
  }
  
  // Инициализация анимации для футера
  function initFooterAnimation() {
    const footer = document.querySelector('footer');
    if (!footer) return;
  
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateFooter();
        observer.unobserve(footer);
      }
    }, {
      threshold: 0.05,  // Более чувствительный триггер
      rootMargin: '200px 0px 0px 0px' // Срабатывает раньше
    });
  
    observer.observe(footer);
  }
  
  // Запуск после полной загрузки
  window.addEventListener('load', function() {
    // Добавляем класс-маркер для JS
    document.documentElement.classList.add('js-enabled');
    
    // Инициализируем анимацию
    initFooterAnimation();
  });