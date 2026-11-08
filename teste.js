const o=document.getElementById('o');o.textContent='';const say=t=>{o.textContent+=t+'\n'};
let C={};try{C=await import('./config.js?'+Date.now())}catch(e){say('config.js: erro ao ler ('+e.message+')')}
const K=C.SUPABASE_KEY||(C.sb&&C.sb.supabaseKey),U=C.SUPABASE_URL||(C.sb&&C.sb.supabaseUrl);
say('URL: '+(U||'NÃO ENCONTRADA'));
say('Chave: '+(K?K.length+' caracteres | começa com '+K.slice(0,14)+' | termina com '+K.slice(-4):'NÃO ENCONTRADA'));
say('Tipo: '+(!K?'-':K.startsWith('sb_publishable_')?'nova (publishable)':K.startsWith('eyJ')?'antiga (anon)':K.startsWith('sb_secret')?'SECRETA - NAO USE NO SITE':'desconhecido'));
try{const t=await(await fetch('/db.js',{cache:'no-store'})).text();say('db.js no ar: '+(t.includes("'Bearer '+k")?'versão NOVA':'versão ANTIGA (atualize o db.js)'))}catch(e){say('db.js: não encontrado')}
const j=async(n,p)=>{try{const r=await p;say(n+': '+r.status+' '+(await r.text()).replace(/\s+/g,' ').slice(0,110))}catch(e){say(n+': falha de rede ('+e.message+')')}};
if(U&&K){
 await j('1) configuração do login (só a chave)',fetch(U+'/auth/v1/settings',{headers:{apikey:K}}));
 await j('2) login falso (só a chave)',fetch(U+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email:'teste@teste.com',password:'x'})}));
 await j('3) função ping (só a chave)',fetch(U+'/rest/v1/rpc/ping',{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:'{}'}));
 try{const {mk}=await import('/db.js');const c=mk('teste',false);if(!c)say('4) supabase-js: cliente não criado');else{const r=await c.auth.signInWithPassword({email:'teste@teste.com',password:'x'});say('4) supabase-js: '+(r.error?r.error.status+' '+r.error.message:'?'))}}catch(e){say('4) supabase-js: erro ('+e.message+')')}
}
say('\nFim. Esperado: 1=200, 2=400 invalid_credentials, 3=200/204, 4=400 Invalid login credentials.');
