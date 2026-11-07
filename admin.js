
import {mk,h,DEF,ping,why} from './db.js';
const sb=mk('admin',true);
const $=s=>document.querySelector(s),app=$('#app');
const flash=m=>{const t=$('#t');t.textContent=m;t.classList.add('on');if(/^Salvo/.test(m))ping(sb,1);setTimeout(()=>t.classList.remove('on'),2200)};
const LBL={logo:'Logo (menu)',logo2:'Logo (rodapé)',portrait:'Foto principal (topo)',seguro:'Foto da seção Segurança',p47:'Foto da seção Sobre',v1:'Vídeo 1',v2:'Vídeo 2',v3:'Vídeo 3'};
const txt=e=>{const d=document.createElement('div');d.innerHTML=e.innerHTML.replace(/<em[^>]*>(.*?)<\/em>/g,'*$1*').replace(/<br\s*\/?>/g,'\n');return d.textContent};
async function init(){if(!sb)return app.textContent='Configure o config.js com a URL e a chave do Supabase.';const {data:{session}}=await sb.auth.getSession();session?panel():login()}
function login(){
  const E=h('input',{type:'email',placeholder:'E-mail'}),P=h('input',{type:'password',placeholder:'Senha'});
  app.replaceChildren(h('h1',{textContent:'Painel da página'}),E,h('br'),h('br'),P,h('br'),h('br'),
    h('button',{textContent:'Entrar',onclick:async()=>{const {error}=await sb.auth.signInWithPassword({email:E.value.trim(),password:P.value});error?alert(why(error)):panel()}}));
}
async function panel(){
  const {data:okA}=await sb.rpc('is_admin');if(!okA){alert('Login correto, mas este e-mail ainda não está cadastrado como admin (tabela admins).');await sb.auth.signOut();return login()}ping(sb,1);
  const [pg,{data:rows}]=await Promise.all([fetch('./index.html').then(r=>r.text()),sb.from('site_content').select('key,value')]);
  const C=Object.fromEntries((rows||[]).map(r=>[r.key,r.value])),doc=new DOMParser().parseFromString(pg,'text/html');
  const put=async(key,value)=>{const {error}=await sb.from('site_content').upsert({key,value,updated_at:new Date().toISOString()});flash(error?'Não foi possível salvar':'Salvo ✓');return !error};
  const top=h('div',{},h('h1',{textContent:'Painel da página'}),h('p',{style:'color:#8a8785',textContent:'Use *asteriscos* para destacar uma palavra na cor terracota. Tudo salva sozinho e aparece na página na hora.'}));
  const nav=h('nav',{},...[['#tx','Textos'],['#md','Fotos e vídeos'],['#tr','Tratamentos'],['#bp','Procedimentos do agendamento'],['#wa','WhatsApp e cliques']].map(([a,b])=>h('a',{href:a,textContent:b})),h('a',{href:'./index.html',target:'_blank',textContent:'Ver página ↗'}),h('a',{href:'#',textContent:'Sair',onclick:async()=>{await sb.auth.signOut();login()}}));
  const tx=h('div',{id:'tx'},h('h2',{textContent:'Textos'}));
  doc.querySelectorAll('[data-k]').forEach(e=>{const k=e.dataset.k;const a=h('textarea',{rows:2,maxLength:3000,value:C[k]!=null?C[k]:txt(e),onchange:()=>put(k,a.value)});tx.append(h('label',{textContent:e.dataset.l||k}),a)});
  const md=h('div',{id:'md'},h('h2',{textContent:'Fotos e vídeos'}));
  const pathOf=u=>{const x=/\/object\/public\/media\/(.+)$/.exec(u||'');return x?decodeURIComponent(x[1].split('#')[0]):null};
  doc.querySelectorAll('[data-m]').forEach(e=>{const k=e.dataset.m,v=e.tagName=='VIDEO',pv=h(v?'video':'img',{className:'pv',src:C[k]||e.getAttribute('src'),controls:v,muted:true});
    md.append(h('label',{textContent:'Trocar: '+(LBL[k]||k)}),pv,h('input',{type:'file',accept:v?'video/mp4,video/quicktime':'image/jpeg,image/png,image/webp',onchange:async x=>{const f=x.target.files[0];if(!f)return;flash('Enviando…');
      const old=pathOf(C[k]),p=`${k}-${Date.now()}.${(f.name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'')}`,st=sb.storage.from('media'),{error}=await st.upload(p,f,{cacheControl:'31536000',contentType:f.type});
      if(error)return flash('Não foi possível enviar o arquivo');
      const u=st.getPublicUrl(p).data.publicUrl;
      if(await put(k,u)){C[k]=u;pv.src=u;old&&st.remove([old])}else st.remove([p])}}))});
  const trb=h('div',{id:'tr'},h('h2',{textContent:'Tratamentos'}));const list=h('div');
  let T=[];
  const load=async()=>{let r=(await sb.from('treatments').select('*').order('pos')).data||[];
    if(!r.length){await sb.from('treatments').insert(DEF.map((t,i)=>({...t,pos:i})));r=(await sb.from('treatments').select('*').order('pos')).data||[]}T=r;draw()};
  const move=async(i,d)=>{const j=i+d;if(j<0||j>=T.length)return;[T[i],T[j]]=[T[j],T[i]];await sb.from('treatments').upsert(T.map((t,n)=>({...t,pos:n})));load()};
  const draw=()=>list.replaceChildren(...T.map((t,i)=>{
    const a=h('input',{value:t.title,maxLength:80,placeholder:'Nome',onchange:async()=>{await sb.from('treatments').update({title:a.value}).eq('id',t.id);flash('Salvo ✓')}}),
      b=h('textarea',{rows:2,maxLength:300,value:t.descr,placeholder:'Descrição',onchange:async()=>{await sb.from('treatments').update({descr:b.value}).eq('id',t.id);flash('Salvo ✓')}});
    return h('div',{className:'row'},a,b,h('button',{className:'g',textContent:'↑',onclick:()=>move(i,-1)}),h('button',{className:'g',textContent:'↓',onclick:()=>move(i,1)}),
      h('button',{textContent:'Excluir',onclick:async()=>{if(confirm('Excluir "'+t.title+'"?')){await sb.from('treatments').delete().eq('id',t.id);load()}}}))}));
  trb.append(list,h('button',{textContent:'+ Adicionar tratamento',onclick:async()=>{await sb.from('treatments').insert({title:'Novo tratamento',descr:'',pos:T.length});load()}}));
  const bp=h('div',{id:'bp'},h('h2',{textContent:'Procedimentos do agendamento'}),h('p',{style:'color:#6b6764',textContent:'São as opções que a paciente escolhe ao pedir um horário no site.'}));const bl=h('div');let B=[];
  const bload=async()=>{B=(await sb.from('booking_procedures').select('*').order('pos')).data||[];bdraw()};
  const bmove=async(i,d)=>{const j=i+d;if(j<0||j>=B.length)return;[B[i],B[j]]=[B[j],B[i]];await Promise.all(B.map((x,n)=>sb.from('booking_procedures').update({pos:n}).eq('id',x.id)));bload()};
  const bdraw=()=>bl.replaceChildren(...B.map((t,i)=>{const n=h('input',{value:t.name,onchange:async()=>{const {error}=await sb.from('booking_procedures').update({name:n.value}).eq('id',t.id);flash(error?'Não foi possível salvar':'Salvo ✓')}}),c=h('input',{type:'checkbox',checked:t.active,style:'width:auto',onchange:async()=>{await sb.from('booking_procedures').update({active:c.checked}).eq('id',t.id);flash('Salvo ✓')}});
    return h('div',{className:'row'},n,h('label',{style:'display:inline-flex;gap:6px;align-items:center;text-transform:none;letter-spacing:0;font-size:14px'},c,'Aparece no agendamento'),h('button',{className:'g',textContent:'↑',onclick:()=>bmove(i,-1)}),h('button',{className:'g',textContent:'↓',onclick:()=>bmove(i,1)}),h('button',{textContent:'Remover',onclick:async()=>{if(confirm('Remover "'+t.name+'"?')){await sb.from('booking_procedures').delete().eq('id',t.id);bload()}}}))}));
  bp.append(bl,h('button',{textContent:'+ Adicionar procedimento',onclick:async()=>{await sb.from('booking_procedures').insert({name:'Novo procedimento',pos:B.length});bload()}}));
  const wa=h('div',{id:'wa'},h('h2',{textContent:'WhatsApp e cliques'}));
  const w1=h('input',{value:C.wa||'5567996397101',onchange:()=>put('wa',w1.value.replace(/\D/g,''))}),w2=h('input',{value:C.msg||'Olá, Dra. Camila! Vim pelo site e gostaria de agendar uma avaliação.',onchange:()=>put('msg',w2.value)});
  const mt=h('div');wa.append(h('label',{textContent:'WhatsApp (55 + DDD + número)'}),w1,h('label',{textContent:'Mensagem automática'}),w2,h('h3',{textContent:'Cliques no WhatsApp (últimos 30 dias)'}),mt);
  const since=new Date(Date.now()-30*864e5).toISOString(),{data:cl}=await sb.from('clicks').select('source').gte('created_at',since).limit(10000),c={};
  (cl||[]).forEach(x=>c[x.source]=(c[x.source]||0)+1);
  mt.append(h('table',{innerHTML:'<tr><th>Botão</th><th>Cliques</th></tr>'+Object.entries(c).map(([a,b])=>`<tr><td>${String(a).replace(/[^\w-]/g,'')}</td><td>${b}</td></tr>`).join('')+`<tr><th>Total</th><th>${(cl||[]).length}</th></tr>`}));
  app.replaceChildren(top,nav,tx,md,trb,bp,wa);load();bload();
}
init();
