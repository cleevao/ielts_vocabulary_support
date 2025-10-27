// FAQ Loader - Loads and renders FAQ content from FAQ.md
class FAQLoader {
  constructor() { this.faqContainer = null; }

  async init() {
    this.faqContainer = document.querySelector(".faq-list");
    if (!this.faqContainer) { console.error("FAQ container not found"); return; }
    try { await this.loadAndRenderFAQ(); } catch (err) { console.error("Failed to load FAQ:", err); this.showFallback(); }
  }

  async loadAndRenderFAQ() {
    if (window.location.protocol === 'file:') {
      console.warn('Running from file:// protocol. Please use a local web server for full functionality.');
      throw new Error('CORS policy prevents loading FAQ.md from file:// protocol.');
    }
    const response = await fetch("FAQ.md");
    if (!response.ok) throw new Error(`Failed to fetch FAQ.md: ${response.status}`);
    const markdown = await response.text();
    const items = this.parseMarkdownToFAQ(markdown);
    this.renderFAQItems(items);
  }

  parseMarkdownToFAQ(markdown) {
    const faqItems = []; const lines = markdown.split("\n");
    let currentQuestion = null; let currentAnswer = []; let inAnswer = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('# ') || line.startsWith('## ') || line.startsWith('---') || line.startsWith('_Last Updated')) continue;
      if (line.startsWith('### ')) {
        if (currentQuestion && currentAnswer.length > 0) faqItems.push({ question: currentQuestion, answer: currentAnswer.join("\n").trim() });
        currentQuestion = line.replace('### ', '').trim(); currentAnswer = []; inAnswer = true; continue;
      }
      if (inAnswer && currentQuestion) {
        if ((line.includes('[') && line.includes('](#')) || line.startsWith('1.') || line.startsWith('2.') || line.includes('Table of Contents')) continue;
        currentAnswer.push(line);
      }
    }
    if (currentQuestion && currentAnswer.length > 0) faqItems.push({ question: currentQuestion, answer: currentAnswer.join("\n").trim() });
    return faqItems;
  }

  renderFAQItems(faqItems) {
    this.faqContainer.innerHTML = "";
    faqItems.forEach((item) => { const el = this.createFAQItem(item.question, item.answer); this.faqContainer.appendChild(el); });
    console.log(`Loaded ${faqItems.length} FAQ items from FAQ.md`);
  }

  createFAQItem(question, answer) {
    const faqItem = document.createElement("div"); faqItem.className = "faq-item";
    const btn = document.createElement("button"); btn.className = "faq-question"; btn.onclick = () => toggleFaq(btn);
    btn.innerHTML = `<span>${question}</span><svg class="faq-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 8L10 13L5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const ans = document.createElement("div"); ans.className = "faq-answer";
    const formatted = this.formatAnswerText(answer);
    ans.innerHTML = `<p>${formatted}</p>`;
    faqItem.appendChild(btn); faqItem.appendChild(ans);
    return faqItem;
  }

  formatAnswerText(text) {
    return text
      // Convert [label](url) to <a href="url">label</a>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => `<a href="${url.trim()}">${label.trim()}</a>`)
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Convert bullet points
      .replace(/^- (.*$)/gm, "• $1")
      // Convert numbered lists
      .replace(/^\d+\. (.*$)/gm, "$1")
      // Convert line breaks to <br> but preserve paragraphs
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      // Clean up any empty paragraphs
      .replace(/<p><\/p>/g, "")
      // Handle inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  showFallback() {
    const isFile = window.location.protocol === 'file:';
    const msg = isFile
      ? 'To see full FAQ content, start a local web server. Run <code>python3 -m http.server 8000</code> and visit <strong>http://localhost:8000</strong>'
      : 'We\'re having trouble loading the FAQ content. Please refresh the page or contact us.';
    this.faqContainer.innerHTML = `
      <div class="faq-item">
        <button class="faq-question" onclick="toggleFaq(this)">
          <span>How do I contact support?</span>
          <svg class="faq-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 8L10 13L5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="faq-answer"><p>If you need assistance, email <strong>cleevao@gmail.com</strong>. We aim to respond within 24 hours.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-question" onclick="toggleFaq(this)">
          <span>What is IELTS Vocab?</span>
          <svg class="faq-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 8L10 13L5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="faq-answer"><p>IELTS Vocab helps learners build and retain IELTS-specific vocabulary through curated word lists and practice.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-question" onclick="toggleFaq(this)">
          <span>${isFile ? 'How to see full FAQ content?' : 'Unable to load FAQ content'}</span>
          <svg class="faq-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 8L10 13L5 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="faq-answer"><p>${msg}</p></div>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", function () { const faqLoader = new FAQLoader(); faqLoader.init(); });