// Privacy Policy Loader - Loads and renders privacy policy content from privacy_policy.md
class PrivacyPolicyLoader {
  constructor() { this.contentContainer = null; }

  async init() {
    this.contentContainer = document.querySelector(".privacy-content-container");
    if (!this.contentContainer) { console.error("Privacy policy content container not found"); return; }
    try { await this.loadAndRenderPrivacyPolicy(); } catch (err) { console.error("Failed to load privacy policy:", err); this.showFallback(); }
  }

  async loadAndRenderPrivacyPolicy() {
    if (window.location.protocol === "file:") {
      console.warn("Running from file:// protocol. Please use a local web server for full functionality.");
      throw new Error("CORS prevents loading privacy_policy.md via file:// protocol. Use a local web server.");
    }
    const response = await fetch("privacy_policy.md");
    if (!response.ok) throw new Error(`Failed to fetch privacy_policy.md: ${response.status}`);
    const markdown = await response.text();
    const html = this.convertMarkdownToHTML(markdown);
    this.renderContent(html);
  }

  convertMarkdownToHTML(markdown) {
    let html = markdown;
    html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");
    html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
    html = html.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/^- (.*$)/gm, "<li>$1</li>");

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*<\/li>)/gs, function (match) {
      const items = match.split("</li>").filter((x) => x.trim()).map((x) => x + "</li>");
      return "<ul>" + items.join("") + "</ul>";
    });

    const lines = html.split("\n");
    let processed = []; let inList = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.includes("<ul>") || line.includes("<li>")) { inList = true; processed.push(line); continue; }
      if (line.includes("</ul>")) { inList = false; processed.push(line); continue; }
      if (line.match(/^<h[1-6]>/)) { processed.push(line); continue; }
      if (!inList && !line.includes("<ul>") && !line.includes("<li>")) processed.push(`<p>${line}</p>`); else processed.push(line);
    }
    return processed.join("\n");
  }

  renderContent(htmlContent) { this.contentContainer.innerHTML = htmlContent; console.log("Privacy policy loaded successfully"); }

  showFallback() {
    const isFile = window.location.protocol === "file:";
    const msg = isFile ? 'To see the full privacy policy content, start a local web server. Run <code>python3 -m http.server 8000</code> and visit <strong>http://localhost:8000</strong>' : 'We\'re having trouble loading the privacy policy content. Please try refreshing the page.';
    this.contentContainer.innerHTML = `
      <h1>Privacy Policy — IELTS Vocab</h1>
      <p><strong>Effective Date:</strong> [To be updated]</p>
      <h2>Information We Collect</h2>
      <p>[Placeholder content to be updated with actual privacy policy details including what information is collected, how it's used, and how it's protected.]</p>
      <h2>How We Use Your Information</h2>
      <p>[Placeholder content about how collected information is used to provide and improve the service.]</p>
      <h2>Children's Privacy</h2>
      <p>[Placeholder content about how privacy is protected for minors where applicable.]</p>
      <h2>Data Security</h2>
      <p>[Placeholder content about security measures used to protect user data.]</p>
      <h2>Contact Us</h2>
      <p>If you have questions about this Privacy Policy, contact: <a href="mailto:cleevao@gmail.com">cleevao@gmail.com</a></p>
      <div style="background:#FFF5F5;border:1px solid #FEB2B2;border-radius:8px;padding:16px;margin-top:24px;">
        <p style="color:#C53030;font-weight:600;margin:0;">${msg}</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", function () { const loader = new PrivacyPolicyLoader(); loader.init(); });