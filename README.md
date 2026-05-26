# Kit Landing Page AssinaCard

Arquivos incluídos:

- `AssinaCard_Pagina_de_Vendas_2026_Elementor.json`: versão adaptada do JSON original para Elementor.
- `index.html`: versão HTML de referência/prévia visual.
- `style.css`: estilos da landing page HTML.
- `script.js`: cookie simples, rolagem suave e formulário antes do checkout Mercado Pago.
- `/assets`: imagens atuais da AssinaCard usadas como referência visual.

## O que foi adaptado

- Troca completa de GoldCard para AssinaCard.
- CTA principal para WhatsApp oficial: 21 98349-6047.
- Inclusão de PIX e cartão.
- Linguagem mais profissional, humana e segura.
- Remoção de promessas absolutas como “sem mensalidade”, “tudo liberado”, “nunca trava” e similares.
- Remoção de marcas de terceiros, campeonatos, plataformas e termos sensíveis.
- Nova paleta: azul profundo, grafite, roxo digital e ciano elétrico.
- Estrutura preservada: hero, vídeo, dores, benefícios, categorias, planos, garantia/segurança, FAQ e rodapé.
- Inclusão de formulário obrigatório antes dos botões de pagamento do Mercado Pago.

## Formulário antes do checkout

Os botões dos planos agora abrem um cadastro rápido antes de enviar o cliente para o Mercado Pago.

Campos solicitados:

- ID AssinaCard automático;
- Nome completo;
- E-mail;
- WhatsApp com DDD;
- Plano escolhido;
- Link de checkout escolhido.

A mensagem exibida reforça que o cliente deve informar dados válidos, pois a equipe entrará em contato pelo WhatsApp/e-mail informado.

## Importante sobre recebimento dos dados

Do jeito que está, o formulário valida os campos, salva uma cópia no navegador do cliente via `localStorage` e redireciona para o pagamento.

Para a equipe AssinaCard receber esses dados em uma planilha, CRM ou automação, configure a constante abaixo no arquivo `script.js`:

```js
const LEADS_WEBHOOK_URL = "COLE_AQUI_A_URL_DO_SEU_WEBHOOK";
```

Você pode usar Google Apps Script, Make, n8n, Zapier, FormSubmit ou um backend próprio.

## Como usar no Elementor

1. Importe o arquivo JSON no Elementor.
2. Envie as imagens da pasta `/assets` para a biblioteca de mídia do WordPress.
3. Substitua imagens quebradas pelas imagens equivalentes:
   - `Logotipo.png`
   - `Simbolo.png`
   - `Geral.png`
   - `Plano Mensal.png`
   - `Plano Trimestral.png`
   - `Plano Anual.png`
4. Substitua o bloco de vídeo pelo vídeo real da AssinaCard.
5. Revise os textos finais antes de publicar.
6. Se usar domínio próprio, ajuste URLs de imagens caso necessário.
7. Caso use os botões de plano no Elementor, replique a lógica do formulário ou use a versão HTML como referência.

## WhatsApp oficial

https://wa.me/5521983496047

Mensagem padrão:
“Olá, vim da página da AssinaCard e quero conhecer os planos.”
