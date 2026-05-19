// ======== 祖国人桌面宠物 - 主脚本 ========

const pet = document.getElementById('pet-container');
const speechBubble = document.getElementById('speech-bubble');
const quoteText = document.getElementById('quote-text');
const laserExplosion = document.getElementById('laser-explosion');

// 祖国人经典语录
const quotes = [
    "我是这个国家最伟大的英雄！",
    "我可以做任何我想做的事。",
    "他们需要我，他们崇拜我。",
    "我才是真正的英雄。",
    "没有人能阻止我。",
    "我为人民而战！...大概吧。",
    "你知道我能从太空看到你吗？",
    "我是祖国人，我无所不能！",
    "牛奶... 我想喝牛奶。🥛",
    "我可以用眼睛烧穿任何东西。",
    "我不需要团队，我就是团队。",
    "你在看我吗？",
    "我是上帝。",
    "鼓掌！我说鼓掌！👏",
    "I can do whatever I want.",
    "我会飞，而你不会。🛫",
    "别让我不开心...",
    "你们都欠我的！"
];

// 状态管理
let isDragging = false;
let isFlying = false;
let isLasering = false;
let clickTimer = null;
let dragStartTime = 0;
let lastX = 0;
let lastY = 0;
let offsetX = 0;
let offsetY = 0;
let velocityX = 0;
let velocityY = 0;
let animFrameId = null;

// 初始位置
let petX = window.innerWidth / 2 - 60;
let petY = window.innerHeight / 2 - 80;
pet.style.left = petX + 'px';
pet.style.top = petY + 'px';
pet.style.transform = 'none';
pet.classList.add('idle');

// ======== 时钟 ========
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${h}:${m}`;
}
setInterval(updateClock, 1000);
updateClock();

// ======== 拖动飞行 ========
pet.addEventListener('mousedown', startDrag);
pet.addEventListener('touchstart', startDragTouch, { passive: false });
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', dragTouch, { passive: false });
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDragTouch);

function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    dragStartTime = Date.now();
    offsetX = e.clientX - petX;
    offsetY = e.clientY - petY;
    lastX = e.clientX;
    lastY = e.clientY;
    velocityX = 0;
    velocityY = 0;
    
    pet.classList.remove('idle', 'landing');
    pet.classList.add('flying');
    isFlying = true;
    
    if (animFrameId) cancelAnimationFrame(animFrameId);
}

function startDragTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    isDragging = true;
    dragStartTime = Date.now();
    offsetX = touch.clientX - petX;
    offsetY = touch.clientY - petY;
    lastX = touch.clientX;
    lastY = touch.clientY;
    velocityX = 0;
    velocityY = 0;
    
    pet.classList.remove('idle', 'landing');
    pet.classList.add('flying');
    isFlying = true;
}

function drag(e) {
    if (!isDragging) return;
    
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;
    
    // 计算速度
    velocityX = e.clientX - lastX;
    velocityY = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    
    petX = newX;
    petY = newY;
    pet.style.left = petX + 'px';
    pet.style.top = petY + 'px';
    
    // 根据移动方向倾斜
    const tilt = Math.max(-20, Math.min(20, velocityX * 2));
    pet.style.transform = `rotate(${tilt}deg)`;
    
    // 创建速度线效果
    createSpeedLines(e.clientX, e.clientY, velocityX, velocityY);
}

function dragTouch(e) {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    
    const newX = touch.clientX - offsetX;
    const newY = touch.clientY - offsetY;
    
    velocityX = touch.clientX - lastX;
    velocityY = touch.clientY - lastY;
    lastX = touch.clientX;
    lastY = touch.clientY;
    
    petX = newX;
    petY = newY;
    pet.style.left = petX + 'px';
    pet.style.top = petY + 'px';
    
    const tilt = Math.max(-20, Math.min(20, velocityX * 2));
    pet.style.transform = `rotate(${tilt}deg)`;
    
    createSpeedLines(touch.clientX, touch.clientY, velocityX, velocityY);
}

function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    
    const dragDuration = Date.now() - dragStartTime;
    
    // 如果拖动时间很短且距离很小，视为点击
    if (dragDuration < 200 && Math.abs(velocityX) < 3 && Math.abs(velocityY) < 3) {
        stopFlying();
        return;
    }
    
    // 惯性滑动
    applyInertia();
}

function endDragTouch(e) {
    if (!isDragging) return;
    isDragging = false;
    
    const dragDuration = Date.now() - dragStartTime;
    
    if (dragDuration < 200 && Math.abs(velocityX) < 3 && Math.abs(velocityY) < 3) {
        stopFlying();
        return;
    }
    
    applyInertia();
}

function applyInertia() {
    let vx = velocityX * 2;
    let vy = velocityY * 2;
    const friction = 0.95;
    
    function animate() {
        vx *= friction;
        vy *= friction;
        
        petX += vx;
        petY += vy;
        
        // 边界检测
        if (petX < 0) { petX = 0; vx *= -0.5; }
        if (petX > window.innerWidth - 120) { petX = window.innerWidth - 120; vx *= -0.5; }
        if (petY < 0) { petY = 0; vy *= -0.5; }
        if (petY > window.innerHeight - 200) { petY = window.innerHeight - 200; vy *= -0.5; }
        
        pet.style.left = petX + 'px';
        pet.style.top = petY + 'px';
        
        const tilt = Math.max(-15, Math.min(15, vx * 3));
        pet.style.transform = `rotate(${tilt}deg)`;
        
        if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
            animFrameId = requestAnimationFrame(animate);
        } else {
            stopFlying();
        }
    }
    
    animFrameId = requestAnimationFrame(animate);
}

function stopFlying() {
    isFlying = false;
    pet.classList.remove('flying');
    pet.classList.add('landing');
    pet.style.transform = 'rotate(0deg)';
    
    setTimeout(() => {
        pet.classList.remove('landing');
        pet.classList.add('idle');
    }, 500);
}

// 速度线效果
function createSpeedLines(x, y, vx, vy) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed < 5) return;
    
    const line = document.createElement('div');
    line.className = 'speed-line';
    line.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
    line.style.top = (y + (Math.random() - 0.5) * 40) + 'px';
    line.style.height = (speed * 2) + 'px';
    line.style.transform = `rotate(${Math.atan2(vy, vx) + Math.PI/2}rad)`;
    document.body.appendChild(line);
    
    setTimeout(() => line.remove(), 500);
}

// ======== 点击语录 ========
pet.addEventListener('click', handleClick);

function handleClick(e) {
    // 避免拖动结束后触发
    if (isFlying) return;
    
    // 双击检测
    if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        handleDoubleClick(e);
        return;
    }
    
    clickTimer = setTimeout(() => {
        clickTimer = null;
        showQuote();
    }, 250);
}

function showQuote() {
    if (isLasering) return;
    
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = quote;
    
    // 定位气泡在宠物上方
    speechBubble.classList.remove('hidden');
    speechBubble.style.left = (petX + 60 - 125) + 'px';
    speechBubble.style.top = (petY - 70) + 'px';
    
    // 确保不超出屏幕
    const bubbleRect = speechBubble.getBoundingClientRect();
    if (bubbleRect.left < 10) {
        speechBubble.style.left = '10px';
    }
    if (bubbleRect.right > window.innerWidth - 10) {
        speechBubble.style.left = (window.innerWidth - 260) + 'px';
    }
    if (bubbleRect.top < 10) {
        speechBubble.style.top = (petY + 170) + 'px';
    }
    
    // 宠物反应动画
    pet.style.transform = 'scale(1.1)';
    setTimeout(() => {
        pet.style.transform = 'scale(1)';
    }, 200);
    
    // 自动隐藏
    setTimeout(() => {
        speechBubble.classList.add('hidden');
    }, 3000);
}

// ======== 双击镭射眼 ========
function handleDoubleClick(e) {
    if (isLasering) return;
    isLasering = true;
    
    // 隐藏语录
    speechBubble.classList.add('hidden');
    
    // 停止闲置动画
    pet.classList.remove('idle');
    
    // 激活镭射
    pet.classList.add('laser-active');
    
    // 屏幕震动
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 300);
    
    // 创建多个爆炸效果
    createLaserExplosions();
    
    // 持续2秒
    setTimeout(() => {
        pet.classList.remove('laser-active');
        pet.classList.add('idle');
        isLasering = false;
    }, 2000);
}

function createLaserExplosions() {
    const count = 5;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const explosion = document.createElement('div');
            explosion.className = 'laser-explosion';
            explosion.style.left = (petX + 40 + (Math.random() - 0.5) * 100) + 'px';
            explosion.style.top = (petY + 200 + Math.random() * 300) + 'px';
            document.body.appendChild(explosion);
            
            // 二次震动
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 200);
            
            setTimeout(() => explosion.remove(), 600);
        }, i * 300);
    }
}

// ======== 眼睛跟随鼠标 ========
document.addEventListener('mousemove', (e) => {
    if (isLasering) return;
    
    const pupils = document.querySelectorAll('.pupil');
    pupils.forEach(pupil => {
        const eye = pupil.parentElement;
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;
        
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const distance = Math.min(2, Math.sqrt(
            Math.pow(e.clientX - eyeCenterX, 2) + 
            Math.pow(e.clientY - eyeCenterY, 2)
        ) / 50);
        
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
});

// ======== 窗口大小调整 ========
window.addEventListener('resize', () => {
    if (petX > window.innerWidth - 120) petX = window.innerWidth - 120;
    if (petY > window.innerHeight - 200) petY = window.innerHeight - 200;
    pet.style.left = petX + 'px';
    pet.style.top = petY + 'px';
});

// ======== 悬停任务提醒 ========
const taskTooltip = document.getElementById('task-tooltip');
const taskContent = document.getElementById('task-content');
const taskTime = document.getElementById('task-time');

// 任务列表 - 模拟祖国人正在执行的任务
const tasks = [
    { icon: '🛡️', text: '巡视沃特国际总部', active: true },
    { icon: '📺', text: '准备电视采访', active: false },
    { icon: '🥛', text: '喝牛奶补充能量', active: false },
    { icon: '👀', text: '监视黑袍纠察队', active: false },
    { icon: '💪', text: '维护英雄形象', active: false },
];

// 随机任务组合
const taskSets = [
    [
        { icon: '🛡️', text: '巡视沃特国际总部', active: true },
        { icon: '📺', text: '准备电视采访', active: false },
        { icon: '🥛', text: '喝牛奶', active: false },
    ],
    [
        { icon: '👁️', text: '用透视眼搜索目标', active: true },
        { icon: '🦸', text: '拍摄宣传照', active: false },
        { icon: '💀', text: '处理叛徒', active: false },
    ],
    [
        { icon: '🌍', text: '拯救世界（表面上）', active: true },
        { icon: '📱', text: '查看社交媒体评论', active: false },
        { icon: '😤', text: '对星光发火', active: false },
    ],
    [
        { icon: '✈️', text: '高空飞行巡逻', active: true },
        { icon: '🎬', text: '拍摄英雄纪录片', active: false },
        { icon: '🏢', text: '开沃特董事会', active: false },
    ],
    [
        { icon: '🔥', text: '练习镭射眼精准度', active: true },
        { icon: '🥛', text: '喝牛奶补充能量', active: false },
        { icon: '👔', text: '检查战衣状态', active: false },
    ],
    [
        { icon: '📡', text: '监听全城通讯', active: true },
        { icon: '💪', text: '维护公众英雄形象', active: false },
        { icon: '😈', text: '密谋下一步计划', active: false },
    ],
];

let hoverTimer = null;
let isHovering = false;

pet.addEventListener('mouseenter', handleMouseEnter);
pet.addEventListener('mouseleave', handleMouseLeave);

function handleMouseEnter() {
    if (isDragging || isLasering) return;
    
    // 延迟显示，避免快速经过时闪烁
    hoverTimer = setTimeout(() => {
        isHovering = true;
        showTaskTooltip();
    }, 400);
}

function handleMouseLeave() {
    if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
    }
    isHovering = false;
    taskTooltip.classList.remove('visible');
}

function showTaskTooltip() {
    // 随机选择一组任务
    const currentTasks = taskSets[Math.floor(Math.random() * taskSets.length)];
    
    // 构建任务内容
    let html = '';
    currentTasks.forEach(task => {
        const activeClass = task.active ? 'active' : '';
        const checkIcon = task.active ? '▶' : '○';
        html += `<div class="task-item">
            <span class="task-icon">${task.active ? task.icon : checkIcon}</span>
            <span class="task-text ${activeClass}">${task.text}</span>
        </div>`;
    });
    taskContent.innerHTML = html;
    
    // 更新时间
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    taskTime.textContent = `🕐 当前时间 ${h}:${m}`;
    
    // 更新状态灯
    const statusIcon = taskTooltip.querySelector('.status-icon');
    statusIcon.className = 'status-icon' + (currentTasks[0].active ? ' busy' : '');
    
    // 定位在宠物上方
    const tooltipX = petX + 60 - 140;
    const tooltipY = petY - 130;
    
    taskTooltip.style.left = Math.max(10, Math.min(tooltipX, window.innerWidth - 290)) + 'px';
    taskTooltip.style.top = Math.max(10, tooltipY < 10 ? petY + 170 : tooltipY) + 'px';
    
    taskTooltip.classList.add('visible');
}

// 拖动时隐藏tooltip
const originalStartDrag = startDrag;
pet.removeEventListener('mousedown', startDrag);
pet.addEventListener('mousedown', function(e) {
    // 隐藏tooltip
    if (isHovering) {
        isHovering = false;
        taskTooltip.classList.remove('visible');
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
    }
    originalStartDrag(e);
});

// ======== 初始欢迎 ========
setTimeout(() => {
    showQuote();
}, 1000);
