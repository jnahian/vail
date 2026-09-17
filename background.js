// Veil service worker: context menu, keyboard shortcuts, toolbar badge.
const MENU_ID = 'veil-element';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: MENU_ID, title: 'Veil this element', contexts: ['all'] });
  });
});

// Tabs opened before install have no content script yet, so inject on demand.
async function sendToTab(tabId, msg) {
  try {
    return await chrome.tabs.sendMessage(tabId, msg);
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
      return await chrome.tabs.sendMessage(tabId, msg);
    } catch (err) {
      console.warn('Veil cannot run on this tab:', err);
      return null;
    }
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID && tab?.id != null) {
    sendToTab(tab.id, { type: 'veil:pickContext' });
  }
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === 'start-picker') {
    if (!tab) [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id != null) sendToTab(tab.id, { type: 'veil:pick' });
  } else if (command === 'toggle-money-reveal') {
    if (!tab) [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id != null) sendToTab(tab.id, { type: 'veil:moneyReveal' });
  } else if (command === 'toggle-pause') {
    const { paused } = await chrome.storage.local.get('paused');
    await chrome.storage.local.set({ paused: !paused });
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === 'veil:count' && sender.tab?.id != null) {
    const tabId = sender.tab.id;
    chrome.action.setBadgeText({ tabId, text: msg.n ? String(msg.n) : '' }).catch(() => {});
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#5B4BDB' }).catch(() => {});
    chrome.action.setBadgeTextColor?.({ tabId, color: '#FFFFFF' })?.catch?.(() => {});
  }
});
