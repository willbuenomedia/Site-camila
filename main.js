import {mk,DEF,ping} from './db.js?v=9';
// origem do anúncio (utm/fbclid/gclid) guardada só nesta visita
window.CM_CP=(()=>{try{const q=new URLSearchParams(location.search),k='cm-cp';let o=JSON.parse(sessionStorage.getItem(k)||'null');const c=q.get('utm_campaign')||q.get('campanha'),s=q.get('utm_source'),md=q.get('utm_medium'),fb=q.get('fbclid'),g=q.get('gclid');
  if(c||fb||g){o={c:(c||(fb?'meta-sem-nome':'google-sem-nome')).slice(0,80),s:(s||(fb?'facebook':'google')).slice(0,80),m:(md||'').slice(0,80)};sessionStorage.setItem(k,JSON.stringify(o))}return o||{}}catch(e){return{}}})();
const sb=mk('site',false);
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=s=>esc(s).replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
const obs=()=>window.__obs&&window.__obs();
let BT='Quero saber sobre este ↗';
const cards=l=>{$('#tr').innerHTML=l.map((t,i)=>`<div class="card rv"><i>${t.image_url&&/^https:\/\//.test(t.image_url)?`<img src="${esc(t.image_url)}" alt="" loading="lazy">`:String(i+1).padStart(2,'0')}</i><h3>${esc(t.title)}</h3><p>${esc(t.descr)}</p><a class="tq" data-wa="trat" data-t="${esc(t.title)}" href="#">${BT}</a></div>`).join('');links();obs()};
let wa='5567996397101',msg='Olá, Dra. Camila! Vim pelo site e gostaria de agendar uma avaliação.';
const links=()=>$$('[data-wa]').forEach(a=>{const t=a.dataset.t,tx=t?`Olá, Dra. Camila! Vim pelo site e gostaria de saber mais sobre ${t}.`:msg;a.href=`https://wa.me/${wa}?text=${encodeURIComponent(tx)}&utm_source=site&utm_medium=${a.dataset.wa}`});
cards(DEF);links();obs();
try{
  const {data}=await sb.from('site_content').select('key,value'),C=Object.fromEntries((data||[]).map(r=>[r.key,r.value]));
  $$('[data-k]').forEach(e=>C[e.dataset.k]!=null&&(e.innerHTML=fmt(C[e.dataset.k])));
  $$('[data-m]').forEach(e=>{const u=C[e.dataset.m];if(u&&/^https:\/\//.test(u)){e.src=u;e.removeAttribute('poster');e.load&&e.load()}});
  const bt=(C.b_trat||'').trim();if(bt)BT=esc(bt);
  const E=(C.loc_end||'').trim(),sc=$('#onde');if(sc){sc.hidden=!E;if(E){const q=encodeURIComponent(E.replace(/\s*\n\s*/g,', '));$('#mp').src='https://www.google.com/maps?q='+q+'&output=embed';$('#maplnk').href=/^https:\/\//.test((C.loc_maps||'').trim())?C.loc_maps.trim():'https://www.google.com/maps/search/?api=1&query='+q;const ig=(C.loc_insta||'').trim().replace(/^@/,'').replace(/[^\w.]/g,''),il=$('#instalnk');il.hidden=!ig;if(ig)il.href='https://instagram.com/'+ig}}
  $$('#faq .ai').forEach(a=>{a.hidden=!a.querySelector('b').textContent.trim()});const fq=$('#perguntas');fq&&(fq.hidden=!$$('#faq .ai').some(a=>!a.hidden));
  const g=(C.g_link||'').trim(),gl=$('#glink');if(gl){gl.hidden=!/^https:\/\//.test(g);if(!gl.hidden)gl.href=g}
  wa=C.wa||wa;msg=C.msg||msg;links();window.CM_IDS={px:(C.pixel_id||'').trim(),ga:(C.ga_id||'').trim()};document.dispatchEvent(new Event('cm:content'));
  try{C.logo?localStorage.setItem('lg',C.logo):localStorage.removeItem('lg')}catch(e){}
  const {data:T}=await sb.from('treatments').select('*').order('pos');
  T&&T.length&&cards(T);ping(sb);
}catch(e){}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-wa]');if(!a)return;
  const cp=window.CM_CP||{},cid=cp.c?Math.random().toString(36).slice(2,7).toUpperCase():null;
  if(cid)try{const u=new URL(a.href);u.searchParams.set('text',(u.searchParams.get('text')||'')+'\n\n(ref '+cid+')');a.href=u.toString()}catch(x){}
  sb&&sb.from('clicks').insert({source:a.dataset.wa,campaign:cp.c||null,utm_source:cp.s||null,utm_medium:cp.m||null,cid}).then(r=>{if(r&&r.error)return sb.from('clicks').insert({source:a.dataset.wa})}).then(()=>{},()=>{});
  (window.dataLayer=window.dataLayer||[]).push({event:'whatsapp_click',source:a.dataset.wa});
  try{fbq('track','Lead')}catch(x){}try{gtag('event','generate_lead',{method:a.dataset.wa})}catch(x){}
});
const hd=$('#hd'),dks=$$('.dark,.quote,footer');let tk=0;const upd=()=>{tk=0;hd.classList.toggle('s',scrollY>40);hd.classList.toggle('dk',dks.some(e=>{const r=e.getBoundingClientRect();return r.top<=44&&r.bottom>=44}))};addEventListener('scroll',()=>{tk||(tk=requestAnimationFrame(upd))},{passive:true});upd();
const ph=$('#ph');addEventListener('mousemove',e=>{if(innerWidth>820)ph.style.transform=`translate(${(e.clientX/innerWidth-.5)*-14}px,${(e.clientY/innerHeight-.5)*-14}px)`});
$$('video').forEach(v=>v.addEventListener('play',()=>$$('video').forEach(o=>o!==v&&o.pause())));
