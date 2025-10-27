// FAQ toggle
function toggleFaq(button) {
  const faqItem = button.closest(".faq-item");
  const isActive = faqItem.classList.contains("active");
  document.querySelectorAll(".faq-item").forEach((item) => {
    if (item !== faqItem) item.classList.remove("active");
  });
  if (isActive) faqItem.classList.remove("active"); else faqItem.classList.add("active");
}

// Contact form handling (Web3Forms)
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;
  const submitButton = contactForm.querySelector(".submit-button");

  async function handleFormSubmission(e) {
    if (e) e.preventDefault();

    const formData = new FormData(contactForm);
    const formObject = {};
    formData.forEach((v, k) => (formObject[k] = v));

    if (!validateForm(formObject)) return;

    const originalText = submitButton.textContent;
    submitButton.textContent = "Sending...";
    submitButton.disabled = true;

    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const result = await response.json();
      if (result.success) {
        showSuccessMessage();
        contactForm.reset();
      } else {
        throw new Error(result.message || "Form submission failed");
      }
    } catch (err) {
      console.error("Form error:", err);
      showErrorMessage("Sorry, there was an error sending your message. Please try again or contact us directly at cleevao@gmail.com.");
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  contactForm.addEventListener("submit", handleFormSubmission);
  if (submitButton) submitButton.addEventListener("click", function (e) { e.preventDefault(); handleFormSubmission(); });
});

// Validation
function validateForm(formData) {
  const requiredFields = ["name", "email", "topic", "message"];
  let isValid = true;

  document.querySelectorAll(".form-group").forEach((g) => g.classList.remove("error"));

  requiredFields.forEach((f) => {
    if (!formData[f] || formData[f].trim() === "") {
      isValid = false;
      const el = document.getElementById(f);
      if (el) el.closest(".form-group").classList.add("error");
    }
  });

  if (formData.email && !isValidEmail(formData.email)) {
    isValid = false;
    const emailEl = document.getElementById("email");
    if (emailEl) emailEl.closest(".form-group").classList.add("error");
  }

  if (!isValid) showErrorMessage("Please fill in all required fields correctly.");
  return isValid;
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

// Success message
function showSuccessMessage() {
  const existing = document.querySelector(".success-message");
  if (existing) existing.remove();

  const msg = document.createElement("div");
  msg.className = "success-message show";
  msg.innerHTML = `<p>✅ Thank you! We'll get back to you within 24 hours.</p>`;
  const form = document.getElementById("contactForm");
  form.parentNode.insertBefore(msg, form);
  msg.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => { if (msg.parentNode) msg.remove(); }, 5000);
}

// Error message
function showErrorMessage(message) {
  const existing = document.querySelector(".error-message");
  if (existing) existing.remove();

  const msg = document.createElement("div");
  msg.className = "error-message show";
  msg.style.cssText = `background:#FED7D7;color:#C53030;padding:16px;border-radius:8px;margin-bottom:20px;text-align:center;font-weight:600;animation:slideIn .3s ease;`;
  msg.innerHTML = `<p>❌ ${message}</p>`;
  const form = document.getElementById("contactForm");
  form.parentNode.insertBefore(msg, form);
  setTimeout(() => { if (msg.parentNode) msg.remove(); }, 5000);
}

// Smooth scrolling
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      const headerHeight = document.querySelector(".header").offsetHeight;
      const top = targetEl.offsetTop - headerHeight - 20;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
});