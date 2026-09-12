# Setup Supabase

## 1. Criar projeto

1. [supabase.com](https://supabase.com) → New project (região `sa-east-1` p/ Brasil).
2. Copie em **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**server-only, nunca no browser**)

## 2. Rodar migrations

Via CLI (recomendado):

```bash
npx supabase login
npx supabase link --project-ref SEU_REF
npx supabase db push        # aplica supabase/migrations/*
```

Ou cole o conteúdo de `supabase/migrations/0001_initial_schema.sql` e depois
`0002_seed_products.sql` no **SQL Editor** do dashboard.

## 3. Auth — Magic Link

1. **Authentication → Providers → Email**: habilite (sem senha é o padrão OTP/link).
2. **Authentication → URL Configuration**:
   - Site URL: `https://lipeexplica.com`
   - Redirect URLs: `https://lipeexplica.com/auth/callback`, `http://localhost:3000/auth/callback`
3. **Email Templates → Magic Link**: personalize (português, marca LipeExplica).

## 4. Auth — Google

1. Google Cloud Console → OAuth Client ID (Web).
   - Authorized redirect URI: `https://SEU_REF.supabase.co/auth/v1/callback`
2. Supabase **Authentication → Providers → Google**: cole Client ID/Secret.

## 5. Auth — Apple (estrutura pronta)

O botão já existe (desabilitado) em `src/components/auth/login-form.tsx`.
Quando tiver Apple Developer Account:

1. Configure o provider Apple no Supabase (Services ID, Key ID, private key).
2. Remova o `disabled` do botão.

## 6. Tornar-se admin

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'seu@email.com');
```

## 7. Conferir RLS

**Database → Policies**: todas as 5 tabelas devem aparecer com RLS ON.
Teste: com a anon key, `select * from purchases` deve retornar vazio.
