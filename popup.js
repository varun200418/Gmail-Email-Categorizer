function sendMessageToGmail(command, value = null) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs.length) return;
    chrome.tabs.sendMessage(tabs[0].id, { command, value }, response => {
      if (chrome.runtime.lastError) {
        alert("⚠️ Please open Gmail and try again.");
      } else {
        console.log("✔️ Command sent:", response);
      }
    });
  });
}

document.querySelectorAll("button[data-category]").forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    sendMessageToGmail("scan-category", category);
  });
});

document.getElementById("toggleScan").addEventListener("change", (e) => {
  sendMessageToGmail("toggle", e.target.checked);
});

document.getElementById("exportSpam").addEventListener("click", () => {
  sendMessageToGmail("export-spam");
});
// This script is for the popup of a Chrome extension that interacts with Gmail to scan emails by category,
// toggle scanning functionality, and export spam emails as a CSV file. It sends messages to the