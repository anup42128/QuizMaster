'use strict';

const config = {
  username: null,
  topic: null,
  level: null,
  timeLimit: parseInt(document.getElementById('timeLimit').value)
};

let currentSection = 0;
const sections = ['usernameSection', 'topicSection', 'timerSection', 'levelSection'];
let leaderboardInterval = null;

function validateUsername() {
  const usernameInput = document.getElementById('username');
  const username = usernameInput.value.trim();
  if (!username) {
    showError('usernameError');
    usernameInput.focus();
    return;
  }
  config.username = username;
  showNextSection();
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function showLeaderboard() {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('leaderboardSection').classList.add('active');
  loadLeaderboard();
  if (leaderboardInterval) clearInterval(leaderboardInterval);
  leaderboardInterval = setInterval(() => loadLeaderboard(document.getElementById('topicFilter').value), 30000);
}

function returnToMain() {
  if (leaderboardInterval) clearInterval(leaderboardInterval);
  currentSection = 0;
  updateProgress();
  transitionToSection(sections[currentSection]);
}

function loadLeaderboard(selectedTopic = '') {
  const container = document.getElementById('leaderboardContainer');
  container.innerHTML = '';

  const leaderboards = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('_leaderboard')) {
      const [topic, level] = key.replace('_leaderboard', '').split('_');
      if (selectedTopic && topic !== selectedTopic) continue;
      const entries = JSON.parse(localStorage.getItem(key)) || [];

      if (!leaderboards[`${topic}_${level}`]) {
        leaderboards[`${topic}_${level}`] = {
          topic,
          level,
          entries: entries.slice(0, 5)
        };
      }
    }
  }

  if (Object.keys(leaderboards).length === 0 && !selectedTopic) {
    container.innerHTML = '<div class="no-scores">No scores recorded yet. Be the first!</div>';
    return;
  }

  const sortedCategories = Object.values(leaderboards).sort((a, b) => {
    if (a.topic === b.topic) return a.level.localeCompare(b.level);
    return a.topic.localeCompare(b.topic);
  });

  sortedCategories.forEach(({ topic, level, entries }) => {
    const section = document.createElement('div');
    section.className = 'leaderboard-category';
    section.innerHTML = `
      <h3>${topic.charAt(0).toUpperCase() + topic.slice(1)} - ${level.charAt(0).toUpperCase() + level.slice(1)}</h3>
      ${entries.length > 0 ? 
        entries.map((entry, index) => `
          <div class="leaderboard-entry">
            <span class="rank">#${index + 1}</span>
            <div class="entry-details">
              <span>${entry.username}</span>
              <span class="entry-score">${entry.score}%</span>
            </div>
          </div>
        `).join('') :
        '<div class="no-scores">No scores yet for this category</div>'
      }
    `;
    container.appendChild(section);
  });

  if (!selectedTopic) {
    if (Object.keys(leaderboards).length === 0) {
      container.innerHTML = '<div class="no-scores">No scores recorded yet. Start playing to appear here!</div>';
    }
  } else {
    if (Object.keys(leaderboards).length === 0) {
      container.innerHTML = `<div class="no-scores">No scores recorded for ${selectedTopic}. Start playing to appear here!</div>`;
    }
  }
}

const topicSearchInput = document.getElementById('topicSearch');
topicSearchInput.addEventListener('input', debounce(function(e) {
  const searchTerm = e.target.value.toLowerCase();
  const topics = document.querySelectorAll('.option-btn[data-topic]');
  topics.forEach(topic => {
    const text = topic.textContent.toLowerCase();
    topic.classList.toggle('hidden', !text.includes(searchTerm));
  });
}, 300));

function showNextSection() {
  if (!validateCurrentSection()) return;
  currentSection = Math.min(currentSection + 1, sections.length - 1);
  updateProgress();
  transitionToSection(sections[currentSection]);
}

function showPreviousSection() {
  currentSection = Math.max(currentSection - 1, 0);
  updateProgress();
  transitionToSection(sections[currentSection]);
}

function transitionToSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  requestAnimationFrame(() => {
    document.getElementById(sectionId).classList.add('active');
  });
}

function validateCurrentSection() {
  const sectionId = sections[currentSection];
  let isValid = true;
  if (sectionId === 'topicSection' && !config.topic) {
    showError('topicError');
    isValid = false;
  } else if (sectionId === 'levelSection' && !config.level) {
    showError('levelError');
    isValid = false;
  }
  return isValid;
}

function showError(elementId) {
  const errorElement = document.getElementById(elementId);
  errorElement.classList.add('error-visible');
  setTimeout(() => errorElement.classList.remove('error-visible'), 3000);
}

function updateProgress() {
  const progress = ((currentSection + 1) / sections.length) * 100;
  document.querySelector('.progress-bar').style.width = `${progress}%`;
}

document.querySelectorAll('.option-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll(`.option-btn`).forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    if (this.dataset.topic) {
      config.topic = this.dataset.topic;
      showNextSection();
    }
    if (this.dataset.level) {
      config.level = this.dataset.level;
    }
  });
});

document.getElementById('timeLimit').addEventListener('change', function() {
  config.timeLimit = parseInt(this.value);
});

function startQuiz() {
  if (!validateCurrentSection()) return;
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingProgress = document.querySelector('.loading-progress');
  loadingScreen.classList.add('active');
  loadingProgress.style.width = '100%';
  setTimeout(() => {
    window.location.href = `play.html?username=${encodeURIComponent(config.username)}&topic=${config.topic}&level=${config.level}&time=${config.timeLimit}`;
  }, 2000);
}

const touchstartX = 0;
const touchendX = 0;
const minSwipeDistance = 50;

document.addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX;
  const swipeDistance = touchendX - touchstartX;
  if (Math.abs(swipeDistance) > minSwipeDistance) {
    swipeDistance > 0 ? showPreviousSection() : showNextSection();
  }
}, { passive: true });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

window.addEventListener('resize', () => {
  cancelAnimationFrame(window.resizeFrame);
  window.resizeFrame = requestAnimationFrame(() => {
    // Handle responsive layout changes
  });
});

function filterLeaderboard() {
  const selectedTopic = document.getElementById('topicFilter').value;
  loadLeaderboard(selectedTopic);
}