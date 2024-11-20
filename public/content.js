function getPageContent() {
  return document.body.innerText;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize" || request.action === "ask") {
    const pageContent = getPageContent();
    sendResponse({ content: pageContent });
  }
  return true; // Indicates that the response is sent asynchronously
});
