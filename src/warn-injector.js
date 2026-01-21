(function injectWarnBanner() {

  // TODO: build thought angular app
  if (document.querySelector('.dz-banner.dz-banner--warn')) return;

  // Подключение dz-banner.css из digital-zen-pack
  const styleHref = chrome.runtime.getURL('dist/chromium/dz-banner.css');
  if (!document.querySelector(`link[href="${styleHref}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = styleHref;
    document.head.appendChild(link);
  }

  // Инъекция island-style локальных стилей для dz-banner (желтый warn)
  if (!document.getElementById('dz-banner-warn-style')) {
    const style = document.createElement('style');
    style.id = 'dz-banner-warn-style';
    style.textContent = `
      .dz-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: #fffbe6;
        color: #7c5a00;
        width: max-content;
        max-width: 96vw;
        min-width: 260px;
        padding: 10px 24px;
        border-radius: 20px;
        font-size: 15px;
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        box-shadow: 0 4px 16px rgba(0,0,0,0.10);
        border: 1.5px solid #fbbf24;
        animation: dz-banner-fade-in 0.3s cubic-bezier(.4,1.4,.6,1) forwards;
        opacity: 0;
      }
      @keyframes dz-banner-fade-in {
        from { opacity: 0; transform: translateX(-50%) scale(0.96); }
        to { opacity: 1; transform: translateX(-50%) scale(1); }
      }
      .dz-banner__icon {
        font-size: 22px;
        margin-right: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dz-banner__message {
        font-size: 15px;
        color: #7c5a00;
        font-weight: 500;
        white-space: nowrap;
        margin: 0 0 0 0;
      }
      .dz-banner__close {
        margin-left: 16px;
        padding: 3px 14px;
        font-size: 13px;
        background: transparent;
        border: 1.2px solid #fbbf24;
        border-radius: 16px;
        color: #b45309;
        cursor: pointer;
        font-weight: 400;
        white-space: nowrap;
        transition: background 0.2s, border 0.2s;
        outline: none;
      }
      .dz-banner__close:hover {
        background: #fde68a;
        border-color: #fbbf24;
      }
    `;
    document.head.appendChild(style);
  }

  const container = document.createElement('div');
  container.className = 'dz-banner dz-banner--warn';
  container.innerHTML = `
    <div class="dz-banner__icon" aria-label="Warning">⚠️</div>
    <div class="dz-banner__message">This site may distract you from your focus session.</div>
    <button class="dz-banner__close" aria-label="Hide warning">Continue (hide warning)</button>
  `;
  document.body.appendChild(container);
  container.querySelector('.dz-banner__close').onclick = () => container.remove();
})();
