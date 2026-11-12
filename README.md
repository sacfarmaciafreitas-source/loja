# Loja Template

Template de loja (vitrine + admin + checkout Pix + feed Google Merchant) em Next.js + Supabase, feito para rodar na Vercel.
Cada loja nova = mesmo código + um `src/store.config.ts` diferente + um projeto Supabase próprio.

## O que tem

- Vitrine: home, categorias, produto (com dados estruturados para o Merchant), busca, carrinho lateral
- Checkout Pix com CEP automático, validação de CPF e preço sempre recalculado no servidor
- Página do pedido com QR Code, copia e cola e atualização automática quando o pagamento cai
- Admin (`/admin`): visão geral, pedidos (status e rastreio), produtos (cadastro, foto, estoque)
- Páginas institucionais geradas da config: quem somos, entrega, trocas, pagamento, privacidade, termos, contato
- `/feed.xml` (Google Merchant), `/sitemap.xml`, `/robots.txt`
- Adaptador de gateway: `mock` (teste), `vaultic`, `primecash`

## Painel (/admin)

Tudo é configurável sem mexer em código: aparência (logo, cores, fonte), banners, atalhos, benefícios, vitrines da home, menu, barra superior, empresa, frete, pagamentos (gateway e chaves), Google Merchant, rastreamento (GA4, Google Ads, Meta Pixel), SEO, páginas institucionais, categorias, produtos (com importação CSV) e newsletter.

O arquivo `src/store.config.ts` guarda só os valores padrão de uma loja nova.

## Modo demo

Sem as variáveis do Supabase a loja sobe com produtos de exemplo e pedidos em memória. Para testar o painel localmente sem Supabase, rode com `DEMO_ADMIN=1`.

## Configurar

1. Rodar `supabase/schema.sql` (pode rodar de novo a cada atualização, ele não apaga nada) no SQL Editor do Supabase (e `supabase/seed.sql` se quiser os produtos de exemplo)
2. Criar o usuário admin em Authentication e rodar o comando de admin que está no fim do `schema.sql`
3. Cadastrar as variáveis do `.env.example` na Vercel
4. Editar `src/store.config.ts` com os dados reais da empresa

## Rodar local

```
npm install
npm run dev
```
