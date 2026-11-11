import {mk,h,ping} from './db.js';
import {reply} from './chatcore.js';
import {KB_SEED} from './kbseed.js';
const sb=mk('site',false);
let E=KB_SEED.filter(e=>e.active),wa='5567996397101',G='Olá! Sou a assistente virtual da Dra. Camila Migueis. Posso tirar dúvidas sobre os procedimentos, a avaliação e o atendimento. Sobre o que você quer saber?',
  FB='Não tenho uma informação segura sobre isso para responder por aqui. O melhor é falar direto com a equipe da Dra. Camila no WhatsApp, que ela responde com cuidado.',loaded=0;
const $=s=>document.querySelector(s);
const wl=q=>`https://wa.me/${wa}?text=${encodeURIComponent(q)}&utm_source=site&utm_medium=chat`;
const btn=h('button',{id:'cb-b',type:'button','aria-label':'Abrir assistente virtual'},h('i'),'Tire suas dúvidas');
const msgs=h('div',{id:'cb-m',role:'log','aria-live':'polite'});
const inp=h('input',{type:'text',maxLength:200,placeholder:'Escreva sua dúvida…','aria-label':'Sua dúvida',autocomplete:'off'});
const box=h('div',{id:'cb',role:'dialog','aria-label':'Assistente virtual'},
  h('header',{},h('img',{src:'assets/logo.png',alt:''}),h('div',{},h('b',{textContent:'Assistente da Dra. Camila'}),h('small',{textContent:'Assistente virtual · respostas automáticas'})),h('button',{type:'button','aria-label':'Fechar',textContent:'×',onclick:()=>close()})),
  msgs,h('form',{onsubmit:e=>{e.preventDefault();send(inp.value)}},inp,h('button',{type:'submit',textContent:'Enviar'})),
  h('div',{className:'nt',textContent:'Sou uma assistente virtual e não substituo a avaliação. Não envie dados pessoais ou de saúde por aqui.'}));
document.body.append(btn,box);
const add=(t,c)=>{const p=h('p',{className:c,textContent:t});msgs.append(p);msgs.scrollTop=msgs.scrollHeight;return p};
const chips=(items,fn)=>{const d=h('div',{className:'ch'},...items.map(t=>h('button',{type:'button',textContent:t,onclick:()=>fn(t)})));msgs.append(d);msgs.scrollTop=msgs.scrollHeight};
const wbtn=q=>{const a=h('a',{className:'wa',href:wl(q),target:'_blank',rel:'noopener',textContent:'Falar no WhatsApp'});a.dataset.wa='chat';a.addEventListener('click',()=>{sb&&sb.from('clicks').insert({source:'chat'}).then(()=>{},()=>{})});msgs.append(a);msgs.scrollTop=msgs.scrollHeight};
const bot=(t,after)=>{const d=h('p',{className:'bot dots'},h('s'),h('s'),h('s'));msgs.append(d);msgs.scrollTop=msgs.scrollHeight;setTimeout(()=>{d.className='bot';d.replaceChildren(t);after&&after();msgs.scrollTop=msgs.scrollHeight},Math.min(900,350+t.length*5))};
const topics=()=>{const c=[...new Set(E.map(e=>e.category))].slice(0,6);return c.length?c:['Botox','Preenchimento']};
async function load(){if(loaded)return;loaded=1;if(!sb)return;
  try{const [k,s]=await Promise.all([sb.from('kb_entries').select('category,question,answer,keywords,active,pos').eq('active',true).order('pos'),sb.from('site_content').select('key,value').in('key',['wa','chat_greet','chat_off'])]);
    if(k.data&&k.data.length)E=k.data;(s.data||[]).forEach(r=>{if(r.key=='wa'&&r.value)wa=r.value.replace(/\D/g,'');if(r.key=='chat_greet'&&r.value)G=r.value;if(r.key=='chat_off'&&r.value)FB=r.value})}catch(e){}}
function send(t){t=String(t||'').trim().slice(0,200);if(!t)return;inp.value='';add(t,'me');const r=reply(t,E);
  if(r.kind=='urgent')return bot('Se você está com sintomas fortes ou que preocupam, como falta de ar, alteração na visão, dor forte ou a pele escurecendo, procure atendimento médico de urgência agora. Depois avise a equipe da Dra. Camila.',()=>wbtn('Olá! Preciso de ajuda com um sintoma após procedimento.'));
  if(r.kind=='greet')return bot(G,()=>chips(topics(),x=>send('Quero saber sobre '+x)));
  if(r.kind=='thanks')return bot('Por nada! Se surgir outra dúvida, é só escrever.');
  if(r.kind=='human')return bot('Claro! A equipe atende pelo WhatsApp.',()=>wbtn('Olá! Vim pelo site e gostaria de falar com a equipe.'));
  if(r.kind=='answer')return bot(r.entry.answer,()=>{/whatsapp|chame|equipe/i.test(r.entry.answer)&&wbtn(t)});
  if(r.kind=='multi'){r.entries.forEach((e,i)=>setTimeout(()=>bot(e.answer),i*1400));return setTimeout(()=>bot(r.partial?'Sobre o restante da sua pergunta, o melhor é falar com a equipe no WhatsApp.':'Quer saber mais alguma coisa?',()=>r.partial&&wbtn(t)),r.entries.length*1400)}
  if(r.kind=='suggest')return bot('Encontrei estes assuntos. Qual deles você quer saber?',()=>chips(r.entries.map(e=>e.question),x=>send(x)));
  sb&&sb.rpc('log_unanswered',{p_q:t}).then(()=>{},()=>{});bot(FB,()=>wbtn(t))}
async function open(){box.classList.add('on');btn.style.display='none';await load();if(!msgs.children.length){bot(G,()=>chips(topics(),x=>send('Quero saber sobre '+x)));ping(sb)}setTimeout(()=>inp.focus({preventScroll:true}),50)}
function close(){box.classList.remove('on');btn.style.display=''}
btn.onclick=open;document.addEventListener('keydown',e=>{if(e.key=='Escape'&&box.classList.contains('on'))close()});
