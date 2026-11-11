// Entrega a URL e a chave PÚBLICAS do Supabase a partir das variáveis do Vercel (assim não ficam escritas no repositório).
// Recusa chaves secretas por segurança.
export default function handler(req,res){
  const u=process.env.SUPABASE_URL,k=process.env.SUPABASE_KEY;
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
  if(!u||!k)return res.status(404).json({ok:false});
  let secreta=/^sb_secret/.test(k);
  try{const p=JSON.parse(Buffer.from(k.split('.')[1],'base64').toString());if(p.role==='service_role')secreta=true}catch(e){}
  if(secreta)return res.status(500).json({ok:false,erro:'chave secreta nao pode ser usada aqui'});
  res.status(200).json({url:u,key:k})}
