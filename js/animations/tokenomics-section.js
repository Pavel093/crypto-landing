// Конфигурация анимации
const tokenomicsConfig = {
  delay: 0.3,
  duration: 1.0,
  yOffset: 20,
  blurAmount: 5,
  ease: "power2.out"
};

// Основная функция анимации
function animateTokenomicsSection() {
  const section = document.querySelector('.tokenomics-section');
  if (!section) return;

  // Устанавливаем начальные стили через GSAP
  gsap.set(section, {
    opacity: 0,
    y: tokenomicsConfig.yOffset,
    filter: `blur(${tokenomicsConfig.blurAmount}px)`,
    visibility: 'visible' // Важно: делаем видимым перед анимацией
  });

  // Запускаем анимацию
  gsap.to(section, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    delay: tokenomicsConfig.delay,
    duration: tokenomicsConfig.duration,
    ease: tokenomicsConfig.ease
  });
}

// Инициализация с Intersection Observer
function initTokenomicsAnimation() {
  const section = document.querySelector('.tokenomics-section');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateTokenomicsSection();
      observer.unobserve(section);
    }
  }, { threshold: 0.1 });

  observer.observe(section);
}

// Запуск после полной загрузки страницы
window.addEventListener('load', function() {
  // Сначала делаем секцию видимой (на случай отключенного JS)
  const section = document.querySelector('.tokenomics-section');
  if (section) {
    section.style.visibility = 'visible';
    section.style.opacity = '1';
  }
  
  // Затем инициализируем анимацию
  initTokenomicsAnimation();
});