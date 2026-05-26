# AssinaCard — Página com formulário antes do checkout + Notion

Esta versão faz o cliente preencher um formulário antes de ir para o checkout do Mercado Pago.

Fluxo atual:

1. Cliente escolhe o plano.
2. Abre o formulário com ID AssinaCard automático.
3. Cliente informa nome completo, e-mail e WhatsApp.
4. A página envia o lead para o endpoint seguro `/api/notion-lead`.
5. O endpoint grava o lead no banco do Notion.
6. O cliente é redirecionado para o checkout original do Mercado Pago.

> Importante: o token secreto do Notion nunca deve ficar no `script.js`, `index.html` ou qualquer arquivo público. Ele deve ficar apenas nas variáveis de ambiente da hospedagem.

---

## Arquivos principais

- `index.html` — página da AssinaCard e modal do formulário.
- `style.css` — estilos da página e do modal.
- `script.js` — validação do formulário e envio para `/api/notion-lead`.
- `api/notion-lead.js` — função segura que grava o lead no Notion.
- `.env.example` — modelo das variáveis de ambiente.
- `package.json` — base para deploy em Vercel.
- `vercel.json` — configuração de rotas para Vercel.

---

## Como criar o banco no Notion

Crie uma database no Notion com as colunas abaixo, exatamente com estes nomes:

| Coluna | Tipo no Notion |
|---|---|
| Nome | Title |
| ID AssinaCard | Text |
| Plano | Select |
| E-mail | Email |
| WhatsApp | Phone |
| Checkout | URL |
| Origem | Text |
| Criado em | Date |
| Status | Select |

Sugestão para `Status`:

- Novo lead
- Pagamento pendente
- Pago
- Em atendimento
- Ativado
- Perdido

Sugestão para `Plano`:

- Plano Mensal
- Plano Trimestral
- Plano Anual

---

## Como conectar a integração do Notion

1. Acesse as integrações do Notion e crie uma integração interna.
2. Copie o token secreto da integração.
3. Abra a página onde está a database.
4. Clique em `...` no canto superior direito.
5. Vá em `Connections` ou `Add connections`.
6. Adicione a integração criada.
7. Copie o `data_source_id` da database.

No Notion atual, o ideal é usar o `data_source_id`, não apenas o antigo `database_id`.

---

## Variáveis de ambiente necessárias

Na hospedagem, configure:

```env
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATA_SOURCE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ALLOWED_ORIGIN=*
```

Para produção, prefira trocar `ALLOWED_ORIGIN=*` pelo domínio real da página, exemplo:

```env
ALLOWED_ORIGIN=https://www.seudominio.com.br
```

---

## Deploy recomendado: Vercel

Esta versão já está pronta para rodar na Vercel.

Passo a passo básico:

1. Suba a pasta `home` para um repositório no GitHub.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente:
   - `NOTION_TOKEN`
   - `NOTION_DATA_SOURCE_ID`
   - `ALLOWED_ORIGIN`
4. Faça o deploy.
5. Teste escolhendo um plano e preenchendo o formulário.

Se estiver usando hospedagem comum de HTML/CSS/JS, como cPanel simples, a função `/api/notion-lead` pode não funcionar. Nesse caso, use Vercel, Netlify Functions, Cloudflare Workers, Render ou um backend Node separado.

---

## Onde alterar os links do Mercado Pago

No `index.html`, procure pelos botões com a classe:

```html
checkout-trigger
```

Exemplo:

```html
<a class="btn btn--full checkout-trigger"
   href="https://mpago.la/2zdGAiG"
   data-checkout-url="https://mpago.la/2zdGAiG"
   data-plan="Plano Mensal">
  Quero o mensal
</a>
```

Troque o `href` e o `data-checkout-url` pelo link correto do Mercado Pago.

---

## Onde alterar o endpoint do lead

No `script.js`:

```js
const LEADS_WEBHOOK_URL = "/api/notion-lead";
```

Mantenha assim se a página e o endpoint estiverem no mesmo domínio.

Se o backend estiver em outro domínio, use a URL completa do endpoint.

---

## Observação comercial

O checkout continua liberado mesmo se o Notion falhar momentaneamente, para não travar a venda.

O erro aparece no console do navegador/servidor, mas o cliente segue para o Mercado Pago. Isso evita perder cliente quente por falha de integração.

