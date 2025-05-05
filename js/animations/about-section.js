const aboutSectionConfig = {
    delay: 0.3,
    duration: 1.0,
    yOffset: 20,
    blurAmount: 10,
    stagger: 0,
    ease: "power2.out"
  };
  
  // Скрываем элементы сразу при загрузке стилей
  document.addEventListener('DOMContentLoaded', function() {
    const section = document.querySelector('.about-section');
    if (!section) return;
  
    // Применяем начальные стили через CSSOM для мгновенного скрытия
    const style = document.createElement('style');
    style.textContent = `
      .about-section h2,
      .about-section .container {
        opacity: 0 !important;
        visibility: hidden !important;
      }
    `;
    document.head.appendChild(style);
  
    // Удалим этот стиль перед началом анимации
    setTimeout(() => document.head.removeChild(style), aboutSectionConfig.delay * 1000 + 100);
  });
  
  function animateAboutSection(section) {
    if (!section) return;
  
    const elements = [
      section.querySelector('h2'),
      section.querySelector('.container')
    ].filter(el => el);
  
    if (elements.length === 0) return;
  
    // Начальное состояние (дублируем на случай, если стили не успели примениться)
    gsap.set(elements, {
      opacity: 0,
      visibility: 'hidden',
      y: aboutSectionConfig.yOffset,
      filter: `blur(${aboutSectionConfig.blurAmount}px)`,
      willChange: 'opacity, transform, filter'
    });
  
    // Анимация с задержкой
    gsap.to(elements, {
      opacity: 1,
      visibility: 'visible',
      y: 0,
      filter: 'blur(0px)',
      delay: aboutSectionConfig.delay,
      duration: aboutSectionConfig.duration,
      ease: aboutSectionConfig.ease,
      stagger: aboutSectionConfig.stagger,
      overwrite: 'auto'
    });
  }
  
  // Инициализация
  function initAboutSectionAnimations() {
    const section = document.querySelector('.about-section');
    if (!section || section.classList.contains('animated')) return;
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          animateAboutSection(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '50px 0px -50px 0px'
    });
  
    observer.observe(section);
  }
  
  // Запуск после полной загрузки
  if (document.readyState === 'complete') {
    initAboutSectionAnimations();
  } else {
    window.addEventListener('load', initAboutSectionAnimations);
  }