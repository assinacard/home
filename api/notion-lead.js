const NOTION_API_BASE_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function sanitizeText(value, maxLength = 2000) {
  return String(value || "").trim().slice(0, maxLength);
}

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function validateLead(lead) {
  const name = sanitizeText(lead.nome_completo, 180).replace(/\s+/g, " ");
  const email = sanitizeText(lead.email, 180).toLowerCase();
  const whatsapp = onlyNumbers(lead.whatsapp).slice(0, 13);
  const assinacardId = sanitizeText(lead.assinacard_id, 80);
  const plano = sanitizeText(lead.plano, 120) || "Plano AssinaCard";
  const checkoutUrl = sanitizeText(lead.checkout_url, 800);
  const origem = sanitizeText(lead.origem, 180) || "Landing Page AssinaCard";
  const criadoEm = lead.criado_em && !Number.isNaN(Date.parse(lead.criado_em))
    ? new Date(lead.criado_em).toISOString()
    : new Date().toISOString();

  if (name.length < 6 || !name.includes(" ")) {
    return { error: "Informe nome completo válido." };
  }

  if (!isValidEmail(email)) {
    return { error: "Informe e-mail válido." };
  }

  if (whatsapp.length < 10 || whatsapp.length > 13) {
    return { error: "Informe WhatsApp válido com DDD." };
  }

  if (!checkoutUrl.startsWith("https://")) {
    return { error: "Checkout inválido." };
  }

  return {
    lead: {
      assinacardId,
      plano,
      name,
      email,
      whatsapp,
      checkoutUrl,
      origem,
      criadoEm,
      userAgent: sanitizeText(lead.user_agent, 600),
      pageUrl: sanitizeText(lead.page_url, 800),
    },
  };
}

function richText(content) {
  return {
    rich_text: [
      {
        text: {
          content: sanitizeText(content),
        },
      },
    ],
  };
}

function title(content) {
  return {
    title: [
      {
        text: {
          content: sanitizeText(content, 180),
        },
      },
    ],
  };
}

function buildNotionProperties(lead) {
  const props = {};

  // ATENÇÃO: os nomes abaixo precisam existir exatamente iguais no banco do Notion.
  props[process.env.NOTION_PROP_NOME || "Nome"] = title(lead.name);
  props[process.env.NOTION_PROP_ID || "ID AssinaCard"] = richText(lead.assinacardId);
  props[process.env.NOTION_PROP_PLANO || "Plano"] = {
    select: {
      name: lead.plano,
    },
  };
  props[process.env.NOTION_PROP_EMAIL || "E-mail"] = {
    email: lead.email,
  };
  props[process.env.NOTION_PROP_WHATSAPP || "WhatsApp"] = {
    phone_number: lead.whatsapp,
  };
  props[process.env.NOTION_PROP_CHECKOUT || "Checkout"] = {
    url: lead.checkoutUrl,
  };
  props[process.env.NOTION_PROP_ORIGEM || "Origem"] = richText(lead.origem);
  props[process.env.NOTION_PROP_CRIADO_EM || "Criado em"] = {
    date: {
      start: lead.criadoEm,
    },
  };
  props[process.env.NOTION_PROP_STATUS || "Status"] = {
    select: {
      name: "Novo lead",
    },
  };

  return props;
}

async function createNotionPage(lead) {
  const notionToken = process.env.NOTION_TOKEN;
  const notionDataSourceId = process.env.NOTION_DATA_SOURCE_ID;

  if (!notionToken) {
    throw new Error("Variável NOTION_TOKEN não configurada.");
  }

  if (!notionDataSourceId) {
    throw new Error("Variável NOTION_DATA_SOURCE_ID não configurada.");
  }

  const response = await fetch(`${NOTION_API_BASE_URL}/pages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${notionToken}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      parent: {
        type: "data_source_id",
        data_source_id: notionDataSourceId,
      },
      properties: buildNotionProperties(lead),
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `Lead capturado pela página da AssinaCard antes do checkout. URL da página: ${lead.pageUrl || "não informada"}. Navegador: ${lead.userAgent || "não informado"}.`,
                },
              },
            ],
          },
        },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const notionMessage = data.message || "Erro desconhecido do Notion.";
    throw new Error(`Notion respondeu ${response.status}: ${notionMessage}`);
  }

  return data;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Método não permitido." });
  }

  try {
    const parsed = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { lead, error } = validateLead(parsed);

    if (error) {
      return sendJson(res, 400, { ok: false, error });
    }

    const notionPage = await createNotionPage(lead);

    return sendJson(res, 200, {
      ok: true,
      lead_id: lead.assinacardId,
      notion_page_id: notionPage.id,
    });
  } catch (error) {
    console.error("Erro ao gravar lead no Notion:", error);
    return sendJson(res, 500, {
      ok: false,
      error: "Não foi possível registrar o lead no Notion.",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
}
