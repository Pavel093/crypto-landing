// Конфигурация анимации
const faqConfig = {
    delay: 0.3,
    duration: 1.0,
    yOffset: 20,
    blurAmount: 5,
    ease: "power2.out"
  };
  
  // Скрываем секцию сразу после загрузки HTML (до отрисовки)
  document.addEventListener('DOMContentLoaded', function() {
    const section = document.querySelector('.faq-section');
    if (!section) return;
    
    // Важно: скрываем через inline-стили, чтобы предотвратить мелькание
    section.style.opacity = '0';
    section.style.visibility = 'hidden';
    section.style.willChange = 'opacity, transform, filter';
  });
  
  // Функция анимации
  function animateFaqSection() {
    const section = document.querySelector('.faq-section');
    if (!section || section.classList.contains('animated')) return;
  
    // Начальное состояние
    gsap.set(section, {
      y: faqConfig.yOffset,
      filter: `blur(${faqConfig.blurAmount}px)`
    });
  
    // Анимация
    gsap.to(section, {
      opacity: 1,
      visibility: 'visible',
      y: 0,
      filter: 'blur(0px)',
      delay: faqConfig.delay,
      duration: faqConfig.duration,
      ease: faqConfig.ease,
      onComplete: () => {
        section.classList.add('animated');
        section.style.willChange = 'auto'; // Оптимизация после анимации
      }
    });
  }
  
  // Инициализация
  function initFaqAnimation() {
    const section = document.querySelector('.faq-section');
    if (!section) return;
  
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateFaqSection();
        observer.unobserve(section);
      }
    }, { 
      threshold: 0.1,
      rootMargin: '50px 0px -50px 0px'
    });
  
    observer.observe(section);
  }
  
  // Запуск после полной загрузки
  window.addEventListener('load', initFaqAnimation);
  
  // Резерв на случай отключенного JS
  document.documentElement.classList.add('js-enabled'); // Добавляем класс для JS