import {mk,h,DEF,ping,why} from './db.js';
import {KB_SEED} from './kbseed.js';
import {reply,locEntries} from './chatcore.js';
const sb=mk('admin',true);
const $=s=>document.querySelector(s),app=$('#app');
const flash=m=>{const t=$('#t');t.textContent=m;t.classList.add('on');if(/^Salvo/.test(m))ping(sb,1);clearTimeout(flash.k);flash.k=setTimeout(()=>t.classList.remove('on'),2200)};
const LBL={logo:'Logo do menu',logo2:'Logo do rodapé',avatar:'Foto pequena do cartão do topo',portrait:'Foto principal (topo)',seguro:'Foto da seção Segurança',p47:'Foto da seção Sobre',v1:'Vídeo 1',v2:'Vídeo 2',v3:'Vídeo 3'};
const txt=e=>{const d=document.createElement('div');d.innerHTML=e.innerHTML.replace(/<em[^>]*>(.*?)<\/em>/g,'*$1*').replace(/<br\s*\/?>/g,'\n');return d.textContent};
const ICO={inicio:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',textos:'M4 6h16M4 12h16M4 18h10',midia:'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4',trat:'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',agenda:'M5 5h14v15H5zM5 10h14M9 3v4M15 3v4',ia:'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',local:'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',ads:'M4 20V10M10 20V4M16 20v-7M22 20H2'};
const VIEWS=[['inicio','Início'],['textos','Textos do site'],['midia','Fotos e vídeos'],['trat','Tratamentos'],['agenda','Agendamento'],['ia','Assistente virtual'],['local','Localização'],['ads','WhatsApp e anúncios']];
const SUB={inicio:'Resumo do que está acontecendo na página.',textos:'Todos os textos da página. Use *asteriscos* para destacar uma palavra em itálico colorido. Salva sozinho.',midia:'Troque as fotos e os vídeos do site. O arquivo antigo é apagado.',trat:'Os cartões da seção de tratamentos: nome, texto, foto e ordem.',agenda:'Opções que a paciente escolhe ao pedir um horário.',ia:'Tudo o que o chat do site sabe responder. Sem resposta cadastrada, ele chama o WhatsApp.',local:'Endereço, horários e redes. Quando o endereço é preenchido, o mapa aparece no site e o assistente passa a responder.',ads:'Número do WhatsApp, cliques e códigos de medição dos anúncios.'};
const svg=d=>{const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);s.append(p);return s};
const grow=t=>{t.style.height='auto';t.style.height=Math.min(420,t.scrollHeight+2)+'px'};
const slug=s=>s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'');
async function init(){if(!sb)return app.textContent='Configure o config.js com a URL e a chave do Supabase.';const {data:{session}}=await sb.auth.getSession();session?panel():login()}
function login(){
  const E=h('input',{type:'email',placeholder:'E-mail',autocomplete:'username'}),P=h('input',{type:'password',placeholder:'Senha',autocomplete:'current-password'});
  const go=async()=>{const {error}=await sb.auth.signInWithPassword({email:E.value.trim(),password:P.value});error?alert(why(error)):panel()};
  P.onkeydown=e=>{if(e.key=='Enter')go()};
  app.replaceChildren(h('div',{className:'lg'},h('h1',{textContent:'Painel da página'}),h('div',{className:'fld'},E),h('div',{className:'fld'},P),h('button',{className:'btn',textContent:'Entrar',onclick:go})));
}
async function panel(){
  const {data:okA}=await sb.rpc('is_admin');if(!okA){alert('Login correto, mas este e-mail ainda não está cadastrado como admin (tabela admins).');await sb.auth.signOut();return login()}ping(sb,1);
  const [pg,{data:rows}]=await Promise.all([fetch('./index.html').then(r=>r.text()),sb.from('site_content').select('key,value')]);
  const C=Object.fromEntries((rows||[]).map(r=>[r.key,r.value])),doc=new DOMParser().parseFromString(pg,'text/html');
  const put=async(key,value)=>{const {error}=await sb.from('site_content').upsert({key,value,updated_at:new Date().toISOString()});if(!error)C[key]=value;flash(error?'Não foi possível salvar':'Salvo ✓');return !error};
  const pathOf=u=>{const x=/\/object\/public\/media\/(.+)$/.exec(u||'');return x?decodeURIComponent(x[1].split('#')[0]):null};
  const ext=f=>(f.name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'');
  const fld=(label,ctrl,hint)=>h('div',{className:'fld'},h('label',{textContent:label}),ctrl,hint?h('small',{textContent:hint}):'');
  const ta=(val,onsave,o={})=>{const a=h('textarea',{rows:1,maxLength:o.max||3000,value:val,placeholder:o.ph||''});a.addEventListener('input',()=>grow(a));a.addEventListener('change',()=>onsave(a.value));requestAnimationFrame(()=>grow(a));a._g=()=>grow(a);return a};
  const views={};const mkv=k=>{views[k]=h('section',{hidden:true},h('div',{className:'hd'},h('h2',{textContent:VIEWS.find(v=>v[0]==k)[1]}),h('p',{textContent:SUB[k]})));return views[k]};
  VIEWS.forEach(([k])=>mkv(k));
  /* ---------- TEXTOS / LOCALIZAÇÃO / RASTREAMENTO (campos vindos da página) ---------- */
  const ROUTE={'Localização':'local','Rastreamento (anúncios)':'ads'},ROUTEK={g_link:'local'};
  const grp={};let lg='Geral';const fields=[];
  const tbar=h('div',{className:'bar'}),q=h('input',{type:'search',placeholder:'Buscar um texto…'});tbar.append(q);views.textos.append(tbar);
  const localCard=h('div',{className:'card'}),adsFields=h('div',{className:'card'});
  doc.querySelectorAll('[data-k]').forEach(e=>{const k=e.dataset.k;if(e.dataset.g)lg=e.dataset.g;
    const dest=ROUTEK[k]||ROUTE[lg],val=C[k]!=null?C[k]:txt(e),a=ta(val,v=>put(k,v));
    const f=fld(e.dataset.l||k,a);f.dataset.s=(e.dataset.l||k).toLowerCase()+' '+k;
    if(dest=='local'){localCard.append(f);return}if(dest=='ads'){adsFields.append(f);return}
    if(!grp[lg]){const d=h('details',{className:'gp'},h('summary',{textContent:lg}),h('div',{className:'bd2'}));grp[lg]=d;views.textos.append(d)}
    grp[lg].lastChild.append(f);fields.push(f)});
  const first=views.textos.querySelector('details');first&&(first.open=true);
  q.oninput=()=>{const s=q.value.trim().toLowerCase();Object.values(grp).forEach(d=>{let n=0;[...d.lastChild.children].forEach(f=>{const m=!s||f.dataset.s.includes(s);f.hidden=!m;n+=m});d.hidden=!n;if(s&&n)d.open=true;n&&d.lastChild.querySelectorAll('textarea').forEach(t=>t._g&&t._g())})};
  Object.values(grp).forEach(d=>d.addEventListener('toggle',()=>d.open&&d.querySelectorAll('textarea').forEach(t=>t._g&&t._g())));
  /* ---------- FOTOS E VÍDEOS ---------- */
  const mg=h('div',{className:'grid'});
  doc.querySelectorAll('[data-m]').forEach(e=>{const k=e.dataset.m,v=e.tagName=='VIDEO',pv=h(v?'video':'img',{className:'pv',src:C[k]||e.getAttribute('src'),controls:v,muted:true,preload:'metadata'});
    const inp=h('input',{type:'file',accept:v?'video/mp4,video/quicktime':'image/jpeg,image/png,image/webp',onchange:async x=>{const f=x.target.files[0];if(!f)return;flash('Enviando…');
      const old=pathOf(C[k]),p=`${k}-${Date.now()}.${ext(f)}`,st=sb.storage.from('media'),{error}=await st.upload(p,f,{cacheControl:'31536000',contentType:f.type});
      if(error)return flash('Não foi possível enviar o arquivo');
      const u=st.getPublicUrl(p).data.publicUrl;
      if(await put(k,u)){pv.src=u;old&&st.remove([old])}else st.remove([p])}});
    mg.append(h('div',{className:'mc'},pv,h('b',{textContent:LBL[k]||k}),inp))});
  views.midia.append(mg);
  /* ---------- TRATAMENTOS ---------- */
  const tl=h('div');let T=[];
  const tload=async()=>{let r=(await sb.from('treatments').select('*').order('pos')).data||[];
    if(!r.length){await sb.from('treatments').insert(DEF.map((t,i)=>({...t,pos:i})));r=(await sb.from('treatments').select('*').order('pos')).data||[]}T=r;tdraw()};
  const tmove=async(i,d)=>{const j=i+d;if(j<0||j>=T.length)return;[T[i],T[j]]=[T[j],T[i]];await sb.from('treatments').upsert(T.map((t,n)=>({...t,pos:n})));tload()};
  const tdraw=()=>tl.replaceChildren(...T.map((t,i)=>{
    const a=h('input',{value:t.title,maxLength:80,placeholder:'Nome',onchange:async()=>{await sb.from('treatments').update({title:a.value}).eq('id',t.id);flash('Salvo ✓')}}),
      b=ta(t.descr||'',async v=>{await sb.from('treatments').update({descr:v}).eq('id',t.id);flash('Salvo ✓')},{max:300,ph:'Descrição curta'}),
      pv=h('img',{className:'pv2',src:t.image_url||'',style:t.image_url?'':'display:none'}),
      up=h('input',{type:'file',accept:'image/jpeg,image/png,image/webp',onchange:async x=>{const f=x.target.files[0];if(!f)return;flash('Enviando…');
        const old=pathOf(t.image_url),st=sb.storage.from('media'),p=`tr-${t.id}-${Date.now()}.${ext(f)||'jpg'}`,{error}=await st.upload(p,f,{cacheControl:'31536000',contentType:f.type});
        if(error)return flash('Não foi possível enviar o arquivo');
        const u=st.getPublicUrl(p).data.publicUrl,{error:e2}=await sb.from('treatments').update({image_url:u}).eq('id',t.id);
        if(e2){st.remove([p]);return flash('Não foi possível salvar a foto (rode o SQL migracao-v2)')}
        t.image_url=u;pv.src=u;pv.style.display='';old&&st.remove([old]);flash('Salvo ✓')}}),
      rm=h('button',{className:'btn g sm',textContent:'Remover foto',onclick:async()=>{const old=pathOf(t.image_url);if(!old)return;await sb.from('treatments').update({image_url:null}).eq('id',t.id);sb.storage.from('media').remove([old]);t.image_url=null;pv.style.display='none';flash('Salvo ✓')}});
    return h('details',{className:'it',open:T.length<4},h('summary',{},h('b',{textContent:t.title||'Sem nome'}),h('span',{className:'tg o',textContent:t.image_url?'com foto':'sem foto'})),h('div',{className:'bd2'},fld('Nome',a),fld('Descrição',b),fld('Foto do cartão',h('div',{},pv,up,rm)),
      h('div',{className:'bar'},h('button',{className:'btn g sm',textContent:'↑ Subir',onclick:()=>tmove(i,-1)}),h('button',{className:'btn g sm',textContent:'↓ Descer',onclick:()=>tmove(i,1)}),
      h('button',{className:'btn d sm',textContent:'Excluir',onclick:async()=>{if(confirm('Excluir "'+t.title+'"?')){const old=pathOf(t.image_url);await sb.from('treatments').delete().eq('id',t.id);old&&sb.storage.from('media').remove([old]);tload()}}}))))}));
  views.trat.append(tl,h('button',{className:'btn',textContent:'+ Adicionar tratamento',onclick:async()=>{await sb.from('treatments').insert({title:'Novo tratamento',descr:'',pos:T.length});tload()}}));
  /* ---------- AGENDAMENTO ---------- */
  const bl=h('div');let B=[];
  const bload=async()=>{B=(await sb.from('booking_procedures').select('*').order('pos')).data||[];bdraw()};
  const bmove=async(i,d)=>{const j=i+d;if(j<0||j>=B.length)return;[B[i],B[j]]=[B[j],B[i]];await Promise.all(B.map((x,n)=>sb.from('booking_procedures').update({pos:n}).eq('id',x.id)));bload()};
  const bdraw=()=>bl.replaceChildren(...B.map((t,i)=>{const n=h('input',{value:t.name,onchange:async()=>{const {error}=await sb.from('booking_procedures').update({name:n.value}).eq('id',t.id);flash(error?'Não foi possível salvar':'Salvo ✓')}}),c=h('input',{type:'checkbox',checked:t.active,onchange:async()=>{await sb.from('booking_procedures').update({active:c.checked}).eq('id',t.id);flash('Salvo ✓')}});
    return h('div',{className:'card'},n,h('div',{className:'bar'},h('label',{className:'sw'},c,'Aparece no agendamento'),h('button',{className:'btn g sm',textContent:'↑',onclick:()=>bmove(i,-1)}),h('button',{className:'btn g sm',textContent:'↓',onclick:()=>bmove(i,1)}),h('button',{className:'btn d sm',textContent:'Remover',onclick:async()=>{if(confirm('Remover "'+t.name+'"?')){await sb.from('booking_procedures').delete().eq('id',t.id);bload()}}})))}));
  views.agenda.append(bl,h('button',{className:'btn',textContent:'+ Adicionar procedimento',onclick:async()=>{await sb.from('booking_procedures').insert({name:'Novo procedimento',pos:B.length});bload()}}));
  /* ---------- ASSISTENTE VIRTUAL ---------- */
  const PH='[PREENCHER: escreva aqui a resposta, na voz da Dra.]';
  const TPL=[['Preço e valores','Quanto custa?','preco valor valores quanto custa orcamento investimento'],['Formas de pagamento','Quais as formas de pagamento?','pagamento pix cartao dinheiro parcelar parcelamento'],['Convênios','Vocês aceitam convênio?','convenio plano saude unimed reembolso'],['Como chegar / estacionamento','Tem estacionamento?','estacionamento vaga carro parar chegar'],['Cuidados depois do procedimento','Quais os cuidados depois do procedimento?','cuidados depois pos apos recuperacao inchaco roxo'],['Quem não pode fazer','Quem não pode fazer o procedimento?','contraindicacao gestante amamentando quem nao pode'],['O que levar na primeira consulta','O que levo na primeira consulta?','levar documentos primeira consulta avaliacao exames'],['Cancelar ou remarcar','Como cancelo ou remarco meu horário?','cancelar remarcar desmarcar horario mudar'],['Duração da consulta','Quanto tempo dura a consulta?','tempo duracao consulta demora avaliacao'],['Idade mínima','A partir de que idade posso fazer?','idade menor anos adolescente jovem'],['Mais de um procedimento no dia','Posso fazer mais de um procedimento no mesmo dia?','varios juntos mesmo dia combinar']];
  const kl=h('div'),ku=h('div'),kt=h('div');let K=[],UN=[];
  const tabs=h('div',{className:'tabs'}),panes={};
  const TABS=[['resp','Respostas'],['teste','Testar'],['conf','Configurar'],['sem','Sem resposta']];
  const tabBtn={};TABS.forEach(([k,l])=>{const b=h('button',{textContent:l,onclick:()=>showTab(k)});tabBtn[k]=b;tabs.append(b);panes[k]=h('div',{hidden:true})});
  const showTab=k=>{TABS.forEach(([x])=>{panes[x].hidden=x!=k;tabBtn[x].classList.toggle('on',x==k)})};
  const sq=h('input',{type:'search',placeholder:'Buscar nas respostas…',oninput:()=>kdraw()}),sc=h('select',{onchange:()=>kdraw()},h('option',{value:'',textContent:'Todos os assuntos'}));
  const pend=x=>/\[PREENCHER/.test(x.answer||'');
  const kload=async()=>{const {data,error}=await sb.from('kb_entries').select('*').order('pos');if(error){kl.textContent='Rode o SQL migracao-chat no Supabase para ativar esta área.';return}K=data||[];kdraw();badge()};
  const ksave=async(t,f)=>{const {error}=await sb.from('kb_entries').update({...f,updated_at:new Date().toISOString()}).eq('id',t.id);if(!error)Object.assign(t,f);flash(error?'Não foi possível salvar':'Salvo ✓');return !error};
  const kmove=async(t,d)=>{const i=K.indexOf(t),j=i+d;if(j<0||j>=K.length)return;[K[i],K[j]]=[K[j],K[i]];await Promise.all(K.map((x,n)=>sb.from('kb_entries').update({pos:n}).eq('id',x.id)));kload()};
  const kdraw=()=>{const cats=[...new Set(K.map(x=>x.category).filter(Boolean))].sort(),cur=sc.value;sc.replaceChildren(h('option',{value:'',textContent:'Todos os assuntos'}),...cats.map(c=>h('option',{value:c,textContent:c,selected:c==cur})));
    const s=sq.value.trim().toLowerCase(),list=K.filter(t=>(!cur||t.category==cur)&&(!s||(t.question+' '+t.answer+' '+t.keywords).toLowerCase().includes(s)));
    kl.replaceChildren(...(list.length?list:[h('p',{style:'color:var(--mut)',textContent:K.length?'Nada encontrado.':'Nenhuma resposta ainda. Use "Carregar respostas sugeridas" ou adicione uma.'})]).map(t=>{if(!t.id)return t;
      const ct=h('input',{value:t.category,maxLength:60,placeholder:'Assunto (ex.: Botox, Pagamento)',onchange:()=>ksave(t,{category:ct.value}).then(kdraw)}),qq=h('input',{value:t.question,maxLength:200,onchange:()=>ksave(t,{question:qq.value})}),
        a=ta(t.answer,v=>ksave(t,{answer:v}).then(kdraw),{max:1500,ph:'Resposta, na voz da Dra.'}),k=ta(t.keywords||'',v=>ksave(t,{keywords:v}),{max:400,ph:'Palavras que a pessoa usaria'}),
        c=h('input',{type:'checkbox',checked:t.active,onchange:()=>ksave(t,{active:c.checked}).then(kdraw)});
      return h('details',{className:'it'},h('summary',{},h('b',{textContent:t.question}),pend(t)?h('span',{className:'tg w',textContent:'falta preencher'}):'',!t.active?h('span',{className:'tg o',textContent:'desligada'}):'',h('span',{className:'tg',textContent:t.category||'sem assunto'})),
        h('div',{className:'bd2'},fld('Assunto',ct),fld('Pergunta',qq),fld('Resposta',a,'Escrita como a Dra. falaria. Respostas com [PREENCHER] não são usadas pelo chat.'),fld('Palavras-chave',k,'Termos que a paciente usaria, separados por espaço. Sem acento.'),
          h('div',{className:'bar'},h('label',{className:'sw'},c,'Ativa no chat'),h('button',{className:'btn g sm',textContent:'↑',onclick:()=>kmove(t,-1)}),h('button',{className:'btn g sm',textContent:'↓',onclick:()=>kmove(t,1)}),h('button',{className:'btn g sm',textContent:'Duplicar',onclick:async()=>{await sb.from('kb_entries').insert({category:t.category,question:t.question+' (cópia)',answer:t.answer,keywords:t.keywords,active:false,pos:K.length});kload()}}),h('button',{className:'btn d sm',textContent:'Excluir',onclick:async()=>{if(confirm('Excluir esta resposta?')){await sb.from('kb_entries').delete().eq('id',t.id);kload()}}}))))}))};
  const tplSel=h('select',{onchange:async()=>{const i=tplSel.value;if(i==='')return;const [c,qn,kw]=TPL[+i];tplSel.value='';await sb.from('kb_entries').insert({category:c,question:qn,answer:PH,keywords:kw,active:true,pos:K.length});await kload();flash('Modelo criado: preencha a resposta');},},h('option',{value:'',textContent:'+ Modelo rápido…'}),...TPL.map((t,i)=>h('option',{value:i,textContent:t[0]})));
  panes.resp.append(h('div',{className:'bar'},sq,sc),h('div',{className:'bar'},h('button',{className:'btn',textContent:'+ Nova resposta',onclick:async()=>{await sb.from('kb_entries').insert({category:'Geral',question:'Nova pergunta',answer:PH,keywords:'',active:true,pos:K.length});kload()}}),tplSel,
    h('button',{className:'btn g',textContent:'Carregar respostas sugeridas',onclick:async()=>{if(!confirm('Adiciona as respostas sugeridas ao final da lista (nada é apagado). Continuar?'))return;const have=new Set(K.map(x=>x.question));const add=KB_SEED.filter(x=>!have.has(x.question)).map((x,n)=>({...x,pos:K.length+n}));if(add.length)await sb.from('kb_entries').insert(add);await put('chat_db','1');kload();flash('Salvo ✓')}})),kl);
  /* testar */
  const ti=h('input',{type:'text',placeholder:'Escreva como a paciente escreveria… ex.: como é feito o botox e quanto tempo dura?',maxLength:200}),tr=h('div');
  const run=()=>{const t=ti.value.trim();if(!t)return;const ex=locEntries(C),E=K.filter(x=>x.active).filter(x=>!ex.some(y=>y.question==x.question)).concat(ex),r=reply(t,E),out=[];
    const say=(l,x)=>out.push(h('div',{className:'res'},h('small',{textContent:l}),x));
    if(r.kind=='answer')say('Responde com: '+r.entry.question,r.entry.answer);
    else if(r.kind=='multi'){r.entries.forEach(e=>say('Responde com: '+e.question,e.answer));r.partial&&say('Aviso','Parte da pergunta ficou sem resposta e o chat manda para o WhatsApp.')}
    else if(r.kind=='suggest')say('Não tem certeza — oferece estas opções',r.entries.map(e=>'• '+e.question).join('\n'));
    else if(r.kind=='none'){say('Sem resposta cadastrada','O chat manda a pessoa para o WhatsApp e guarda a pergunta em "Sem resposta".');out.push(h('button',{className:'btn sm',textContent:'Cadastrar esta pergunta',onclick:async()=>{await sb.from('kb_entries').insert({category:'Novas',question:t.slice(0,200),answer:PH,keywords:'',active:true,pos:K.length});await kload();flash('Criada: preencha a resposta na aba Respostas')}}))}
    else say('Resposta automática do chat',{urgent:'Orienta procurar atendimento de urgência.',human:'Chama a equipe no WhatsApp.',greet:'Responde com a saudação inicial.',thanks:'Agradece e se coloca à disposição.'}[r.kind]||r.kind);
    tr.replaceChildren(...out)};
  ti.onkeydown=e=>{if(e.key=='Enter')run()};
  panes.teste.append(h('div',{className:'card'},h('p',{style:'margin-top:0;color:var(--mut)',textContent:'Veja exatamente o que o chat do site responderia, com as respostas ativas de agora (e as geradas pela aba Localização).'}),h('div',{className:'bar'},ti,h('button',{className:'btn',textContent:'Testar',onclick:run})),tr));
  /* configurar */
  panes.conf.append(h('div',{className:'card'},fld('Saudação inicial',ta(C.chat_greet||'',v=>put('chat_greet',v),{max:600,ph:'Vazio = mensagem padrão'}),'A primeira mensagem do chat.'),fld('Quando não souber responder',ta(C.chat_off||'',v=>put('chat_off',v),{max:600,ph:'Vazio = mensagem padrão'}),'Aparece junto do botão do WhatsApp.')),
    h('div',{className:'card'},h('b',{textContent:'Informações automáticas'}),h('p',{style:'color:var(--mut);margin:6px 0 10px',textContent:'Endereço, horário, Instagram e formas de pagamento preenchidos em Localização viram respostas do chat sozinhos. Não precisa cadastrar de novo.'}),h('button',{className:'btn g sm',textContent:'Ir para Localização',onclick:()=>go('local')})));
  /* sem resposta */
  const uload=async()=>{const {data}=await sb.from('chat_unanswered').select('id,question,created_at').order('created_at',{ascending:false}).limit(50);UN=data||[];badge();
    ku.replaceChildren(...(UN.length?UN:[{empty:1}]).map(r=>r.empty?h('p',{style:'color:var(--mut)',textContent:'Nenhuma pergunta sem resposta. 🎉'}):h('div',{className:'card'},h('b',{textContent:r.question}),h('div',{className:'bar'},h('button',{className:'btn sm',textContent:'Criar resposta',onclick:async()=>{await sb.from('kb_entries').insert({category:'Novas',question:r.question.slice(0,200),answer:PH,keywords:'',active:true,pos:K.length});await sb.from('chat_unanswered').delete().eq('id',r.id);kload();uload();flash('Criada: preencha a resposta na aba Respostas')}}),h('button',{className:'btn g sm',textContent:'Apagar',onclick:async()=>{await sb.from('chat_unanswered').delete().eq('id',r.id);uload()}})))))};
  panes.sem.append(ku);
  const nbd=h('span',{className:'bd',hidden:true});
  const badge=()=>{const n=UN.length;nbd.hidden=!n;nbd.textContent=n;tabBtn.sem.replaceChildren('Sem resposta',n?h('span',{className:'bd',textContent:n}):'')};
  views.ia.append(tabs,...TABS.map(([k])=>panes[k]));showTab('resp');
  /* ---------- LOCALIZAÇÃO ---------- */
  const mp=h('iframe',{className:'mp',title:'Mapa',loading:'lazy',referrerPolicy:'no-referrer-when-downgrade'});
  const mapUp=()=>{const e=(C.loc_end||'').trim();mp.hidden=!e;e&&(mp.src='https://www.google.com/maps?q='+encodeURIComponent(e.replace(/\s*\n\s*/g,', '))+'&output=embed')};
  localCard.addEventListener('change',()=>setTimeout(mapUp,400));mapUp();
  views.local.append(localCard,h('div',{className:'card'},h('b',{textContent:'Como vai aparecer o mapa'}),mp));
  /* ---------- WHATSAPP E ANÚNCIOS ---------- */
  const w1=h('input',{value:C.wa||'5567996397101',onchange:()=>put('wa',w1.value.replace(/\D/g,''))}),w2=ta(C.msg||'Olá, Dra. Camila! Vim pelo site e gostaria de agendar uma avaliação.',v=>put('msg',v));
  const clicksBox=h('div'),since=new Date(Date.now()-30*864e5).toISOString(),{data:cl}=await sb.from('clicks').select('source,created_at').gte('created_at',since).limit(10000);const CL=cl||[];
  const day=d=>new Date(d).toLocaleDateString('sv-SE'),days=[];for(let i=29;i>=0;i--)days.push(new Date(Date.now()-i*864e5).toLocaleDateString('sv-SE'));
  const perDay={};CL.forEach(x=>{const d=day(x.created_at);perDay[d]=(perDay[d]||0)+1});
  const chart=()=>{const mx=Math.max(1,...days.map(d=>perDay[d]||0));return h('div',{className:'chart'},...days.map(d=>{const i=h('i',{style:`height:${Math.max(2,(perDay[d]||0)/mx*100)}%`});i.dataset.t=d.slice(8)+'/'+d.slice(5,7)+': '+(perDay[d]||0);return i}))};
  const bySrc={};CL.forEach(x=>bySrc[x.source]=(bySrc[x.source]||0)+1);
  const NAMES={topo:'Botão do topo',hero:'Botão principal',seguranca:'Seção Segurança',final:'Chamada final',flutuante:'Botão flutuante',agendar:'Pedido de horário',chat:'Assistente virtual',trat:'Cartões de tratamento'};
  const n7=CL.filter(x=>Date.now()-new Date(x.created_at)<7*864e5).length;
  views.ads.append(h('div',{className:'card'},fld('WhatsApp (55 + DDD + número)',w1),fld('Mensagem automática',w2,'O texto que aparece pronto quando a pessoa abre o WhatsApp.')),
    h('h3',{textContent:'Medição dos anúncios'}),h('div',{className:'card'},adsFields,h('small',{style:'color:var(--mut)',textContent:'Os códigos só começam a medir depois que a visitante aceita os cookies.'})),
    h('h3',{textContent:'Cliques no WhatsApp (30 dias)'}),h('div',{className:'card'},chart(),h('table',{style:'margin-top:14px'},h('tr',{},h('th',{textContent:'Origem do clique'}),h('th',{textContent:'Cliques'})),...Object.entries(bySrc).sort((a,b)=>b[1]-a[1]).map(([a,b])=>h('tr',{},h('td',{textContent:NAMES[a]||String(a).replace(/[^\w-]/g,'')}),h('td',{textContent:b}))),h('tr',{},h('th',{textContent:'Total'}),h('th',{textContent:CL.length})))));
  /* ---------- INÍCIO ---------- */
  const todo=h('div',{className:'card'});
  const drawTodo=()=>{const pe=K.filter(x=>x.active&&pend(x)).length;
    const L=[[C.loc_end,'Endereço da clínica (libera o mapa no site)','local'],[C.loc_hor,'Dias e horários de atendimento','local'],[C.loc_insta,'Instagram','local'],[C.g_link,'Link para avaliar no Google','local'],[C.pixel_id,'Pixel da Meta (anúncios)','ads'],[C.ga_id,'Google Analytics 4','ads'],[pe?'':'ok',pe?`Respostas do assistente para preencher (${pe})`:'Respostas do assistente completas','ia']];
    todo.replaceChildren(h('b',{textContent:'Para deixar a página completa'}),...L.map(([v,l,r])=>h('button',{className:'todo'+((v||'').trim()?' ok':''),onclick:()=>go(r)},h('span',{className:'dot',textContent:(v||'').trim()?'✓':''}),h('span',{textContent:l}),h('span',{className:'go',textContent:(v||'').trim()?'':'Preencher →'}))))};
  views.inicio.append(h('div',{className:'stats'},h('div',{className:'stat'},h('b',{textContent:n7}),h('span',{textContent:'cliques no WhatsApp (7 dias)'})),h('div',{className:'stat'},h('b',{textContent:CL.length}),h('span',{textContent:'cliques (30 dias)'})),h('div',{className:'stat',id:'sA'},h('b',{textContent:'–'}),h('span',{textContent:'respostas ativas no assistente'})),h('div',{className:'stat',id:'sU'},h('b',{textContent:'–'}),h('span',{textContent:'perguntas sem resposta'}))),
    h('div',{className:'card'},h('b',{textContent:'Cliques por dia'}),chart()),todo,
    h('div',{className:'bar'},h('a',{className:'btn',href:'./index.html',target:'_blank',rel:'noopener',textContent:'Ver a página ↗'})));
  const stats=()=>{$('#sA b').textContent=K.filter(x=>x.active&&!pend(x)).length;$('#sU b').textContent=UN.length;drawTodo()};
  /* ---------- SHELL ---------- */
  const nav={},side=h('aside',{id:'sd'},h('div',{className:'br'},'Painel ',h('em',{textContent:'Camila'})),h('div',{className:'sub',textContent:'Dra. Camila Migueis'}));
  VIEWS.forEach(([k,l])=>{const b=h('button',{className:'nv',onclick:()=>go(k)},svg(ICO[k]),l);if(k=='ia')b.append(nbd);nav[k]=b;side.append(b)});
  side.append(h('div',{className:'gap'}),h('a',{className:'ex',href:'./index.html',target:'_blank',rel:'noopener',textContent:'Ver a página ↗'}),h('button',{className:'nv',onclick:async()=>{await sb.auth.signOut();login()}},'Sair'));
  const title=h('b'),menuB=h('button',{textContent:'☰',onclick:()=>document.body.classList.toggle('mo')}),tb=h('header',{id:'tb'},menuB,title);menuB.setAttribute('aria-label','Menu');
  const main=h('main',{id:'mn'},...VIEWS.map(([k])=>views[k]));
  const go=k=>{if(!views[k])k='inicio';VIEWS.forEach(([x])=>{views[x].hidden=x!=k;nav[x].classList.toggle('on',x==k)});title.textContent=VIEWS.find(v=>v[0]==k)[1];document.body.classList.remove('mo');history.replaceState(null,'','#'+k);scrollTo(0,0);if(k=='textos')Object.values(grp).forEach(d=>d.open&&d.querySelectorAll('textarea').forEach(t=>t._g&&t._g()));if(k=='inicio')stats()};
  app.replaceChildren(h('div',{className:'shell'},side,h('div',{},tb,main)));
  document.addEventListener('click',e=>{if(document.body.classList.contains('mo')&&!e.target.closest('#sd,#tb'))document.body.classList.remove('mo')});
  go(location.hash.slice(1)||'inicio');
  await Promise.all([tload(),bload(),kload().then(uload)]);stats();
}
init();
