class SPARouter {
  constructor() {
    this.appContainer = document.getElementById('app') || document.body;
    this.scrollHistory = {};
    this.currentPath = window.location.pathname;
    this.isInitialized = false;
    this.basePath = window.location.hostname === '' ? '' : '/'; // Для file:// протокола

    // Инициализация Navigo с учетом локального запуска
    this.router = new Navigo(this.basePath, { noMatchWarning: true, hash: window.location.protocol === 'file:' });

    this.init();
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.scrollHistory[this.currentPath] = window.scrollY;

    // Настройка маршрутов
    this.router.on({
      '/': () => this.loadPage('index.html'),
      '/info.html': () => this.loadPage('info.html'),
      '*': () => this.handleNotFound()
    });

    this.setupEventListeners();
    this.router.resolve();
  }

  async loadPage(pagePath) {
    this.scrollHistory[this.currentPath] = window.scrollY;

    // Нормализация пути для file:// протокола
    const normalizedPath = window.location.protocol === 'file:' ? 
      (pagePath.startsWith('/') ? pagePath.substring(1) : pagePath) : 
      pagePath;

    try {
      const response = await fetch(normalizedPath);
      if (!response.ok) throw new Error(`Failed to load ${normalizedPath}`);
      
      const html = await response.text();
      this.appContainer.innerHTML = html;
      this.currentPath = window.location.pathname;

      this.initComponents();
      
      window.scrollTo({
        top: this.scrollHistory[this.currentPath] || 0,
        behavior: 'instant'
      });
    } catch (error) {
      console.error('Page load error:', error);
      this.handleLoadError(error, normalizedPath);
    }
  }

  handleNotFound() {
    this.appContainer.innerHTML = `
      <h1>Page Not Found</h1>
      <p>The requested page was not found.</p>
      <a href="${this.basePath}" data-router-link>Go to Home</a>
    `;
  }

  handleLoadError(error, path) {
    this.appContainer.innerHTML = `
      <h1>Loading Error</h1>
      <p>${error.message}</p>
      <p>Failed to load: ${path}</p>
      <a href="${this.basePath}" data-router-link>Go to Home</a>
    `;
  }

  // ... остальные методы остаются без изменений ...
}

// Инициализация с проверкой готовности DOM
function initializeApp() {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.appRouter = new SPARouter();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      window.appRouter = new SPARouter();
    });
  }
}

initializeApp();

// Переинициализация для SPA
window.reinitSPA = () => {
  if (window.appRouter) {
    window.appRouter.destroy();
  }
  window.appRouter = new SPARouter();
};