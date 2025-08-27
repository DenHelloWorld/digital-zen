/// <reference types="chrome"/>
console.log('Сервисный воркер Цифрового Дзена запущен.');

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Произошло событие: onActivated. ID вкладки: ${activeInfo.tabId}`);
});

// Прослушиватель события "обновление вкладки"
chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    console.log(`Произошло событие: onUpdated. URL загруженной вкладки: ${tab.url}`);
  }
});

// Прослушиватель события "посещение истории"
chrome.history.onVisited.addListener((historyItem) => {
  console.log(`Произошло событие: onVisited. Посещенная страница: ${historyItem.url}`);
});
