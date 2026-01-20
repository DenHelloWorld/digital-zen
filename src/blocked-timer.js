let timeLeft = 20;
const timerElement = document.getElementById('timer');

const interval = setInterval(() => {
  timeLeft--;

  if (timerElement) {
    timerElement.textContent = timeLeft.toString();
  }

  if (timeLeft <= 0) {
    clearInterval(interval);
    chrome.runtime.sendMessage({ command: 'closeTab' });
  }
}, 1000);
