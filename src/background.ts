/**
 * Event Inspector - Background Service Worker
 * 
 * Injects content script when user clicks the extension icon.
 * Uses chrome.action.onClicked pattern (not popup).
 */

chrome.action.onClicked.addListener(async (tab) => {
  // Guard: tab must exist
  if (!tab.id) {
    console.error('[Event Inspector] No tab ID available')
    return
  }

  try {
    // Inject the content script into the active tab
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ['content-script.js'],
    })
    
    console.log('[Event Inspector] Content script injected into tab:', tab.id)
  } catch (error) {
    console.error('[Event Inspector] Failed to inject content script:', error)
  }
})

// Log when service worker starts
console.log('[Event Inspector] Background service worker loaded')