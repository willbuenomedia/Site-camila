// Backup anti-pausa: o Vercel chama esta rota a cada 3 dias (ver vercel.json). Variáveis no painel do Vercel, nunca no repositório.
export default async function handler(req,res){
  const u=process.env.SUPABASE_URL,k=process.env.SUPABASE_KEY;
  if(!u||!k)return res.status(200).json({ok:false});
  const r=await fetch(u+'/rest/v1/rpc/ping',{method:'POST',headers:{apikey:k,'Content-Type':'application/json'},body:'{}'}).catch(()=>null);
  res.status(200).json({ok:!!(r&&r.ok)})}
