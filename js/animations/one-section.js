// Конфигурация анимаций
const animationConfig = {
  duration: 0.5,
  yOffset: 40,
  stagger: 0.3,  // Задержка между стартами анимаций
  ease: "power2.out"
};

function animateElements(section) {
  if (!section) return;

  const elements = [
      section.querySelector('img'),
      section.querySelector('h1'),
      section.querySelector('p'),
      section.querySelector('a'),
      section.querySelector('.down-button')
  ].filter(el => el);

  if (elements.length === 0) {
      console.warn('Элементы для анимации не найдены');
      return;
  }

  // Начальное состояние
  gsap.set(elements, {
      opacity: 0,
      y: animationConfig.yOffset,
      willChange: 'opacity, transform'
  });

  // Каскадная анимация с перекрывающимися интервалами
  gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: animationConfig.duration,
      ease: animationConfig.ease,
      stagger: animationConfig.stagger,
      overwrite: 'auto'
  });
}

// Инициализация
function initFirstSectionAnimations() {
  requestAnimationFrame(() => {
      const section = document.querySelector('.first-section');
      if (section && !section.classList.contains('animated')) {
          section.classList.add('animated');
          animateElements(section);
      }
  });
}

document.addEventListener('DOMContentLoaded', initFirstSectionAnimations);
