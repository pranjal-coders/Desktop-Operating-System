// Desktop OS JavaScript

let windowZIndex = 100;
let activeWindow = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initDesktopIcons();
    initTaskbar();
    updateClock();
    setInterval(updateClock, 1000);
});

// Initialize desktop icons
function initDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const appName = icon.getAttribute('data-app');
            openApp(appName);
        });
    });
}

// Initialize taskbar
function initTaskbar() {
    const startButton = document.getElementById('start-button');
    // Could add start menu functionality here
}

// Update clock
function updateClock() {
    const clock = document.getElementById('taskbar-clock');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}`;
}

// Open application
function openApp(appName) {
    let windowConfig = {};
    
    switch(appName) {
        case 'notepad':
            windowConfig = {
                title: '📝 Notepad',
                content: createNotepadContent(),
                width: 600,
                height: 400
            };
            break;
        case 'calculator':
            windowConfig = {
                title: '🔢 Calculator',
                content: createCalculatorContent(),
                width: 400,
                height: 500
            };
            break;
        case 'browser':
            windowConfig = {
                title: '🌐 Browser',
                content: createBrowserContent(),
                width: 900,
                height: 600
            };
            break;
        case 'about':
            windowConfig = {
                title: '👤 About Me',
                content: createAboutContent(),
                width: 600,
                height: 400
            };
            break;
        default:
            return;
    }
    
    createWindow(windowConfig);
}

// Create window
function createWindow(config) {
    const windowsContainer = document.getElementById('windows-container');
    const windowEl = document.createElement('div');
    windowEl.className = 'window active';
    windowEl.style.width = config.width + 'px';
    windowEl.style.height = config.height + 'px';
    
    // Center window
    const left = (window.innerWidth - config.width) / 2;
    const top = (window.innerHeight - 50 - config.height) / 2;
    windowEl.style.left = left + 'px';
    windowEl.style.top = top + 'px';
    
    windowEl.style.zIndex = ++windowZIndex;
    
    // Window header
    const header = document.createElement('div');
    header.className = 'window-header';
    header.innerHTML = `
        <div class="window-title">${config.title}</div>
        <div class="window-controls">
            <button class="window-control minimize" title="Minimize">−</button>
            <button class="window-control maximize" title="Maximize">□</button>
            <button class="window-control close" title="Close">✕</button>
        </div>
    `;
    
    // Window content
    const content = document.createElement('div');
    content.className = 'window-content';
    content.innerHTML = config.content;
    
    windowEl.appendChild(header);
    windowEl.appendChild(content);
    windowsContainer.appendChild(windowEl);
    
    // Make window draggable
    makeDraggable(windowEl, header);
    
    // Window controls
    const closeBtn = header.querySelector('.close');
    const minimizeBtn = header.querySelector('.minimize');
    const maximizeBtn = header.querySelector('.maximize');
    
    closeBtn.addEventListener('click', () => {
        windowEl.remove();
        removeTaskbarApp(windowEl);
    });
    
    minimizeBtn.addEventListener('click', () => {
        windowEl.style.display = 'none';
        updateTaskbarApp(windowEl, false);
    });
    
    maximizeBtn.addEventListener('click', () => {
        windowEl.classList.toggle('maximized');
    });
    
    // Focus window on click
    windowEl.addEventListener('mousedown', () => {
        focusWindow(windowEl);
    });
    
    // Add to taskbar
    addTaskbarApp(windowEl, config.title);
    
    // Initialize app-specific functionality
    initAppFunctionality(windowEl, config.title);
    
    focusWindow(windowEl);
}

// Make window draggable
function makeDraggable(windowEl, header) {
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.window-controls')) return;
        if (windowEl.classList.contains('maximized')) return;
        
        isDragging = true;
        initialX = e.clientX - windowEl.offsetLeft;
        initialY = e.clientY - windowEl.offsetTop;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        // Keep window within bounds
        const maxX = window.innerWidth - windowEl.offsetWidth;
        const maxY = window.innerHeight - 50 - windowEl.offsetHeight;
        
        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));
        
        windowEl.style.left = currentX + 'px';
        windowEl.style.top = currentY + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Focus window
function focusWindow(windowEl) {
    document.querySelectorAll('.window').forEach(w => {
        w.classList.remove('active');
    });
    windowEl.classList.add('active');
    windowEl.style.zIndex = ++windowZIndex;
    activeWindow = windowEl;
}

// Window ID counter for unique IDs
let windowIdCounter = 0;

// Helper function to find taskbar app by window ID
function findTaskbarApp(windowEl) {
    return document.querySelector(`.taskbar-app[data-window-id="${windowEl.dataset.windowId}"]`);
}

// Add taskbar app
function addTaskbarApp(windowEl, title) {
    const taskbarApps = document.getElementById('taskbar-apps');
    const appBtn = document.createElement('button');
    appBtn.className = 'taskbar-app active';
    appBtn.textContent = title;
    appBtn.dataset.windowId = windowEl.dataset.windowId = ++windowIdCounter;
    
    appBtn.addEventListener('click', () => {
        if (windowEl.style.display === 'none') {
            windowEl.style.display = 'flex';
            focusWindow(windowEl);
            appBtn.classList.add('active');
        } else if (windowEl.classList.contains('active')) {
            windowEl.style.display = 'none';
            appBtn.classList.remove('active');
        } else {
            focusWindow(windowEl);
        }
    });
    
    taskbarApps.appendChild(appBtn);
}

// Update taskbar app
function updateTaskbarApp(windowEl, active) {
    const appBtn = findTaskbarApp(windowEl);
    if (appBtn) {
        if (active) {
            appBtn.classList.add('active');
        } else {
            appBtn.classList.remove('active');
        }
    }
}

// Remove taskbar app
function removeTaskbarApp(windowEl) {
    const appBtn = findTaskbarApp(windowEl);
    if (appBtn) {
        appBtn.remove();
    }
}

// Create Notepad content
function createNotepadContent() {
    return `
        <div class="notepad-content">
            <div class="notepad-toolbar">
                <button class="notepad-clear">Clear</button>
                <button class="notepad-save">Download</button>
            </div>
            <textarea class="notepad-textarea" placeholder="Start typing..."></textarea>
        </div>
    `;
}

// Create Calculator content
function createCalculatorContent() {
    return `
        <div class="calculator-content">
            <div class="calculator-display">0</div>
            <div class="calculator-buttons">
                <button class="calculator-button clear">C</button>
                <button class="calculator-button operator">/</button>
                <button class="calculator-button operator">*</button>
                <button class="calculator-button operator">-</button>
                <button class="calculator-button">7</button>
                <button class="calculator-button">8</button>
                <button class="calculator-button">9</button>
                <button class="calculator-button operator">+</button>
                <button class="calculator-button">4</button>
                <button class="calculator-button">5</button>
                <button class="calculator-button">6</button>
                <button class="calculator-button operator">%</button>
                <button class="calculator-button">1</button>
                <button class="calculator-button">2</button>
                <button class="calculator-button">3</button>
                <button class="calculator-button">.</button>
                <button class="calculator-button">0</button>
                <button class="calculator-button equals">=</button>
            </div>
        </div>
    `;
}

// Create Browser content
function createBrowserContent() {
    return `
        <div class="browser-content">
            <div class="browser-toolbar">
                <button class="browser-back">←</button>
                <button class="browser-forward">→</button>
                <button class="browser-reload">⟳</button>
                <input type="text" class="browser-url" placeholder="Enter URL or search...">
                <button class="browser-go">Go</button>
            </div>
            <div class="browser-shortcuts">
                <a href="#" class="browser-shortcut" data-url="https://www.wikipedia.org">Wikipedia</a>
                <a href="#" class="browser-shortcut" data-url="https://www.proxysite.com">ProxySite</a>
                <a href="#" class="browser-shortcut" data-url="https://github.com/pranjal-coders">GitHub Profile</a>
            </div>
            <iframe class="browser-frame" src="https://www.wikipedia.org"></iframe>
        </div>
    `;
}

// Create About content
function createAboutContent() {
    return `
        <div class="about-content">
            <h1>Desktop OS Portfolio</h1>
            <p>Welcome to my Desktop Operating System portfolio project!</p>
            <p>This is a web-based desktop environment simulator built with HTML, CSS, and JavaScript.</p>
            <p>Features:</p>
            <ul style="text-align: left; max-width: 400px; margin: 20px auto; line-height: 2;">
                <li>📝 Notepad - Text editor with save functionality</li>
                <li>🔢 Calculator - Basic calculator with operations</li>
                <li>🌐 Browser - Web browser with iframe support</li>
                <li>🪟 Window Management - Draggable, resizable windows</li>
            </ul>
            <div class="about-links">
                <a href="https://github.com/pranjal-coders" target="_blank" class="about-link">Visit My GitHub</a>
            </div>
        </div>
    `;
}

// Initialize app-specific functionality
function initAppFunctionality(windowEl, title) {
    if (title.includes('Notepad')) {
        initNotepad(windowEl);
    } else if (title.includes('Calculator')) {
        initCalculator(windowEl);
    } else if (title.includes('Browser')) {
        initBrowser(windowEl);
    }
}

// Initialize Notepad functionality
function initNotepad(windowEl) {
    const clearBtn = windowEl.querySelector('.notepad-clear');
    const saveBtn = windowEl.querySelector('.notepad-save');
    const textarea = windowEl.querySelector('.notepad-textarea');
    
    clearBtn.addEventListener('click', () => {
        textarea.value = '';
    });
    
    saveBtn.addEventListener('click', () => {
        const text = textarea.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notepad.txt';
        a.click();
        URL.revokeObjectURL(url);
    });
}

// Initialize Calculator functionality
function initCalculator(windowEl) {
    const display = windowEl.querySelector('.calculator-display');
    const buttons = windowEl.querySelectorAll('.calculator-button');
    
    let currentValue = '0';
    let previousValue = '';
    let operation = '';
    let shouldResetDisplay = false;
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;
            
            if (button.classList.contains('clear')) {
                currentValue = '0';
                previousValue = '';
                operation = '';
                display.textContent = '0';
                return;
            }
            
            if (button.classList.contains('equals')) {
                if (previousValue && operation) {
                    currentValue = calculate(previousValue, currentValue, operation);
                    display.textContent = currentValue;
                    previousValue = '';
                    operation = '';
                    shouldResetDisplay = true;
                }
                return;
            }
            
            if (button.classList.contains('operator')) {
                if (previousValue && operation && !shouldResetDisplay) {
                    currentValue = calculate(previousValue, currentValue, operation);
                    display.textContent = currentValue;
                }
                previousValue = currentValue;
                operation = value;
                shouldResetDisplay = true;
                return;
            }
            
            // Number or decimal point
            if (shouldResetDisplay) {
                currentValue = value;
                shouldResetDisplay = false;
            } else {
                if (currentValue === '0' && value !== '.') {
                    currentValue = value;
                } else {
                    if (value === '.' && currentValue.includes('.')) return;
                    currentValue += value;
                }
            }
            
            display.textContent = currentValue;
        });
    });
}

// Calculate function
function calculate(a, b, op) {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);
    
    // Validate inputs
    if (!isFinite(num1) || !isFinite(num2)) {
        return 'Error';
    }
    
    switch(op) {
        case '+':
            return String(num1 + num2);
        case '-':
            return String(num1 - num2);
        case '*':
            return String(num1 * num2);
        case '/':
            return (num2 !== 0 && isFinite(num2)) ? String(num1 / num2) : 'Error';
        case '%':
            return String(num1 % num2);
        default:
            return b;
    }
}

// Initialize Browser functionality
function initBrowser(windowEl) {
    const backBtn = windowEl.querySelector('.browser-back');
    const forwardBtn = windowEl.querySelector('.browser-forward');
    const reloadBtn = windowEl.querySelector('.browser-reload');
    const urlInput = windowEl.querySelector('.browser-url');
    const goBtn = windowEl.querySelector('.browser-go');
    const frame = windowEl.querySelector('.browser-frame');
    const shortcuts = windowEl.querySelectorAll('.browser-shortcut');
    
    // Update URL input when iframe loads
    urlInput.value = frame.src;
    
    goBtn.addEventListener('click', () => {
        let url = urlInput.value.trim();
        if (url) {
            // Validate and sanitize URL
            try {
                // If no protocol specified, add https://
                if (!url.match(/^https?:\/\//i)) {
                    url = 'https://' + url;
                }
                // Validate URL format
                new URL(url);
                frame.src = url;
            } catch (e) {
                alert('Invalid URL format. Please enter a valid URL.');
            }
        }
    });
    
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            goBtn.click();
        }
    });
    
    shortcuts.forEach(shortcut => {
        shortcut.addEventListener('click', (e) => {
            e.preventDefault();
            const url = shortcut.getAttribute('data-url');
            frame.src = url;
            urlInput.value = url;
        });
    });
    
    reloadBtn.addEventListener('click', () => {
        frame.src = frame.src;
    });
    
    // Note: back and forward buttons have limited functionality due to iframe restrictions
    backBtn.addEventListener('click', () => {
        try {
            frame.contentWindow.history.back();
        } catch (e) {
            console.log('Cannot navigate iframe history');
        }
    });
    
    forwardBtn.addEventListener('click', () => {
        try {
            frame.contentWindow.history.forward();
        } catch (e) {
            console.log('Cannot navigate iframe history');
        }
    });
}
