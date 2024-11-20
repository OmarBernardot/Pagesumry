const PROXY_ENDPOINT =
  "https://pagesumry-geej78byr-omarbernardot-gmailcoms-projects.vercel.app";
const MAX_REQUESTS_PER_MINUTE = 10;
const requestTimestamps = [];
const cache = new Map();

function isRateLimited() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }

  requestTimestamps.push(now);
  return false;
}

async function callAIAPI(action, content, question = null) {
  if (isRateLimited()) {
    throw new Error("Rate limit exceeded. Please try again in a minute.");
  }

  const cacheKey = `${action}:${content}:${question}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, content, question }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "AI service rate limit exceeded. Please try again later."
        );
      } else {
        throw new Error(`AI API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error calling AI API:", error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize" || request.action === "ask") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getPageContent" },
        function (response) {
          if (chrome.runtime.lastError) {
            sendResponse({
              error:
                "Error getting page content: " +
                chrome.runtime.lastError.message,
            });
            return;
          }

          const content = response.content;
          callAIAPI(request.action, content, request.question)
            .then((data) => {
              if (request.action === "summarize") {
                sendResponse({ summary: data.summary });
              } else {
                sendResponse({ answer: data.answer });
              }
            })
            .catch((error) => {
              console.error("Error in background script:", error);
              sendResponse({ error: error.message });
            });
        }
      );
    });
    return true; // Indicates that the response is sent asynchronously
  }
});
