export default async function handler(req,res){
  let u=process.env.SUPABASE_URL||'',k=process.env.SUPABASE_KEY||'',via='variaveis';
  if(!u||!k){via='config.js';
    const host=process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL;
    const t=host?await fetch('https://'+host+'/config.js').then(r=>r.text()).catch(()=>''):'';
    u=u||(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/.exec(t)||[])[1]||'';k=k||(/SUPABASE_KEY\s*=\s*['"]([^'"]+)['"]/.exec(t)||[])[1]||''}
  const U=(/https:\/\/[a-z0-9-]+\.supabase\.co/i.exec(u)||[])[0],K=(/sb_publishable_[\w-]+|eyJ[\w.-]+/.exec(k)||[])[0];
  if(!U)return res.status(200).json({ok:false,motivo:'SUPABASE_URL invalida',tamanho:u.length,comeca:u.slice(0,8),via});
  if(!K)return res.status(200).json({ok:false,motivo:'SUPABASE_KEY invalida (deve comecar com sb_publishable_)',tamanho:k.length,comeca:k.slice(0,6),via});
  const r=await fetch(U+'/rest/v1/rpc/ping',{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:'{}'}).catch(()=>null);
  if(!r)return res.status(200).json({ok:false,motivo:'sem resposta do Supabase',via});
  const m={401:'chave recusada',404:'funcao ping nao existe no banco',403:'sem permissao para ping'};
  res.status(200).json(r.ok?{ok:true,via}:{ok:false,status:r.status,motivo:m[r.status]||'erro no Supabase',via})}
