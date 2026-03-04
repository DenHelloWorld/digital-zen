const openSidePanelButton = document.getElementById('openSidePanelButton');

openSidePanelButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: 'openSidePanel' });
});
