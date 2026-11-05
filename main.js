import {sb,DEF} from './config.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=s=>esc(s).replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&(x.target.classList.add('on'),io.unobserve(x.target))),{threshold:.12});
const obs=()=>$$('.rv:not(.on)').forEach(e=>io.observe(e));
const cards=l=>{$('#tr').innerHTML=l.map((t,i)=>`<div class="card rv"><i>${String(i+1).padStart(2,'0')}</i><h3>${esc(t.title)}</h3><p>${esc(t.descr)}</p></div>`).join('');const m=l.map(t=>`<span>${esc(t.title)}</span>`).join('');const r=l.slice().reverse().map(t=>`<span>${esc(t.title)}</span>`).join('');$('#mq1').innerHTML=m+m;$('#mq2').innerHTML=r+r;obs()};
let wa='5567996397101',msg='Olá, Dra. Camila! Vim pelo site e gostaria de agendar uma avaliação.';
const links=()=>$$('[data-wa]').forEach(a=>a.href=`https://wa.me/${wa}?text=${encodeURIComponent(msg)}&utm_source=site&utm_medium=${a.dataset.wa}`);
cards(DEF);links();obs();
try{
  const {data}=await sb.from('site_content').select('key,value'),C=Object.fromEntries((data||[]).map(r=>[r.key,r.value]));
  $$('[data-k]').forEach(e=>C[e.dataset.k]!=null&&(e.innerHTML=fmt(C[e.dataset.k])));
  $$('[data-m]').forEach(e=>{const u=C[e.dataset.m];if(u){e.src=u;e.removeAttribute('poster');e.load&&e.load()}});
  wa=C.wa||wa;msg=C.msg||msg;links();
  try{C.logo?localStorage.setItem('lg',C.logo):localStorage.removeItem('lg')}catch(e){}
  const {data:T}=await sb.from('treatments').select('*').order('pos');
  T&&T.length&&cards(T);
}catch(e){console.warn(e)}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-wa]');if(!a)return;
  sb.from('clicks').insert({source:a.dataset.wa}).then(()=>{});
  (window.dataLayer=window.dataLayer||[]).push({event:'whatsapp_click',source:a.dataset.wa});
  try{fbq('track','Contact')}catch(x){}
});
const hd=$('#hd');addEventListener('scroll',()=>hd.classList.toggle('s',scrollY>40),{passive:true});
const ph=$('#ph');addEventListener('mousemove',e=>{if(innerWidth>820)ph.style.transform=`translate(${(e.clientX/innerWidth-.5)*-14}px,${(e.clientY/innerHeight-.5)*-14}px)`});
$$('video').forEach(v=>v.addEventListener('play',()=>$$('video').forEach(o=>o!==v&&o.pause())));
