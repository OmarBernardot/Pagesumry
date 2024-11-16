document.addEventListener("DOMContentLoaded", function () {
  // UI Elements
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const summarizeBtn = document.getElementById("summarize-btn");
  const askBtn = document.getElementById("ask-btn");
  const questionInput = document.getElementById("question-input");
  const summaryOutput = document.getElementById("summary-output");
  const answerOutput = document.getElementById("answer-output");
  const loading = document.getElementById("loading");
  const progress = document.querySelector(".progress");
  const actions = document.querySelector(".actions");
  const copyBtn = document.getElementById("copy-btn");
  const readBtn = document.getElementById("read-btn");
  const expandBtn = document.getElementById("expand-btn");

  // Tab switching logic
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      document
        .getElementById(`${tab.dataset.tab}-content`)
        .classList.add("active");
    });
  });

  // Loading animation functions
  function showLoading() {
    loading.classList.remove("hidden");
    let width = 0;
    const interval = setInterval(() => {
      if (width >= 100) {
        clearInterval(interval);
      } else {
        width += 10;
        progress.style.width = width + "%";
      }
    }, 500);
  }

  function hideLoading() {
    loading.classList.add("hidden");
    progress.style.width = "0%";
  }

  // Summarize functionality
  summarizeBtn.addEventListener("click", () => {
    showLoading();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "summarize" },
        function (response) {
          if (response && response.content) {
            chrome.runtime.sendMessage(
              { action: "summarize", content: response.content },
              function (aiResponse) {
                hideLoading();
                if (aiResponse && aiResponse.summary) {
                  summaryOutput.innerHTML = formatOutput(aiResponse.summary);
                  actions.classList.remove("hidden");
                } else {
                  summaryOutput.textContent =
                    "Failed to generate summary. Please try again.";
                }
              }
            );
          } else {
            hideLoading();
            summaryOutput.textContent =
              "Failed to extract page content. Please try again.";
          }
        }
      );
    });
  });

  // Ask question functionality
  askBtn.addEventListener("click", () => {
    const question = questionInput.value.trim();
    if (!question) return;

    showLoading();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "ask" },
        function (response) {
          if (response && response.content) {
            chrome.runtime.sendMessage(
              { action: "ask", content: response.content, question: question },
              function (aiResponse) {
                hideLoading();
                if (aiResponse && aiResponse.answer) {
                  answerOutput.innerHTML = formatOutput(aiResponse.answer);
                  actions.classList.remove("hidden");
                } else {
                  answerOutput.textContent =
                    "Failed to get an answer. Please try again.";
                }
              }
            );
          } else {
            hideLoading();
            answerOutput.textContent =
              "Failed to extract page content. Please try again.";
          }
        }
      );
    });
  });

  // Utility functions
  function formatOutput(text) {
    return text
      .replace(/^# (.*$)/gim, "<h2>$1</h2>")
      .replace(/^## (.*$)/gim, "<h3>$1</h3>")
      .replace(/^\* (.*$)/gim, "<ul><li>$1</li></ul>")
      .replace(/^(\d+\. )(.*$)/gim, "<ol><li>$2</li></ol>")
      .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/\n/gim, "<br>");
  }

  function copyToClipboard() {
    const activeContent = document.querySelector(
      ".tab-content.active .output-text"
    );
    const text = activeContent.innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  }

  function readAloud() {
    const activeContent = document.querySelector(
      ".tab-content.active .output-text"
    );
    const text = activeContent.innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

  function expandView() {
    const activeContent = document.querySelector(
      ".tab-content.active .output-text"
    );
    const text = activeContent.innerText;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
          <html>
              <head>
                  <title>Expanded View</title>
                  <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                      h2 { color: #333; }
                      pre { background-color: #f4f4f4; padding: 15px; border-radius: 5px; }
                  </style>
              </head>
              <body>
                  <h2>Expanded View</h2>
                  <pre>${text}</pre>
              </body>
          </html>
      `);
    newWindow.document.close();
  }

  // Event listeners for action buttons
  copyBtn.addEventListener("click", copyToClipboard);
  readBtn.addEventListener("click", readAloud);
  expandBtn.addEventListener("click", expandView);
});
