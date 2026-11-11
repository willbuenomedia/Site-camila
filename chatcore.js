// Motor do assistente: só responde com texto cadastrado. Sem base consistente -> orienta ao WhatsApp.
export const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9@ ]+/g,' ').replace(/\bcomoe\b/g,'como e').replace(/\s+/g,' ').trim();
const STOP=new Set('a o as os um uma uns umas de do da dos das em no na nos nas por pra para com sem e ou que se eu voce vc meu minha seu sua me te ele ela isso isto esse essa este esta mais muito ja tem ter tenho posso pode podem queria quero gostaria saber sobre qual quais quando como onde ser sao foi vai ha tambem so mas ao aos pelo pela fazer faz fica ficar'.split(' '));
const SYN=[['toxina botulinica','botox'],['acido hialuronico','preenchimento'],['preenchedor','preenchimento'],['rinoplastia','rinomodelacao'],['bioestimulador','fios'],['fio','fios'],['valores','preco'],['valor','preco'],['custa','preco'],['custo','preco'],['quanto e','preco'],['orcamento','preco'],['investimento','preco'],['doi','dor'],['doer','dor'],['dolorido','dor'],['durar','dura'],['duracao','dura'],['demora','dura'],['telefone','whatsapp'],['zap','whatsapp'],['numero','whatsapp'],['endereco','onde'],['localizacao','onde'],['rua','onde'],['marcar','agendar'],['agendamento','agendar'],['reservar','agendar'],['consulta','avaliacao'],['duram','dura'],['durou','dura'],['qto','quanto'],['qnto','quanto'],['qts','quanto'],['tmp','tempo'],['rino','rinomodelacao'],['rinomodelagem','rinomodelacao'],['realizado','feito'],['realizada','feito'],['feita','feito'],['executado','feito'],['passo a passo','feito'],['gravida','gestante'],['gravidez','gestante']];
const stem=w=>w.length>4&&w.endsWith('s')?w.slice(0,-1):w;
export const toks=s=>{let t=' '+norm(s)+' ';for(const[a,b]of SYN)t=t.replace(new RegExp(' '+a+' ','g'),' '+b+' ').replace(new RegExp(' '+a+' ','g'),' '+b+' ');return t.trim().split(' ').filter(w=>w&&!STOP.has(w)).map(stem)};
const URG=/(falta de ar|nao consigo respirar|dificuldade (de|para) respirar|visao (turva|dupla|escura)|perdi a visao|cegueira|desmai|pele (escura|roxa|esbranquicada|preta)|necrose|dor (muito )?forte|pus\b|febre|incha(co|do) (muito|forte|grande)|alergia|reacao alergica|garganta fechando|emergencia|urgencia|socorro)/;
const MED=/(posso tomar|que remedio|diagnostic|e normal (ter|estar|ficar)|estou com .*(inchaco|roxo|caroco|nodulo|vermelh)|meu rosto (esta|ficou)|depois do (procedimento|botox|preenchimento).*(ontem|hoje|dias))/;
export const GREET=/^(oi+|ola+|opa|bom dia|boa tarde|boa noite|e ai|hello|hey|tudo bem\??)( .*)?$/;
const THX=/^(obrigad[oa]s?|valeu|muito obrigad[oa]|show|ok|certo|entendi|perfeito|blz)( .*)?$/;
const HUM=/(atendente|humano|pessoa de verdade|falar com (a )?(doutora|dra|camila|alguem)|secretaria)/;
const has=(S,t)=>S.has(t)||(t.length>=5&&[...S].some(x=>x.length>=5&&(t.startsWith(x)||x.startsWith(t))));
const idfOf=ents=>{const n=ents.length||1,df={};ents.forEach(e=>new Set(e._t).forEach(t=>df[t]=(df[t]||0)+1));return t=>Math.log(1+n/(1+(df[t]||0)))+.2};
const prep=ents=>ents.map(e=>({...e,_k:new Set(toks(e.keywords||'')),_q:new Set(toks(e.question||'')),_c:new Set(toks(e.category||'')),_t:[...toks(e.keywords||''),...toks(e.question||''),...toks(e.category||'')]}));
export function reply(text,entries){
  const n=norm(text);
  if(URG.test(n))return{kind:'urgent'};
  if(HUM.test(n))return{kind:'human'};
  if(GREET.test(n))return{kind:'greet'};
  if(THX.test(n))return{kind:'thanks'};
  const E=prep((entries||[]).filter(e=>e.active!==false&&e.answer&&!/\[PREENCHER/.test(e.answer)));
  if(MED.test(n)||!E.length)return{kind:'none'};
  const idf=idfOf(E),topicSet=new Set(E.flatMap(e=>[...e._c]));
  const one=q=>{q=[...new Set(q)];if(!q.length)return null;const den=q.reduce((s,t)=>s+idf(t),0)||1;
    const sc=E.map(e=>{let s=0,strong=false;for(const t of q){if(has(e._k,t)||has(e._q,t)){s+=idf(t);if(has(e._k,t))strong=true}else if(has(e._c,t))s+=idf(t)*.5}return{e,c:s/den,strong}}).sort((a,b)=>b.c-a.c);
    const a=sc[0],b=sc[1]||{c:0};
    if(a&&a.strong&&a.c>=.42&&(a.c-b.c>=.04||a.c>=.62))return{kind:'answer',entry:a.e};
    if(a&&a.strong&&a.c>=.25)return{kind:'suggest',entries:sc.filter(x=>x.strong&&x.c>=.2).slice(0,3).map(x=>x.e)};
    return{kind:'none'}};
  const all=[...new Set(toks(text))];if(!all.length)return{kind:'none'};
  const parts=(' '+n.replace(/\b(como|o que|qual|quais|que) e /g,'$1 ')+' ').split(/ e |,|;| alem disso | tambem | mas | depois /).map(x=>toks(x)).filter(x=>x.length);
  if(parts.length>1&&parts.length<=3){
    const T=all.filter(t=>topicSet.has(t)),I=all.filter(t=>!topicSet.has(t));
    const rs=parts.map(c=>{let x=c.slice();if(!x.some(t=>topicSet.has(t)))x=x.concat(T);if(!x.some(t=>!topicSet.has(t)))x=x.concat(I);return one(x)});
    const got=[];rs.forEach(r=>{if(r&&r.kind=='answer'&&!got.includes(r.entry))got.push(r.entry)});
    if(got.length>1)return{kind:'multi',entries:got,partial:rs.some(r=>!r||r.kind!='answer')};
  }
  return one(all)||{kind:'none'};
}
