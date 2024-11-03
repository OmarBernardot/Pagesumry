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

function extractMainContent(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove script and style elements
  const scripts = doc.getElementsByTagName("script");
  const styles = doc.getElementsByTagName("style");
  Array.from(scripts).forEach((script) => script.remove());
  Array.from(styles).forEach((style) => style.remove());

  // Get text from body
  return doc.body.innerText;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize" || request.action === "ask") {
    fetch(request.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch page content: ${response.status} ${response.statusText}`
          );
        }
        return response.text();
      })
      .then((html) => {
        const mainContent = extractMainContent(html);
        return callAIAPI(request.action, mainContent, request.question);
      })
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
  return true; // Indicates that the response is sent asynchronously
});
