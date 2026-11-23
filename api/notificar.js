// Avisa a recepção por e-mail quando chega um pedido de agendamento (opcional).
// Variáveis no Vercel: RESEND_API_KEY, NOTIFY_EMAIL (para quem), NOTIFY_FROM (ex.: "Agenda <agenda@seudominio.com>").
// Não recebe dados do visitante: o e-mail só diz "há um novo pedido" (nada a falsificar, nada de dado pessoal).
let last=0;
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).end();
  const o=req.headers.origin||'',host=req.headers.host||'';
  if(o&&!o.endsWith('//'+host))return res.status(403).end();
  const k=process.env.RESEND_API_KEY,to=process.env.NOTIFY_EMAIL,from=process.env.NOTIFY_FROM;
  if(!k||!to||!from)return res.status(200).json({ok:false,motivo:'e-mail não configurado'});
  if(Date.now()-last<60000)return res.status(200).json({ok:true,limitado:true});
  last=Date.now();
  const site='https://'+host;
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+k,'Content-Type':'application/json'},
    body:JSON.stringify({from,to:to.split(',').map(s=>s.trim()),subject:'Novo pedido de agendamento no site',html:`<p>Chegou um novo pedido de agendamento.</p><p><a href="${site}/balcao.html">Abrir o Balcão</a></p>`})}).catch(()=>null);
  res.status(200).json({ok:!!(r&&r.ok)})}
