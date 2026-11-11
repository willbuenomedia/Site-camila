import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
// Só dados PÚBLICOS. A URL e a chave vêm das variáveis do Vercel (/api/config), sem ficar escritas no repositório. config.js é só reserva.
let u,k;
try{const r=await fetch('/api/config',{cache:'no-store'});if(r.ok){const j=await r.json();u=j.url;k=j.key}}catch(e){}
if(!(u&&k)){try{const C=await import('./config.js');u=C.SUPABASE_URL||(C.sb&&C.sb.supabaseUrl);k=C.SUPABASE_KEY||(C.sb&&C.sb.supabaseKey)}catch(e){}}
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
