// Объект для хранения состояния токеномики
const TokenomicsManager = {
    // Конфигурация
    config: {
        stiffness: 0.05,
        damping: 0.25,
        stickDistance: 15,
        hoverPadding: 25,
        transitionDuration: 200
    },

    // Данные
    data: [
        { category: "Public Sale", percentage: 30, tokens: "300,000,000" },
        { category: "Team & Advisors", percentage: 20, tokens: "200,000,000" },
        { category: "Marketing", percentage: 15, tokens: "150,000,000" },
        { category: "Development", percentage: 20, tokens: "200,000,000" },
        { category: "Reserve", percentage: 10, tokens: "100,000,000" },
        { category: "Ecosystem", percentage: 5, tokens: "50,000,000" }
    ],

    // Состояние
    state: {
        tooltip: null,
        animationFrameId: null,
        currentActiveIndex: null,
        isInitialized: false,
        elements: {
            chartContainer: null,
            rectangles: []
        },
        positions: {
            target: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
            lastMouse: { x: 0, y: 0 }
        }
    },

    // Инициализация
    init() {
        if (this.state.isInitialized) {
            this.cleanup();
        }

        // Находим основные элементы
        this.state.elements.chartContainer = document.querySelector('.recharts-surface');
        if (!this.state.elements.chartContainer) return;

        // Находим все видимые прямоугольники
        this.state.elements.rectangles = Array.from(document.querySelectorAll('.recharts-rectangle'))
            .filter(rect => {
                const bounds = rect.getBoundingClientRect();
                return bounds.width > 0 && bounds.height > 0;
            });

        // Создаем tooltip
        this.createTooltip();

        // Настраиваем обработчики событий
        this.setupEventListeners();

        // Запускаем анимацию
        this.startAnimation();

        this.state.isInitialized = true;
    },

    // Создание tooltip
    createTooltip() {
        // Удаляем старый tooltip если есть
        const oldTooltip = document.getElementById('custom-tooltip');
        if (oldTooltip) oldTooltip.remove();

        // Создаем новый
        const tooltip = document.createElement('div');
        tooltip.id = 'custom-tooltip';
        tooltip.className = 'custom-tooltip';
        tooltip.style.opacity = '0';
        tooltip.style.position = 'fixed';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        document.body.appendChild(tooltip);

        this.state.tooltip = tooltip;
    },

    // Настройка обработчиков событий
    setupEventListeners() {
        const container = document.querySelector('.right-container') || this.state.elements.chartContainer;
        if (!container) return;

        // Удаляем старые обработчики
        container.removeEventListener('mousemove', this.handleMouseMove);
        container.removeEventListener('mouseleave', this.handleMouseLeave);
        window.removeEventListener('resize', this.handleResize);

        // Привязываем контекст
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Добавляем новые обработчики
        container.addEventListener('mousemove', this.handleMouseMove);
        container.addEventListener('mouseleave', this.handleMouseLeave);
        window.addEventListener('resize', this.handleResize);
    },

    // Обработчики событий
    handleMouseMove(e) {
        this.state.positions.lastMouse = { x: e.clientX, y: e.clientY };
        this.updateTooltipTargetPosition(e);
    },

    handleMouseLeave() {
        this.hideTooltip();
    },

    handleResize() {
        if (this.state.elements.chartContainer) {
            this.state.elements.chartBounds = this.state.elements.chartContainer.getBoundingClientRect();
        }
    },

    // Обновление позиции tooltip
    updateTooltipTargetPosition(e) {
        const closest = this.findClosestRectangle(e.clientX, e.clientY);
        
        if (closest) {
            this.handleRectangleHover(closest.index, closest.rect);
        } else {
            this.handleNoRectangleHover(e);
        }
    },

    // Поиск ближайшего прямоугольника
    findClosestRectangle(x, y) {
        let closestIndex = null;
        let minDistance = Infinity;
        let closestRect = null;

        this.state.elements.rectangles.forEach((rect, index) => {
            const bounds = rect.getBoundingClientRect();
            const extendedBounds = {
                left: bounds.left - this.config.hoverPadding,
                right: bounds.right + this.config.hoverPadding,
                top: bounds.top - this.config.hoverPadding,
                bottom: bounds.bottom + this.config.hoverPadding
            };

            if (x >= extendedBounds.left && x <= extendedBounds.right &&
                y >= extendedBounds.top && y <= extendedBounds.bottom) {
                
                const center = {
                    x: bounds.left + bounds.width / 2,
                    y: bounds.top + bounds.height / 2
                };
                const distance = Math.sqrt(
                    Math.pow(x - center.x, 2) + 
                    Math.pow(y - center.y, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                    closestRect = bounds;
                }
            }
        });

        return closestIndex !== null ? { index: closestIndex, rect: closestRect } : null;
    },

    // Обработка наведения на прямоугольник
    handleRectangleHover(index, rectBounds) {
        if (this.state.tooltip.style.opacity === '0') {
            this.showTooltip();
        }

        if (this.state.currentActiveIndex !== index) {
            this.updateTooltipContent(index);
            this.state.currentActiveIndex = index;
        }

        let targetX, targetY;

        if (this.state.positions.lastMouse.x < rectBounds.left) {
            targetX = rectBounds.left - this.config.stickDistance - this.state.tooltip.offsetWidth;
        } else if (this.state.positions.lastMouse.x > rectBounds.right) {
            targetX = rectBounds.right + this.config.stickDistance;
        } else {
            targetX = this.state.positions.lastMouse.x + 15;
        }

        targetY = rectBounds.top + (rectBounds.height / 2) - (this.state.tooltip.offsetHeight / 2);

        // Корректировка у границ
        const tooltipWidth = this.state.tooltip.offsetWidth;
        const tooltipHeight = this.state.tooltip.offsetHeight;
        const chartBounds = this.state.elements.chartContainer.getBoundingClientRect();

        if (targetX + tooltipWidth > chartBounds.right) {
            targetX = chartBounds.right - tooltipWidth - 5;
        }
        if (targetX < chartBounds.left) {
            targetX = chartBounds.left + 5;
        }

        if (targetY + tooltipHeight > chartBounds.bottom) {
            targetY = chartBounds.bottom - tooltipHeight - 5;
        }
        if (targetY < chartBounds.top) {
            targetY = chartBounds.top + 5;
        }

        this.state.positions.target = { x: targetX, y: targetY };
    },

    // Обработка когда курсор не над прямоугольником
    handleNoRectangleHover(e) {
        if (this.state.currentActiveIndex !== null) {
            const activeRect = this.state.elements.rectangles[this.state.currentActiveIndex];
            const bounds = activeRect.getBoundingClientRect();
            const extendedBounds = {
                left: bounds.left - this.config.hoverPadding * 2,
                right: bounds.right + this.config.hoverPadding * 2,
                top: bounds.top - this.config.hoverPadding * 2,
                bottom: bounds.bottom + this.config.hoverPadding * 2
            };

            if (e.clientX >= extendedBounds.left && e.clientX <= extendedBounds.right &&
                e.clientY >= extendedBounds.top && e.clientY <= extendedBounds.bottom) {
                return;
            }
        }

        const chartBounds = this.state.elements.chartContainer.getBoundingClientRect();
        this.state.positions.target = {
            x: Math.min(Math.max(e.clientX + 15, chartBounds.left + 5), chartBounds.right - this.state.tooltip.offsetWidth - 5),
            y: Math.min(Math.max(e.clientY + 15, chartBounds.top + 5), chartBounds.bottom - this.state.tooltip.offsetHeight - 5)
        };
    },

    // Анимация
    startAnimation() {
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
        }
        this.animateTooltip();
    },

    animateTooltip() {
        const dx = this.state.positions.target.x - this.state.positions.current.x;
        const dy = this.state.positions.target.y - this.state.positions.current.y;

        this.state.positions.current.x += dx * this.config.stiffness;
        this.state.positions.current.y += dy * this.config.damping;

        this.state.tooltip.style.left = this.state.positions.current.x + 'px';
        this.state.tooltip.style.top = this.state.positions.current.y + 'px';

        this.state.animationFrameId = requestAnimationFrame(this.animateTooltip.bind(this));
    },

    // Управление tooltip
    showTooltip() {
        this.state.tooltip.style.opacity = '1';
        this.state.tooltip.style.transition = `opacity ${this.config.transitionDuration}ms ease-out`;
    },

    hideTooltip() {
        this.state.tooltip.style.opacity = '0';
        this.state.tooltip.style.transition = `opacity ${this.config.transitionDuration}ms ease-out`;
        this.state.currentActiveIndex = null;
    },

    // Обновление содержимого tooltip
    updateTooltipContent(index) {
        if (index === null || index >= this.data.length) return;

        const item = this.data[index];
        this.state.tooltip.innerHTML = `
            <div class="tooltip-title">${item.category}</div>
            <div class="tooltip-data">
                <div class="tooltip-row">
                    <span class="tooltip-label">tokens:</span>
                    <span class="tooltip-value">${item.tokens} WONE</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">allocation:</span>
                    <span class="tooltip-value tooltip-percentage">${item.percentage}%</span>
                </div>
            </div>
        `;

        this.state.tooltip.style.transition = `opacity ${this.config.transitionDuration}ms ease-out`;
        this.state.tooltip.style.opacity = '0.8';
        setTimeout(() => {
            this.state.tooltip.style.opacity = '1';
        }, this.config.transitionDuration / 2);
    },

    // Очистка
    cleanup() {
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
        }

        const container = document.querySelector('.right-container') || this.state.elements.chartContainer;
        if (container) {
            container.removeEventListener('mousemove', this.handleMouseMove);
            container.removeEventListener('mouseleave', this.handleMouseLeave);
        }

        window.removeEventListener('resize', this.handleResize);

        if (this.state.tooltip && this.state.tooltip.parentNode) {
            this.state.tooltip.parentNode.removeChild(this.state.tooltip);
        }

        this.state.isInitialized = false;
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    TokenomicsManager.init();
});

// Экспорт для SPA
window.initTokenomics = () => TokenomicsManager.init();
window.cleanupTokenomics = () => TokenomicsManager.cleanup();