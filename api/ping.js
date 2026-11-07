// Backup anti-pausa. Chamado pelo Vercel a cada 3 dias (vercel.json). Não precisa de variáveis: lê a URL e a chave
// PÚBLICAS do próprio config.js do site (podem ser públicas; quem protege os dados é o RLS).
export default async function handler(req,res){
  const host=process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL;
  if(!host)return res.status(200).json({ok:false});
  const t=await fetch('https://'+host+'/config.js').then(r=>r.text()).catch(()=>'');
  const u=(/SUPABASE_URL\s*=\s*'([^']+)'/.exec(t)||[])[1],k=(/SUPABASE_KEY\s*=\s*'([^']+)'/.exec(t)||[])[1];
  if(!u||!k||!/^https:\/\//.test(u))return res.status(200).json({ok:false});
  const r=await fetch(u+'/rest/v1/rpc/ping',{method:'POST',headers:{apikey:k,'Content-Type':'application/json'},body:'{}'}).catch(()=>null);
  res.status(200).json({ok:!!(r&&r.ok)})}
