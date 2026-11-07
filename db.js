import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
// Só dados PÚBLICOS (URL + chave anon). Aceita o config.js novo e o antigo.
let u,k;try{const C=await import('./config.js');u=C.SUPABASE_URL||(C.sb&&C.sb.supabaseUrl);k=C.SUPABASE_KEY||(C.sb&&C.sb.supabaseKey)}catch(e){}
// cada painel tem sessão própria (site público não guarda sessão)
export const mk=(name,persist)=>u&&k&&/^https:\/\//.test(u)?createClient(u,k,{auth:{storageKey:'cm-'+name,persistSession:persist,autoRefreshToken:persist,detectSessionInUrl:false}}):null;
export const h=(t,p={},...c)=>{const e=document.createElement(t);Object.assign(e,p);e.append(...c);return e};
// anti-pausa do Supabase: grava 1 linha (no máx. 1x/minuto no banco)
export const ping=(c,force)=>{if(!c)return;try{const t=+localStorage.getItem('cm-ping')||0;if(!force&&Date.now()-t<6e4)return;localStorage.setItem('cm-ping',Date.now())}catch(e){}c.rpc('ping').then(()=>{},()=>{})};
export const DEF=[{title:'Lifting temporal',descr:'Uma abordagem delicada para o terço superior do rosto, avaliada caso a caso.'},{title:'Botox',descr:'Suaviza linhas de expressão preservando a sua naturalidade.'},{title:'Preenchimento',descr:'Equilíbrio de contornos e volumes, respeitando as proporções do seu rosto.'},{title:'Rinomodelação',descr:'Planejamento cuidadoso do perfil, sempre com avaliação prévia.'},{title:'Fios de PDO',descr:'Indicados após avaliação individual, para quem busca sustentação da pele.'},{title:'Protocoll',descr:'Cuidado com a qualidade da pele, em um protocolo pensado para você.'}];
