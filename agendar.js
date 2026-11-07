import {mk,h} from './db.js';
const sb=mk('site',false),$=s=>document.querySelector(s),TZ='America/Campo_Grande',L=(d,o)=>new Date(d).toLocaleString('pt-BR',{timeZone:TZ,...o});
const ERR=m=>/indispon/.test(m)?'Esse horário acabou de ser ocupado. Escolha outro.':/limite|duplicada/.test(m)?'Você já enviou solicitações recentemente. Aguarde a recepção ou fale pelo WhatsApp.':/telefone/.test(m)?'Confira o telefone (com DDD).':'Não foi possível enviar agora. Tente pelo WhatsApp.';
const chip=(t,on,f)=>h('button',{type:'button',className:'chip'+(on?' on':''),textContent:t,onclick:f}),ok=(t,p)=>h('div',{className:'ok'},h('h3',{textContent:t}),h('p',{textContent:p}));
const body=h('div',{className:'bk'}),tabs=h('div',{className:'mtabs'}),ov=h('div',{className:'mdl',onclick:e=>e.target==ov&&close()},h('div',{className:'mbox',role:'dialog'},tabs,body));document.body.append(ov);
const close=()=>{ov.classList.remove('on');document.body.style.overflow=''};
function open(t){ov.classList.add('on');document.body.style.overflow='hidden';
  tabs.replaceChildren(...[['agendar','Agendar'],['avaliar','Avaliar']].map(([k,n])=>chip(n,k==t,()=>open(k))),h('button',{type:'button',className:'chip',textContent:'✕',title:'Fechar',style:'margin-left:auto',onclick:close}));
  body.replaceChildren();(t=='agendar'?booking:review)()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-open]');if(t){e.preventDefault();open(t.dataset.open)}});
addEventListener('keydown',e=>e.key=='Escape'&&close());
const wa=()=>{const a=$('[data-wa=final]');return h('a',{className:'btn',href:a?a.href:'#',target:'_blank',rel:'noopener',textContent:'Falar pelo WhatsApp'})};
async function booking(){const fb=()=>body.replaceChildren(h('p',{textContent:'O agendamento online não está disponível agora. Fale conosco pelo WhatsApp.'}),wa());
  if(!sb)return fb();body.textContent='Carregando…';
  const [{data:procs},{data:slots,error}]=await Promise.all([sb.from('booking_procedures').select('id,name').eq('active',true).order('pos'),sb.rpc('get_available_slots',{p_days:30})]);
  if(error||!procs||!procs.length||!slots||!slots.length)return fb();
  const days={};slots.forEach(s=>{const k=new Date(s.slot).toLocaleDateString('sv-SE',{timeZone:TZ});(days[k]=days[k]||[]).push(s.slot)});
  let pick=null,dk=Object.keys(days)[0];
  const sel=h('select',{},...procs.map(p=>h('option',{value:p.id,textContent:p.name}))),dEl=h('div',{className:'chips'}),tEl=h('div',{className:'chips'});
  const name=h('input',{placeholder:'Seu nome',maxLength:100,autocomplete:'name'}),ph=h('input',{placeholder:'WhatsApp com DDD',type:'tel',inputMode:'tel',maxLength:20,autocomplete:'tel'}),hp=h('input',{tabIndex:-1,autocomplete:'off',style:'position:absolute;left:-9999px'}),ck=h('input',{type:'checkbox'}),msg=h('p',{className:'bkm'});
  const draw=()=>{dEl.replaceChildren(...Object.keys(days).map(k=>chip(L(days[k][0],{weekday:'short',day:'2-digit',month:'2-digit'}),k==dk,()=>{dk=k;pick=null;draw()})));tEl.replaceChildren(...days[dk].map(s=>chip(L(s,{hour:'2-digit',minute:'2-digit'}),s==pick,()=>{pick=s;draw()})))};draw();
  const done=()=>body.replaceChildren(ok('Solicitação enviada!','A recepção vai entrar em contato pelo WhatsApp para confirmar. Atenção: o horário ainda não está confirmado.'));
  const send=h('button',{className:'btn',type:'button',textContent:'Solicitar horário',onclick:async()=>{msg.textContent='';
    if(!pick)return msg.textContent='Escolha um horário.';if(name.value.trim().length<2||ph.value.replace(/\D/g,'').length<10)return msg.textContent='Preencha nome e WhatsApp com DDD.';if(!ck.checked)return msg.textContent='Marque a autorização para continuar.';if(hp.value)return done();
    send.disabled=true;const {error}=await sb.rpc('request_appointment',{p_procedure:sel.value,p_start:pick,p_name:name.value,p_phone:ph.value,p_consent:true});send.disabled=false;error?msg.textContent=ERR(error.message):done()}});
  body.replaceChildren(h('label',{textContent:'Procedimento'}),sel,h('label',{textContent:'Dia'}),dEl,h('label',{textContent:'Horário'}),tEl,h('label',{textContent:'Seus dados'}),name,ph,hp,h('label',{className:'ck'},ck,'Concordo que a clínica use meu nome e telefone apenas para entrar em contato sobre este agendamento. Isso não é autorização para propaganda. Não informe dados de saúde neste formulário.'),msg,send)}
function review(){if(!sb)return body.replaceChildren(h('p',{textContent:'Avaliações indisponíveis no momento.'}));let st=5;
  const n=h('input',{placeholder:'Seu nome',maxLength:60}),c=h('textarea',{placeholder:'Conte como foi a sua experiência (não inclua dados de saúde)',rows:4,maxLength:600}),ck=h('input',{type:'checkbox'}),m=h('p',{className:'bkm'}),stars=h('div',{className:'chips'});
  const ds=()=>stars.replaceChildren(...[1,2,3,4,5].map(i=>chip('★',i<=st,()=>{st=i;ds()})));ds();
  const b=h('button',{className:'btn',type:'button',textContent:'Enviar avaliação',onclick:async()=>{m.textContent='';if(n.value.trim().length<2||c.value.trim().length<5)return m.textContent='Preencha nome e comentário.';if(!ck.checked)return m.textContent='Marque a autorização para continuar.';
    b.disabled=true;const {error}=await sb.rpc('submit_review',{p_name:n.value,p_stars:st,p_comment:c.value,p_consent:true});b.disabled=false;error?m.textContent='Não foi possível enviar agora. Tente mais tarde.':body.replaceChildren(ok('Obrigada!','Sua avaliação será publicada depois de aprovada pela clínica.'))}});
  body.replaceChildren(h('label',{textContent:'Nota'}),stars,h('label',{textContent:'Seus dados'}),n,c,h('label',{className:'ck'},ck,'Autorizo a publicação do meu nome e comentário neste site, após aprovação da clínica.'),m,b)}
(async()=>{const l=$('#rvl');if(!sb||!l)return;const {data}=await sb.from('reviews').select('name,stars,comment').order('created_at',{ascending:false}).limit(9);
  data&&data.length&&l.replaceChildren(...data.map(r=>h('div',{className:'rvw'},h('div',{className:'st',textContent:'★'.repeat(r.stars)+'☆'.repeat(5-r.stars)}),h('p',{textContent:r.comment}),h('b',{textContent:r.name}))))})();
