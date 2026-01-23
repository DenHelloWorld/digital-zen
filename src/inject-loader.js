(async () => {
  if (window.hasDigitalZenBanner) {
    return;
  }
  window.hasDigitalZenBanner = true;

  let warnBanner = document.getElementById('dz-wrapper');

  chrome.runtime.onMessage.addListener(msg => {
    if (!warnBanner) {
      return;
    }

    if (msg.action === 'showBanner') {
      warnBanner.style.display = 'block';
    } else if (msg.action === 'hideBanner') {
      warnBanner.style.display = 'none';
    }
  });

  try {
    const res = await fetch(chrome.runtime.getURL('banner.html'));
    const html = await res.text();

    warnBanner = document.createElement('div');
    warnBanner.id = 'dz-wrapper';
    warnBanner.style.display = 'none';
    warnBanner.innerHTML = html;
    document.body.appendChild(warnBanner);

    // Обработка кнопки закрытия
    const closeBtn = warnBanner.querySelector('#dz-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => (warnBanner.style.display = 'none');
    }
  } catch (err) {
    console.error('Failed to load Digital Zen banner:', err);
  }
})();
