// Utility to format dates as YYYY-MM-DD
function todayDate() {
  return new Date().toISOString().split('T')[0];
}

// Load theme from LocalStorage or default to light
const themeToggle = document.getElementById('darkModeToggle');
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.checked = true;
}
themeToggle.addEventListener('change', function() {
  if (this.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
});

// Mood selection
const moodButtons = document.querySelectorAll('.mood-btn');
let selectedMood = 0;
moodButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    moodButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMood = parseInt(btn.getAttribute('data-mood'));
  });
});

// Save mood to LocalStorage
document.getElementById('saveMoodBtn').addEventListener('click', () => {
  if (!selectedMood) return alert('Please select a mood.');
  const note = document.getElementById('mood-note').value || '';
  const entry = { mood: selectedMood, note: note };
  localStorage.setItem(todayDate(), JSON.stringify(entry));
  loadChart(); // refresh chart after saving
  alert('Mood saved!');
});

// Prepare data for the last 7 days
function getLast7DaysData() {
  const data = [];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    const entry = JSON.parse(localStorage.getItem(dateKey) || 'null');
    data.push(entry ? entry.mood : 0);
  }
  return { labels, data };
}

// Render Chart.js bar chart
function loadChart() {
  const ctx = document.getElementById('moodChart').getContext('2d');
  const { labels, data } = getLast7DaysData();
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mood (1=Sad,4=Happy)',
        data: data,
        backgroundColor: '#4a90e2',
      }]
    },
    options: {
      scales: { y: { beginAtZero: true, max: 4 } }
    }
  });
}
loadChart();

// Motivational tips
const tips = [
  "Take a short walk today to clear your mind.",
  "Remember, every day is a fresh start.",
  "Stay hydrated and take deep breaths.",
  "Reflect on something you're grateful for today."
];
// Show a random tip
document.getElementById('tipText').innerText = tips[Math.floor(Math.random()*tips.length)];

// AI Chat Assistant (placeholder fetch call)
document.getElementById('sendChatBtn').addEventListener('click', async () => {
  const input = document.getElementById('userInput');
  const userText = input.value.trim();
  if (!userText) return;

  const chatWindow = document.getElementById('chatWindow');

  // Show user message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.innerText = `You: ${userText}`;
  chatWindow.appendChild(userMsg);
  input.value = '';
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const GEMINI_API_KEY = 'AIzaSyDuTIHm-V7ps7jeqG7LL4oAep6EyTT5Wao'; // 🔑 Use your key here

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY{GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: userText }]
            }
          ]
        })
      }
    );

    const result = await response.json();
    const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '🤖 No response from Gemini.';

    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-message ai';
    aiMsg.innerText = `AI: ${aiText}`;
    chatWindow.appendChild(aiMsg);
    chatWindow.scrollTop = chatWindow.scrollHeight;

  } catch (err) {
    console.error('Gemini API error:', err);
    const errMsg = document.createElement('div');
    errMsg.className = 'chat-message error';
    errMsg.innerText = `⚠️ Error: ${err.message}`;
    chatWindow.appendChild(errMsg);
  }
});