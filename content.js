let enableScan = true;
let spamResults = [];

const categoryKeywords = {
  spam: ['win', 'free', 'money', 'urgent', 'click here'],
  promotions: ['sale', 'discount', 'offer', 'deal', 'subscribe'],
  education: ['university', 'admission', 'exam', 'school', 'tuition', 'learn'],
  jobs: ['job', 'career', 'hiring', 'vacancy', 'resume', 'interview'],
  technology: ['ai', 'tech', 'gadget', 'software', 'app', 'launch', 'update']
};

const categoryStyles = {
  spam: { color: 'red', title: '⚠️ Spam' },
  promotions: { color: 'orange', title: '🛒 Promotions' },
  education: { color: 'blue', title: '📚 Education' },
  jobs: { color: 'purple', title: '💼 Jobs' },
  technology: { color: 'teal', title: '💻 Technology' },
  general: { color: 'gray', title: '📧 General' }
};

function applyStyles(node, category) {
  const style = categoryStyles[category] || categoryStyles.general;
  node.style.color = style.color;
  node.title = style.title;
}

function scanEmailsFor(category) {
  const emailSubjects = document.querySelectorAll('tr.zA span.bog');
  const keywords = categoryKeywords[category] || [];

  emailSubjects.forEach(subjectNode => {
    const subject = subjectNode.innerText.toLowerCase();
    if (keywords.some(keyword => subject.includes(keyword))) {
      applyStyles(subjectNode, category);
      if (category === 'spam') {
        spamResults.push({
          subject: subjectNode.innerText,
          timestamp: new Date().toLocaleString(),
          category: 'spam'
        });
      }
    }
  });
}

function scanAllCategories() {
  const emailSubjects = document.querySelectorAll('tr.zA span.bog');

  emailSubjects.forEach(subjectNode => {
    const subject = subjectNode.innerText.toLowerCase();
    let matched = false;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => subject.includes(keyword))) {
        applyStyles(subjectNode, category);
        if (category === 'spam') {
          spamResults.push({
            subject: subjectNode.innerText,
            timestamp: new Date().toLocaleString(),
            category: 'spam'
          });
        }
        matched = true;
        break;
      }
    }

    if (!matched) {
      applyStyles(subjectNode, 'general');
    }
  });
}

function exportSpamAsCSV() {
  if (spamResults.length === 0) {
    alert("No spam emails to export.");
    return;
  }

  const header = ['Subject', 'Timestamp', 'Category'];
  const rows = spamResults.map(row =>
    [row.subject, row.timestamp, row.category].map(val => `"${val}"`).join(',')
  );

  const csvContent = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'spam_emails.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

scanAllCategories();

const observer = new MutationObserver(() => {
  if (enableScan) scanAllCategories();
});
observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "scan-category") {
    scanEmailsFor(request.value);
    sendResponse({ status: `Scanned for ${request.value}` });
  }
  if (request.command === "toggle") {
    enableScan = request.value;
    sendResponse({ status: `Scanning ${enableScan ? "enabled" : "disabled"}` });
  }
  if (request.command === "export-spam") {
    exportSpamAsCSV();
    sendResponse({ status: "CSV Download Triggered" });
  }
});
// Prevent the default context menu from appearing
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
}, false);
// Prevent the default drag behavior