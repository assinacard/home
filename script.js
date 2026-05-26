const cookieBox = document.getElementById("cookieBox");
const acceptCookies = document.getElementById("acceptCookies");

if (localStorage.getItem("assinacardCookiesOk") === "yes") {
  cookieBox?.remove();
}

acceptCookies?.addEventListener("click", () => {
  localStorage.setItem("assinacardCookiesOk", "yes");
  cookieBox?.remove();
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ========================================================
// Formulário antes do checkout Mercado Pago
// ========================================================
// Endpoint seguro de backend que grava o lead no Notion antes de liberar o checkout.
// Em produção, esse endpoint precisa rodar em uma hospedagem com suporte a funções serverless, como Vercel.
const LEADS_WEBHOOK_URL = "/api/notion-lead";

const checkoutModal = document.getElementById("checkoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutLeadId = document.getElementById("checkoutLeadId");
const checkoutPlan = document.getElementById("checkoutPlan");
const checkoutUrl = document.getElementById("checkoutUrl");
const assinacardId = document.getElementById("assinacardId");
const checkoutError = document.getElementById("checkoutError");
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const whatsapp = document.getElementById("whatsapp");

function generateAssinaCardId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ASC-${date}-${random}`;
}

function openCheckoutModal(planName, paymentUrl) {
  const leadId = generateAssinaCardId();

  checkoutLeadId.textContent = leadId;
  checkoutPlan.value = planName;
  checkoutUrl.value = paymentUrl;
  assinacardId.value = leadId;
  checkoutError.textContent = "";

  checkoutModal.classList.add("is-open");
  checkoutModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  setTimeout(() => fullName?.focus(), 80);
}

function closeCheckoutModal() {
  checkoutModal.classList.remove("is-open");
  checkoutModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function formatWhatsapp(value) {
  const numbers = onlyNumbers(value).slice(0, 11);

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

function validateCheckoutForm() {
  const nameValue = fullName.value.trim().replace(/\s+/g, " ");
  const emailValue = email.value.trim();
  const whatsappNumbers = onlyNumbers(whatsapp.value);

  if (nameValue.length < 6 || !nameValue.includes(" ")) {
    return "Informe seu nome completo.";
  }

  if (!isValidEmail(emailValue)) {
    return "Informe um e-mail válido.";
  }

  if (whatsappNumbers.length < 10 || whatsappNumbers.length > 11) {
    return "Informe um WhatsApp válido com DDD.";
  }

  return "";
}

async function sendLead(leadData) {
  const savedLeads = JSON.parse(localStorage.getItem("assinacardCheckoutLeads") || "[]");
  savedLeads.push(leadData);
  localStorage.setItem("assinacardCheckoutLeads", JSON.stringify(savedLeads));

  if (!LEADS_WEBHOOK_URL) return;

  await fetch(LEADS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadData),
    keepalive: true,
  });
}

document.querySelectorAll(".checkout-trigger").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const planName = button.dataset.plan || "Plano AssinaCard";
    const paymentUrl = button.dataset.checkoutUrl || button.href;
    openCheckoutModal(planName, paymentUrl);
  });
});

document.querySelectorAll("[data-close-checkout]").forEach((button) => {
  button.addEventListener("click", closeCheckoutModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && checkoutModal?.classList.contains("is-open")) {
    closeCheckoutModal();
  }
});

whatsapp?.addEventListener("input", () => {
  whatsapp.value = formatWhatsapp(whatsapp.value);
});

checkoutForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const errorMessage = validateCheckoutForm();
  if (errorMessage) {
    checkoutError.textContent = errorMessage;
    return;
  }

  const submitButton = checkoutForm.querySelector('button[type="submit"]');
  const paymentUrl = checkoutUrl.value;

  const leadData = {
    assinacard_id: assinacardId.value,
    plano: checkoutPlan.value,
    nome_completo: fullName.value.trim().replace(/\s+/g, " "),
    email: email.value.trim(),
    whatsapp: onlyNumbers(whatsapp.value),
    checkout_url: paymentUrl,
    origem: "Landing Page AssinaCard",
    criado_em: new Date().toISOString(),
    page_url: window.location.href,
    user_agent: navigator.userAgent,
  };

  submitButton.disabled = true;
  submitButton.textContent = "Redirecionando...";
  checkoutError.textContent = "";

  try {
    await sendLead(leadData);
  } catch (error) {
    console.error("Erro ao enviar lead AssinaCard:", error);
    // Mesmo que o webhook falhe, o cliente continua para o pagamento para não travar a venda.
  } finally {
    window.location.href = paymentUrl;
  }
});
