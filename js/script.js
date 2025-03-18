// Data structure
let lotteryData = {
    eventName: "",
    eventDescription: "",
    prizes: [],
    participants: [],
    useWeight: false,
    history: []
};

// DOM elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const themeToggle = document.getElementById('themeToggle');

// Settings tab
const eventNameInput = document.getElementById('eventName');
const eventDescriptionInput = document.getElementById('eventDescription');
const prizeTitleInput = document.getElementById('prizeTitle');
const prizeDescriptionInput = document.getElementById('prizeDescription');
const winnerCountInput = document.getElementById('winnerCount');
const addPrizeBtn = document.getElementById('addPrize');
const participantInput = document.getElementById('participantInput');
const participantWeightInput = document.getElementById('participantWeight');
const addParticipantBtn = document.getElementById('addParticipant');
const bulkImportInput = document.getElementById('bulkImport');
const bulkImportBtn = document.getElementById('bulkImportBtn');
const participantList = document.getElementById('participantList');
const useWeightCheckbox = document.getElementById('useWeight');
const resetSettingsBtn = document.getElementById('resetSettings');
const saveSettingsBtn = document.getElementById('saveSettings');

// Draw tab
const prizeSelect = document.getElementById('prizeSelect');
const drumContent = document.getElementById('drumContent');
const startDrawBtn = document.getElementById('startDraw');
const stopDrawBtn = document.getElementById('stopDraw');
const winnerDisplay = document.getElementById('winnerDisplay');
const winnerNameElement = document.getElementById('winnerName');
const winnerPrizeElement = document.getElementById('winnerPrize');

// History tab
const historyList = document.getElementById('historyList');

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Dark mode toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// Add prize
addPrizeBtn.addEventListener('click', () => {
    const title = prizeTitleInput.value.trim();
    const description = prizeDescriptionInput.value.trim();
    const count = parseInt(winnerCountInput.value);
    
    if (!title) {
        alert('请输入奖项名称');
        return;
    }
    
    if (count < 1) {
        alert('获奖人数必须大于0');
        return;
    }
    
    lotteryData.prizes.push({
        id: Date.now().toString(),
        title,
        description,
        count,
        winners: []
    });
    
    updatePrizeSelect();
    
    prizeTitleInput.value = '';
    prizeDescriptionInput.value = '';
    winnerCountInput.value = '1';
});

// Add participant
addParticipantBtn.addEventListener('click', () => {
    const name = participantInput.value.trim();
    const weight = parseInt(participantWeightInput.value);
    
    if (!name) {
        alert('请输入参与者姓名');
        return;
    }
    
    if (weight < 1) {
        alert('权重必须大于0');
        return;
    }
    
    lotteryData.participants.push({
        id: Date.now().toString(),
        name,
        weight
    });
    
    updateParticipantList();
    
    participantInput.value = '';
    participantWeightInput.value = '1';
});

// Bulk import
bulkImportBtn.addEventListener('click', () => {
    const text = bulkImportInput.value.trim();
    
    if (!text) {
        alert('请输入参与者数据');
        return;
    }
    
    const lines = text.split('\n');
    
    lines.forEach(line => {
        const parts = line.split(',');
        const name = parts[0].trim();
        const weight = parts.length > 1 ? parseInt(parts[1]) : 1;
        
        if (name && weight > 0) {
            lotteryData.participants.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name,
                weight: isNaN(weight) ? 1 : weight
            });
        }
    });
    
    updateParticipantList();
    bulkImportInput.value = '';
});

// Use weight checkbox
useWeightCheckbox.addEventListener('change', () => {
    lotteryData.useWeight = useWeightCheckbox.checked;
});

// Save settings
saveSettingsBtn.addEventListener('click', () => {
    lotteryData.eventName = eventNameInput.value.trim();
    lotteryData.eventDescription = eventDescriptionInput.value.trim();
    lotteryData.useWeight = useWeightCheckbox.checked;
    
    localStorage.setItem('lotteryData', JSON.stringify(lotteryData));
    alert('设置已保存');
});

// Reset settings
resetSettingsBtn.addEventListener('click', () => {
    if (confirm('确定要重置所有设置吗？这将删除所有奖项和参与者数据。')) {
        lotteryData = {
            eventName: "",
            eventDescription: "",
            prizes: [],
            participants: [],
            useWeight: false,
            history: []
        };
        
        updateUI();
        localStorage.removeItem('lotteryData');
    }
});

// Start draw
startDrawBtn.addEventListener('click', () => {
    const selectedPrizeId = prizeSelect.value;
    
    if (!selectedPrizeId) {
        alert('请选择奖项');
        return;
    }
    
    const availableParticipants = lotteryData.participants.filter(p => {
        const isAlreadyWinner = lotteryData.prizes.some(prize => 
            prize.winners.some(winner => winner.participantId === p.id)
        );
        return !isAlreadyWinner;
    });
    
    if (availableParticipants.length === 0) {
        alert('没有可用的参与者');
        return;
    }
    
    const selectedPrize = lotteryData.prizes.find(p => p.id === selectedPrizeId);
    
    if (selectedPrize.winners.length >= selectedPrize.count) {
        alert(`${selectedPrize.title} 已经抽取完毕`);
        return;
    }
    
    startDrawing(availableParticipants);
});

// Stop draw
stopDrawBtn.addEventListener('click', () => {
    stopDrawing();
});

// Helper functions
function updatePrizeSelect() {
    prizeSelect.innerHTML = '<option value="">-- 请选择奖项 --</option>';
    
    lotteryData.prizes.forEach(prize => {
        const option = document.createElement('option');
        option.value = prize.id;
        option.textContent = `${prize.title} - ${prize.description} (${prize.winners.length}/${prize.count})`;
        prizeSelect.appendChild(option);
    });
}

function updateParticipantList() {
    participantList.innerHTML = '';
    
    lotteryData.participants.forEach(participant => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'participant-name';
        nameSpan.textContent = participant.name;
        
        const weightSpan = document.createElement('span');
        weightSpan.className = 'participant-weight';
        weightSpan.textContent = `权重: ${participant.weight}`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', () => {
            lotteryData.participants = lotteryData.participants.filter(p => p.id !== participant.id);
            updateParticipantList();
        });
        
        item.appendChild(nameSpan);
        item.appendChild(weightSpan);
        item.appendChild(deleteBtn);
        
        participantList.appendChild(item);
    });
}

function updateHistoryList() {
    historyList.innerHTML = '';
    
    if (lotteryData.history.length === 0) {
        historyList.innerHTML = '<div class="history-item">暂无抽奖记录</div>';
        return;
    }
    
    lotteryData.history.forEach(record => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'history-date';
        dateDiv.textContent = new Date(record.timestamp).toLocaleString();
        
        const prizeDiv = document.createElement('div');
        prizeDiv.className = 'history-prize';
        prizeDiv.textContent = `${record.prizeTitle} - ${record.prizeDescription}`;
        
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'history-winner';
        winnerDiv.textContent = `获奖者: ${record.winnerName}`;
        
        item.appendChild(dateDiv);
        item.appendChild(prizeDiv);
        item.appendChild(winnerDiv);
        
        historyList.appendChild(item);
    });
}

function updateUI() {
    eventNameInput.value = lotteryData.eventName;
    eventDescriptionInput.value = lotteryData.eventDescription;
    useWeightCheckbox.checked = lotteryData.useWeight;
    
    updatePrizeSelect();
    updateParticipantList();
    updateHistoryList();
}

// Drawing logic
let drawingInterval;
let participants = [];
let selectedPrize;

function startDrawing(availableParticipants) {
    participants = availableParticipants;
    selectedPrize = lotteryData.prizes.find(p => p.id === prizeSelect.value);
    
    document.querySelector('.drum').classList.add('spinning');
    startDrawBtn.style.display = 'none';
    stopDrawBtn.style.display = 'inline-block';
    winnerDisplay.style.display = 'none';
    
    let i = 0;
    drawingInterval = setInterval(() => {
        i = (i + 1) % participants.length;
        drumContent.textContent = participants[i].name;
    }, 100);
}

function stopDrawing() {
    clearInterval(drawingInterval);
    document.querySelector('.drum').classList.remove('spinning');
    startDrawBtn.style.display = 'inline-block';
    stopDrawBtn.style.display = 'none';
    
    // Select winner
    let winner;
    
    if (lotteryData.useWeight) {
        // Weighted selection
        const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < participants.length; i++) {
            random -= participants[i].weight;
            if (random <= 0) {
                winner = participants[i];
                break;
            }
        }
        
        // Fallback if something went wrong
        if (!winner) {
            winner = participants[Math.floor(Math.random() * participants.length)];
        }
    } else {
        // Random selection
        winner = participants[Math.floor(Math.random() * participants.length)];
    }
    
    // Add to prize winners
    selectedPrize.winners.push({
        participantId: winner.id,
        name: winner.name,
        timestamp: Date.now()
    });
    
    // Add to history
    lotteryData.history.unshift({
        timestamp: Date.now(),
        prizeId: selectedPrize.id,
        prizeTitle: selectedPrize.title,
        prizeDescription: selectedPrize.description,
        winnerId: winner.id,
        winnerName: winner.name
    });
    
    // Update UI
    updatePrizeSelect();
    updateHistoryList();
    
    // Show winner
    winnerNameElement.textContent = winner.name;
    winnerPrizeElement.textContent = `${selectedPrize.title} - ${selectedPrize.description}`;
    winnerDisplay.style.display = 'block';
    
    // Create confetti effect
    createConfetti();
    
    // Save to local storage
    localStorage.setItem('lotteryData', JSON.stringify(lotteryData));
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = getRandomColor();
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        
        document.body.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function getRandomColor() {
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Load data on startup
window.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('lotteryData');
    
    if (savedData) {
        try {
            lotteryData = JSON.parse(savedData);
            updateUI();
        } catch (e) {
            console.error('Failed to load saved data:', e);
        }
    }
});