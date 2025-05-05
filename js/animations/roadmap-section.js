// Конфигурация для roadmap-section
const roadmapConfig = {
    delay: 0.3,          // Пауза перед началом анимации
    duration: 1.0,       // Длительность анимации
    yOffset: 20,         // Смещение по Y
    blurAmount: 10,      // Начальное размытие
    cardStagger: 0.15,   // Задержка между карточками
    ease: "power2.out"   // Функция плавности
  };
  
  // Скрываем элементы сразу при загрузке
  document.addEventListener('DOMContentLoaded', function() {
    const section = document.querySelector('.roadmap-section');
    if (!section) return;
  
    const style = document.createElement('style');
    style.textContent = `
      .roadmap-section h2,
      .roadmap-section .card {
        opacity: 0 !important;
        visibility: hidden !important;
      }
    `;
    document.head.appendChild(style);
  
    setTimeout(() => document.head.removeChild(style), roadmapConfig.delay * 1000 + 100);
  });
  
  function animateRoadmapSection(section) {
    if (!section) return;
  
    const h2 = section.querySelector('h2');
    const cards = gsap.utils.toArray('.roadmap-section .card');
  
    // Начальное состояние для заголовка
    gsap.set(h2, {
      opacity: 0,
      visibility: 'hidden',
      y: roadmapConfig.yOffset,
      filter: `blur(${roadmapConfig.blurAmount}px)`,
      willChange: 'opacity, transform, filter'
    });
  
    // Начальное состояние для карточек
    gsap.set(cards, {
      opacity: 0,
      visibility: 'hidden',
      y: roadmapConfig.yOffset,
      filter: `blur(${roadmapConfig.blurAmount}px)`,
      willChange: 'opacity, transform, filter'
    });
  
    // Анимация заголовка
    gsap.to(h2, {
      opacity: 1,
      visibility: 'visible',
      y: 0,
      filter: 'blur(0px)',
      delay: roadmapConfig.delay,
      duration: roadmapConfig.duration,
      ease: roadmapConfig.ease
    });
  
    // Анимация карточек с каскадным эффектом
    gsap.to(cards, {
      opacity: 1,
      visibility: 'visible',
      y: 0,
      filter: 'blur(0px)',
      delay: roadmapConfig.delay + 0.2, // Небольшая задержка после заголовка
      duration: roadmapConfig.duration,
      ease: roadmapConfig.ease,
      stagger: roadmapConfig.cardStagger
    });
  }
  
  // Инициализация анимации
  function initRoadmapAnimations() {
    const section = document.querySelector('.roadmap-section');
    if (!section || section.classList.contains('animated')) return;
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          animateRoadmapSection(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
  
    observer.observe(section);
  }
  
  // Запуск после полной загрузки
  if (document.readyState === 'complete') {
    initRoadmapAnimations();
  } else {
    window.addEventListener('load', initRoadmapAnimations);
  }