import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
// Só dados PÚBLICOS. A URL e a chave vêm das variáveis do Vercel (/api/config), sem ficar escritas no repositório. config.js é só reserva.
let u,k;
try{const r=await fetch('/api/config',{cache:'no-store'});if(r.ok){const j=await r.json();u=j.url;k=j.key}}catch(e){}
if(!(u&&k)){try{const C=await import('./config.js?v=9');u=C.SUPABASE_URL||(C.sb&&C.sb.supabaseUrl);k=C.SUPABASE_KEY||(C.sb&&C.sb.supabaseKey)}catch(e){}}
// cada painel tem sessão própria (site público não guarda sessão)
// Chaves novas (sb_publishable_) não são JWT: não as enviamos no cabeçalho Authorization (o login do usuário continua usando o JWT dele).
export const mk=(name,persist)=>{if(!(u&&k&&/^https:\/\//.test(u)))return null;
  const f=(url,o={})=>{const h=new Headers(o.headers);if(h.get('Authorization')==='Bearer '+k)h.delete('Authorization');return fetch(url,{...o,headers:h})};
  return createClient(u,k,{global:{fetch:f},auth:{storageKey:'cm-'+name,persistSession:persist,autoRefreshToken:persist,detectSessionInUrl:false}})};
export const h=(t,p={},...c)=>{const e=document.createElement(t);Object.assign(e,p);e.append(...c);return e};
// anti-pausa do Supabase: grava 1 linha (no máx. 1x/minuto no banco)
export const ping=(c,force)=>{if(!c)return;try{const t=+localStorage.getItem('cm-ping')||0;if(!force&&Date.now()-t<6e4)return;localStorage.setItem('cm-ping',Date.now())}catch(e){}c.rpc('ping').then(()=>{},()=>{})};
export const DEF=[{title:'Lifting temporal',descr:'Uma abordagem delicada para o terço superior do rosto, avaliada caso a caso.'},{title:'Botox',descr:'Suaviza linhas de expressão preservando a sua naturalidade.'},{title:'Preenchimento',descr:'Equilíbrio de contornos e volumes, respeitando as proporções do seu rosto.'},{title:'Rinomodelação',descr:'Planejamento cuidadoso do perfil, sempre com avaliação prévia.'},{title:'Fios de PDO',descr:'Indicados após avaliação individual, para quem busca sustentação da pele.'},{title:'Protocoll',descr:'Cuidado com a qualidade da pele, em um protocolo pensado para você.'}];
// mensagem clara para falhas de login (sem revelar dados sensíveis)
export const why=x=>/confirm/i.test(x.message)?'Este e-mail ainda não foi confirmado no Supabase.':/invalid login/i.test(x.message)?'E-mail ou senha incorretos.':/api key|apikey|jwt/i.test(x.message)?'Chave do Supabase recusada: '+x.message:'Não foi possível entrar: '+x.message;
// Recuperar senha: envia o link por e-mail e, ao voltar, mostra a tela de nova senha.
export const forgot=async(c,email,page)=>{if(!/^\S+@\S+\.\S+$/.test(email||''))return'Digite o seu e-mail no campo acima e toque em "Esqueci a senha" de novo.';const {error}=await c.auth.resetPasswordForEmail(email,{redirectTo:location.origin+page});return error?(/rate|seconds/i.test(error.message)?'Aguarde 1 minuto para pedir outro e-mail.':'Não foi possível enviar: '+error.message):'Pronto! Enviamos um link para '+email+'. Abra o e-mail e toque no link para criar a nova senha (veja também o spam).'};
// retorna true se a página foi aberta pelo link do e-mail (mostra o formulário de nova senha em `box`)
export const recovery=async(c,box,done)=>{const q=new URLSearchParams(location.hash.slice(1));if(q.get('type')!=='recovery'||!q.get('access_token'))return false;
  const {error}=await c.auth.setSession({access_token:q.get('access_token'),refresh_token:q.get('refresh_token')||''});history.replaceState(null,'',location.pathname);
  const m=h('p',{style:'color:#b3261e;min-height:22px;margin:0'}),p1=h('input',{type:'password',placeholder:'Nova senha (mín. 8 caracteres)',autocomplete:'new-password'}),p2=h('input',{type:'password',placeholder:'Repita a nova senha',autocomplete:'new-password'});
  const go=async()=>{if(p1.value.length<8)return m.textContent='Use pelo menos 8 caracteres.';if(p1.value!==p2.value)return m.textContent='As senhas não são iguais.';const {error:e}=await c.auth.updateUser({password:p1.value});if(e)return m.textContent='Não foi possível salvar: '+e.message;await c.auth.signOut();done('Senha alterada! Entre com a nova senha.')};
  p2.onkeydown=x=>{if(x.key=='Enter')go()};
  box.replaceChildren(h('div',{className:'lg'},h('h1',{textContent:'Criar nova senha'}),error?h('p',{textContent:'Este link venceu ou já foi usado. Volte e peça um novo em "Esqueci a senha".',style:'color:#b3261e'}):h('div',{className:'fld',style:'display:grid;gap:10px'},p1,p2,m,h('button',{className:'btn',textContent:'Salvar nova senha',onclick:go}))));return true};
