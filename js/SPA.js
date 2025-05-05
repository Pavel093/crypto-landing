// SPA.js - полностью переработанная версия
class SPARouter {
  constructor() {
    this.appContainer = document.getElementById('app') || document.body;
    this.scrollHistory = {};
    this.currentPath = window.location.pathname;
    this.router = new Navigo('/', { noMatchWarning: true });
    this.isInitialized = false;

    this.init();
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Сохраняем начальный скролл
    this.scrollHistory[this.currentPath] = window.scrollY;

    // Настройка маршрутов
    this.router.on({
      '/': () => this.loadPage('index.html'),
      '/info.html': () => this.loadPage('info.html'),
    });

    // Обработчики событий
    this.setupEventListeners();
    this.router.resolve();
  }

  async loadPage(pagePath) {
    // Сохраняем текущий скролл
    this.scrollHistory[this.currentPath] = window.scrollY;

    try {
      const response = await fetch(pagePath);
      if (!response.ok) throw new Error(`Failed to load ${pagePath}`);
      
      const html = await response.text();
      this.appContainer.innerHTML = html;
      this.currentPath = window.location.pathname;

      // Инициализация компонентов
      this.initComponents();
      
      // Восстановление скролла
      window.scrollTo({
        top: this.scrollHistory[this.currentPath] || 0,
        behavior: 'instant'
      });
    } catch (error) {
      console.error('Page load error:', error);
      this.appContainer.innerHTML = `
        <h1>Loading Error</h1>
        <p>${error.message}</p>
      `;
    }
  }

  initComponents() {
    // Инициализация только если функции существуют
    const safeInit = (fnName) => {
      if (typeof window[fnName] === 'function') {
        console.log(`Initializing ${fnName}`);
        window[fnName]();
      }
    };

    safeInit('initHeader');
    safeInit('initTokenomics');
    safeInit('initAccordion');
  }

  setupEventListeners() {
    // Удаляем старые обработчики
    document.removeEventListener('click', this.handleLinkClick);
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('scroll', this.handleScroll);

    // Создаем новые с привязкой контекста
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handlePopState = this.handlePopState.bind(this);
    this.handleScroll = this.handleScroll.bind(this);

    // Добавляем обработчики
    document.addEventListener('click', this.handleLinkClick);
    window.addEventListener('popstate', this.handlePopState);
    window.addEventListener('scroll', this.handleScroll);
  }

  handleLinkClick(e) {
    const link = e.target.closest('[data-router-link]');
    if (link) {
      e.preventDefault();
      const path = link.getAttribute('href');
      this.router.navigate(path);
    }
  }

  handlePopState() {
    this.router.resolve();
  }

  handleScroll() {
    this.scrollHistory[this.currentPath] = window.scrollY;
  }

  destroy() {
    // Очистка перед уничтожением
    this.setupEventListeners(); // Удаляет все обработчики
    if (this.router) this.router.destroy();
    this.isInitialized = false;
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  window.appRouter = new SPARouter();
});

// Переинициализация для SPA
window.reinitSPA = () => {
  if (window.appRouter) {
    window.appRouter.destroy();
  }
  window.appRouter = new SPARouter();
};