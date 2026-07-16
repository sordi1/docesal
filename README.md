# Docesal — Pelizzari

Site de vendas para confeitaria/salgateria, com cardápio dinâmico, cálculo de frete por distância e pagamento via Pix integrado. Hospedado no Vercel, com backend em funções serverless (Node.js) e persistência em Redis.

## Funcionalidades

- **Cardápio dinâmico** — produtos armazenados no Redis, com fallback para uma lista padrão caso o banco esteja vazio ou indisponível
- **Cálculo de frete automático** — usa a API do Google Maps (Distance Matrix) pra calcular distância real até o endereço do cliente, a partir do endereço fixo da loja
- **Pagamento via Pix** — integração com a API do Mercado Pago, gera QR Code e permite consultar o status do pagamento
- **Painel de gerenciamento** — permite atualizar produtos e disponibilidade, protegido por senha

## Arquitetura

```
public/          → frontend estático (HTML, CSS e JS inline)
api/
  produtos.js        → GET (lista produtos) / POST (atualiza, autenticado)
  disponibilidade.js → GET (consulta) / POST (atualiza, autenticado)
  frete.js            → calcula frete via Google Maps Distance Matrix
  pix.js               → cria cobrança Pix via Mercado Pago
  status.js            → consulta status de um pagamento
vercel.json      → roteamento (raiz → /public, /api/* → funções serverless)
```

## Variáveis de ambiente necessárias

Configuradas direto no painel do Vercel (Project Settings → Environment Variables) — nunca no código:

| Variável | Uso |
|---|---|
| `ADMIN_PASSWORD` | Protege os endpoints de atualização de produtos e disponibilidade |
| `GOOGLE_MAPS_KEY` | Cálculo de frete (Distance Matrix API) |
| `MP_ACCESS_TOKEN` | Criação e consulta de pagamentos Pix (Mercado Pago) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_URL` / `_TOKEN`) | Conexão com o Redis (`Redis.fromEnv()`) |

## Rodando localmente

```bash
npm install
vercel dev
```

## Stack

Node.js (funções serverless) · Vercel · Upstash Redis · API do Google Maps · API do Mercado Pago
