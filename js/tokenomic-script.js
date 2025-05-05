const TokenomicsManager = {
    config: {
        stiffness: 0.1,
        damping: 0.5,
        stickDistance: 15,
        hoverPadding: 25,
        transitionDuration: 300,
        smoothness: 0.2,
        bottomRectanglesCount: 2
    },

    data: [
        { category: "Public Sale", percentage: 30, tokens: "300,000,000" },
        { category: "Team & Advisors", percentage: 20, tokens: "200,000,000" },
        { category: "Marketing", percentage: 15, tokens: "150,000,000" },
        { category: "Development", percentage: 20, tokens: "200,000,000" },
        { category: "Reserve", percentage: 10, tokens: "100,000,000" },
        { category: "Ecosystem", percentage: 5, tokens: "50,000,000" }
    ],

    state: {
        tooltip: null,
        animationFrameId: null,
        currentActiveIndex: null,
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

    init() {
        this.state.elements.chartContainer = document.querySelector('.recharts-surface');
        if (!this.state.elements.chartContainer) return;

        this.state.elements.rectangles = Array.from(document.querySelectorAll('.recharts-rectangle'))
            .filter(rect => {
                const bounds = rect.getBoundingClientRect();
                return bounds.width > 0 && bounds.height > 0;
            });

        this.createTooltip();
        this.setupEventListeners();
        this.startAnimation();
    },

    isMobile() {
        return /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent);
    },

    createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.id = 'custom-tooltip';
        tooltip.className = 'custom-tooltip';
        tooltip.style.opacity = '0';
        tooltip.style.position = 'fixed';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        tooltip.style.transition = `opacity ${this.config.transitionDuration}ms ease-out`;
        document.body.appendChild(tooltip);

        this.state.tooltip = tooltip;
    },

    setupEventListeners() {
        const container = document.querySelector('.right-container') || this.state.elements.chartContainer;
        if (!container) return;

        if (this.isMobile()) {
            container.addEventListener('click', this.handleTouchTap.bind(this));
            document.addEventListener('click', this.handleOutsideTap.bind(this));
        } else {
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseLeave = this.handleMouseLeave.bind(this);
            this.handleResize = this.handleResize.bind(this);

            container.addEventListener('mousemove', this.handleMouseMove);
            container.addEventListener('mouseleave', this.handleMouseLeave);
            window.addEventListener('resize', this.handleResize);
        }
    },

    handleTouchTap(e) {
        const closest = this.findClosestRectangle(e.clientX, e.clientY);
        if (closest) {
            this.updateTooltipContent(closest.index);
            this.state.currentActiveIndex = closest.index;
    
            const rect = closest.rect;
            const tooltipWidth = this.state.tooltip.offsetWidth;
            const tooltipHeight = this.state.tooltip.offsetHeight;
    
            const chartBounds = this.state.elements.chartContainer.getBoundingClientRect();
    
            // Центрируем по горизонтали
            const targetX = chartBounds.left + (chartBounds.width - tooltipWidth) / 2;
    
            // Относительно нижней части прямоугольника
            let targetY = rect.bottom + 10;
    
            // Не выходим за границы экрана
            const maxY = chartBounds.bottom - tooltipHeight - 5;
            const minY = chartBounds.top + 5;
            targetY = Math.min(Math.max(targetY, minY), maxY);
    
            this.state.positions.target.x = targetX;
            this.state.positions.target.y = targetY;
    
            this.showTooltip();
        }
    },

    handleOutsideTap(e) {
        if (!this.state.tooltip.contains(e.target) &&
            !e.target.closest('.recharts-rectangle')) {
            this.hideTooltip();
            this.state.currentActiveIndex = null;
        }
    },

    handleMouseMove(e) {
        this.state.positions.lastMouse = { x: e.clientX, y: e.clientY };

        if (!this.state.elements.chartContainer) {
            this.hideTooltip();
            return;
        }

        const svgBounds = this.state.elements.chartContainer.getBoundingClientRect();
        if (e.clientX < svgBounds.left || e.clientX > svgBounds.right ||
            e.clientY < svgBounds.top || e.clientY > svgBounds.bottom) {
            this.hideTooltip();
            return;
        }

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

    updateTooltipTargetPosition(e) {
        const closest = this.findClosestRectangle(e.clientX, e.clientY);

        if (closest) {
            this.handleRectangleHover(closest.index, closest.rect, e);
        } else {
            this.handleNoRectangleHover(e);
        }
    },

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

    handleRectangleHover(index, rectBounds, e) {
        if (this.state.tooltip.style.opacity === '0') {
            this.showTooltip();
        }

        if (this.state.currentActiveIndex !== index) {
            this.updateTooltipContent(index);
            this.state.currentActiveIndex = index;
        }

        const chartBounds = this.state.elements.chartContainer.getBoundingClientRect();
        const chartCenterX = chartBounds.left + chartBounds.width / 2;
        const isRightSide = e.clientX > chartCenterX;
        const tooltipWidth = this.state.tooltip.offsetWidth;
        const tooltipHeight = this.state.tooltip.offsetHeight;
        const isBottomRectangle = index >= this.state.elements.rectangles.length - this.config.bottomRectanglesCount;

        let targetX = isRightSide
            ? e.clientX - tooltipWidth - this.config.stickDistance
            : e.clientX + this.config.stickDistance;

        let targetY = isBottomRectangle
            ? rectBounds.top - tooltipHeight - 5
            : rectBounds.bottom + 5;

        targetX = Math.min(Math.max(targetX, chartBounds.left + 5), chartBounds.right - tooltipWidth - 5);
        targetY = Math.min(Math.max(targetY, chartBounds.top + 5), chartBounds.bottom - tooltipHeight - 5);

        this.state.positions.target.x += (targetX - this.state.positions.target.x) * this.config.smoothness;
        this.state.positions.target.y += (targetY - this.state.positions.target.y) * this.config.smoothness;
    },

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

        this.hideTooltip();
    },

    startAnimation() {
        this.animateTooltip();
    },

    animateTooltip() {
        const dx = this.state.positions.target.x - this.state.positions.current.x;
        const dy = this.state.positions.target.y - this.state.positions.current.y;

        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            this.state.positions.current.x = this.state.positions.target.x;
            this.state.positions.current.y = this.state.positions.target.y;
        } else {
            this.state.positions.current.x += dx * this.config.stiffness;
            this.state.positions.current.y += dy * this.config.damping;
        }

        this.state.tooltip.style.left = Math.round(this.state.positions.current.x) + 'px';
        this.state.tooltip.style.top = Math.round(this.state.positions.current.y) + 'px';

        this.state.animationFrameId = requestAnimationFrame(this.animateTooltip.bind(this));
    },

    showTooltip() {
        this.state.tooltip.style.opacity = '1';
    },

    hideTooltip() {
        this.state.tooltip.style.opacity = '0';
        this.state.currentActiveIndex = null;
    },

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
    }
};

document.addEventListener('DOMContentLoaded', () => {
    TokenomicsManager.init();
});

function adjustChartForMobile() {
    const svgContainer = document.querySelector('.right-container');
    if (!svgContainer) return;
  
    const isMobile = window.innerWidth <= 770;
    const bars = document.querySelectorAll('.recharts-bar-rectangle path');
    const labels = document.querySelectorAll('.recharts-label-list text');
    const clipPath = document.querySelector('#recharts1-clip rect');
  
    // Сохраняем оригинальные значения
    if (!window.originalBarValues) {
      window.originalBarValues = {
        paths: Array.from(bars).map(bar => bar.getAttribute('d')),
        labels: Array.from(labels).map(label => ({
          x: label.getAttribute('x'),
          text: label.querySelector('tspan').textContent
        })),
        clipPathWidth: clipPath ? clipPath.getAttribute('width') : null
      };
    }
  
    if (isMobile) {
      // Мобильная версия - уменьшаем ширину на 20%
      bars.forEach((bar, index) => {
        const originalPath = window.originalBarValues.paths[index];
        
        // Парсим path с помощью регулярного выражения
        const pathParts = originalPath.match(/M(\d+),(\d+)L (\d+),(\d+)([^Z]*)Z/);
        if (!pathParts) return;
        
        const startX = parseFloat(pathParts[1]);
        const startY = parseFloat(pathParts[2]);
        const endX = parseFloat(pathParts[3]);
        const endY = parseFloat(pathParts[4]);
        const arcs = pathParts[5];
        
        // Вычисляем новую ширину
        const originalWidth = endX - startX;
        const newWidth = originalWidth * 0.8;
        const newEndX = startX + newWidth;
        
        // Собираем новый path
        const newPath = `M${startX},${startY}L${newEndX},${endY}${arcs}Z`;
        bar.setAttribute('d', newPath);
      });
  
      // Корректируем позиции меток
      labels.forEach((label, index) => {
        const originalX = parseFloat(window.originalBarValues.labels[index].x);
        const scaledX = 172 + (originalX - 172) * 0.8;
        label.setAttribute('x', scaledX);
      });
  
      // Корректируем clipPath
      if (clipPath) {
        clipPath.setAttribute('width', parseFloat(window.originalBarValues.clipPathWidth) * 0.8);
      }
    } else {
      // Десктопная версия - возвращаем оригинальные значения
      bars.forEach((bar, index) => {
        bar.setAttribute('d', window.originalBarValues.paths[index]);
      });
  
      labels.forEach((label, index) => {
        label.setAttribute('x', window.originalBarValues.labels[index].x);
        label.querySelector('tspan').textContent = window.originalBarValues.labels[index].text;
      });
  
      if (clipPath) {
        clipPath.setAttribute('width', window.originalBarValues.clipPathWidth);
      }
    }
  }
  
  // Добавляем debounce для оптимизации
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(adjustChartForMobile, 100);
  }
  
  // Инициализация
  document.addEventListener('DOMContentLoaded', () => {
    // Запускаем сразу после загрузки DOM
    adjustChartForMobile();
    
    // Добавляем обработчик resize
    window.addEventListener('resize', handleResize);
    
    // Добавляем обработчик для случаев, когда график может быть динамически загружен
    const observer = new MutationObserver(() => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(adjustChartForMobile, 100); // debounce внутри MutationObserver
      });
      observer.observe(document.body, { childList: true, subtree: true });
      
  });