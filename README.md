# Vindode

Vindode é uma plataforma de rastreamento de links com integração ao Meta Conversions API (CAPI), desenvolvida para agências de marketing digital. Cada clique em um link rastreado é registrado no banco de dados e enviado ao Meta CAPI em tempo real, garantindo atribuição precisa de campanhas mesmo com bloqueadores de anúncios.

A plataforma permite que agências gerenciem múltiplos clientes, criem links rastreados com parâmetros UTM personalizados, visualizem métricas de desempenho em dashboards interativos e compartilhem um painel read-only com cada cliente via link com token de acesso.

---

## Pré-requisitos

- Node.js 18 ou superior
- Conta no [Supabase](https://supabase.com) (plano gratuito suficiente para MVP)
- Conta na [Vercel](https://vercel.com) para deploy
- Supabase CLI: `npm install -g supabase`

---

## Setup local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/vindode.git
cd vindode
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Crie um projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) e crie um novo projeto
2. Aguarde o banco ser provisionado (~1 minuto)

### 4. Rode as migrations

```bash
# Faça login na CLI do Supabase
supabase login

# Vincule ao projeto criado (use o Project ID da URL do dashboard)
supabase link --project-ref SEU_PROJECT_REF

# Aplique as migrations
supabase db push
```

### 5. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Abra `.env.local` e preencha cada variável:

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` em desenvolvimento |

> **Atenção:** nunca exponha a `SUPABASE_SERVICE_ROLE_KEY` no frontend. Ela só é usada em rotas de servidor.

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`.

---

## Criando o primeiro cliente e link

1. Acesse `/register` e crie uma conta de agência com e-mail e senha
2. No dashboard, clique em **Adicionar cliente** na barra lateral
3. Preencha o nome, número de WhatsApp (somente dígitos, com DDI) e, opcionalmente, os dados do Meta Pixel
4. Com o cliente criado, acesse **Dashboard → [Cliente] → Links → Novo link**
5. Informe o número de WhatsApp de destino, UTM source e campanha
6. Copie o link gerado (formato: `https://seu-dominio/r/[slug]`)

---

## Configurando o Meta Pixel

O envio de eventos para o Meta CAPI requer dois dados do cliente:

- **Pixel ID** (`meta_pixel_id`): encontrado no Meta Business Suite → Gerenciador de Eventos → seu Pixel → Configurações
- **Access Token** (`meta_access_token`): gerado em Meta Business Suite → Gerenciador de Eventos → seu Pixel → Configurações → Conversions API → Gerar token de acesso

Esses dados são preenchidos ao criar ou editar o cliente. O `meta_access_token` é armazenado de forma segura e nunca exposto ao frontend.

---

## Deploy na Vercel

### 1. Importe o repositório

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório do GitHub
3. Framework preset: **Next.js** (detectado automaticamente)

### 2. Configure as variáveis de ambiente

Na tela de configuração do projeto na Vercel, adicione as mesmas variáveis do `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` → URL gerada pela Vercel (ex: `https://vindode.vercel.app`)

### 3. Deploy

Clique em **Deploy**. A Vercel fará o build e publicará a aplicação. Commits futuros na branch `main` serão deployados automaticamente.

> **Importante:** após o deploy, atualize `NEXT_PUBLIC_APP_URL` na Vercel com a URL definitiva do projeto e faça um novo deploy para que os links gerados apontem para o domínio correto.

---

## Estrutura de pastas

```
app/
  (auth)/
    login/page.tsx          # Formulário de login da agência
    register/page.tsx       # Cadastro de nova agência (MVP)
    layout.tsx              # Layout centralizado para auth
  r/[slug]/route.ts         # Edge Function: redirect + registro de clique
  dashboard/
    layout.tsx              # Sidebar com lista de clientes
    page.tsx                # Tela inicial do dashboard
    [clientId]/
      page.tsx              # Dashboard de métricas do cliente
      links/
        new/page.tsx        # Criar novo link rastreado
  client/
    [clientId]/page.tsx     # Dashboard read-only para o cliente final
  api/
    clients/
      route.ts              # GET lista / POST cria cliente
      [id]/
        route.ts            # GET / PATCH / DELETE cliente
        links/route.ts      # GET lista / POST cria link
        links/[linkId]/route.ts
        metrics/route.ts    # GET métricas agregadas
  layout.tsx                # Root layout (fonte, metadata)
  globals.css
components/
  dashboard/
    Sidebar.tsx             # Sidebar interativa com logout
    KPICards.tsx
    ClicksByDayChart.tsx
    ClicksBySourceChart.tsx
    TopLinksTable.tsx
    CampaignTable.tsx
  links/
    CreateLinkForm.tsx
    GeneratedLinkCard.tsx
  ui/
    SkeletonDashboard.tsx
  Toast.tsx
hooks/
  useCreateLink.ts
  useMetrics.ts
lib/
  supabase/
    client.ts               # createBrowserClient (client-side)
    server.ts               # createServiceRoleClient (server/edge)
    session.ts              # createServerClient com cookies (Server Components)
  auth.ts                   # getAgencyId, verifyClientToken
  capi.ts                   # Envio de eventos ao Meta CAPI
  validations.ts            # Validações e utilitários
types/
  database.ts               # Tipos gerados do schema Supabase
supabase/
  migrations/
    001_initial_schema.sql
  seed.sql
middleware.ts               # Proteção de rotas /dashboard e /api/clients
.env.local.example
```
