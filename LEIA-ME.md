# Passo a passo (cada cliente = 1 projeto Supabase próprio)
1. supabase.com > New project (anote a senha do banco).
2. SQL Editor > cole o conteúdo de supabase.sql > Run.
3. Authentication > Users > Add user (e-mail e senha da Dra.). Depois, em Sign In / Providers, DESLIGUE "Allow new users to sign up" (senão qualquer pessoa pode criar conta e editar a página).
4. Project Settings > API: copie a Project URL e a anon key e cole em config.js.
5. Suba esta pasta no GitHub e importe no Vercel (framework: Other, sem build).
6. Abra SEU-SITE/admin.html, entre e edite. Nada precisa subir de novo.
