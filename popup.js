document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const summarizeButton = document.getElementById("summarize-button");
  const askButton = document.getElementById("ask-button");
  const summaryContent = document.getElementById("summary-content");
  const questionInput = document.getElementById("question-input");
  const answerContent = document.getElementById("answer-content");
  const errorMessage = document.getElementById("error-message");
  const feedbackForm = document.getElementById("feedback-form");
  const feedbackInput = document.getElementById("feedback-input");
  const feedbackSubmit = document.getElementById("feedback-submit");

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add("active");
    });
  });

  // Summarize functionality
  summarizeButton.addEventListener("click", () => {
    summarizeButton.disabled = true;
    summaryContent.textContent = "Generating summary...";
    errorMessage.textContent = "";

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage(
        { action: "summarize", url: tabs[0].url },
        function (response) {
          summarizeButton.disabled = false;
          if (response.error) {
            errorMessage.textContent = response.error;
            summaryContent.textContent = "";
          } else {
            summaryContent.textContent = response.summary;
          }
        }
      );
    });
  });

  // Ask functionality
  askButton.addEventListener("click", () => {
    if (!questionInput.value.trim()) {
      errorMessage.textContent = "Please enter a question.";
      return;
    }

    askButton.disabled = true;
    answerContent.textContent = "Processing your question...";
    errorMessage.textContent = "";

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage(
        {
          action: "ask",
          url: tabs[0].url,
          question: questionInput.value,
        },
        function (response) {
          askButton.disabled = false;
          if (response.error) {
            errorMessage.textContent = response.error;
            answerContent.textContent = "";
          } else {
            answerContent.textContent = response.answer;
          }
        }
      );
    });
  });

  // Feedback functionality
  feedbackForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!feedbackInput.value.trim()) {
      return;
    }
    feedbackSubmit.disabled = true;
    // Here you would typically send the feedback to your server
    console.log("Feedback submitted:", feedbackInput.value);
    feedbackInput.value = "";
    feedbackSubmit.disabled = false;
    alert("Thank you for your feedback!");
  });
});
