// Efeitos: palavras que surgem com desfoque e acordeão.
(function(){var d=document;
function split(el){if(el.querySelector('.wd'))return;var i=0;(function walk(n){[].slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType==3){var f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(t){if(!t)return;if(/^\s+$/.test(t))f.append(t);else{var s=d.createElement('span');s.className='wd';s.style.setProperty('--i',i++);s.textContent=t;f.append(s)}});c.replaceWith(f)}
  else if(c.nodeType==1)walk(c)})})(el)}
function run(){d.querySelectorAll('.sp').forEach(split);if(matchMedia('(max-width:900px)').matches)d.querySelectorAll('.hist .rv,.hist .pop').forEach(function(e){e.classList.add('on')});window.__obs&&window.__obs()}
d.addEventListener('DOMContentLoaded',run);d.addEventListener('cm:content',run);
d.addEventListener('click',function(e){var a=e.target.closest('.ai');if(!a)return;var on=a.classList.contains('on');d.querySelectorAll('.ai').forEach(function(x){x.classList.remove('on')});if(!on)a.classList.add('on')});
})();

(function(){var d=document;
d.querySelectorAll('.vf').forEach(function(f){var v=f.querySelector('video'),b=f.querySelector('.pl');if(!v||!b)return;
  b.addEventListener('click',function(){v.controls=true;var p=v.play&&v.play();p&&p.catch&&p.catch(function(){})});
  v.addEventListener('play',function(){f.classList.add('pg')});
  v.addEventListener('pause',function(){if(!v.seeking)f.classList.remove('pg')});
  v.addEventListener('ended',function(){f.classList.remove('pg')})});
var hub=d.getElementById('hub');if(hub){var hb=hub.querySelector('.hb');
  var set=function(o){hub.classList.toggle('on',o);hb.setAttribute('aria-expanded',o?'true':'false')};
  hb.addEventListener('click',function(){set(!hub.classList.contains('on'))});
  d.addEventListener('click',function(e){if(!hub.contains(e.target))set(false);else if(e.target.closest('.ho'))set(false)});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)})}
})();

(function(){var d=document,rm=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
// faixa em movimento: duplica o texto para o laço ficar contínuo
function mq(){var t=d.getElementById('mt');if(!t)return;var a=t.querySelector('[data-k]');if(!a)return;[].slice.call(t.querySelectorAll('.cl')).forEach(function(x){x.remove()});
  var txt=a.textContent;if(txt.slice(-2)!=='· ')a.textContent=txt.replace(/\s*·?\s*$/,' · ');
  for(var i=0;i<3;i++){var c=a.cloneNode(true);c.removeAttribute('data-k');c.removeAttribute('data-l');c.removeAttribute('data-g');c.className='cl';t.appendChild(c)}
  t.style.animationDuration=Math.max(24,t.scrollWidth/60)+'s'}
d.addEventListener('DOMContentLoaded',mq);d.addEventListener('cm:content',mq);
if(rm)return;
// barra de progresso
var bar=d.createElement('div');bar.id='pg';d.body.appendChild(bar);
var hp=d.querySelector('.hero .pop,.hero .hphoto,.hero img[data-m="portrait"]'),tk=0;hp=hp&&(hp.closest('.pop')||hp);
function sc(){tk=0;var h=d.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';
  if(hp&&scrollY<innerHeight*1.2){var im=hp.querySelector('img');if(im)im.style.transform='translate3d(0,'+(scrollY*.06).toFixed(1)+'px,0) scale(1.05)'}}
addEventListener('scroll',function(){tk||(tk=requestAnimationFrame(sc))},{passive:true});sc();
if(!fine)return;
// brilho que segue o mouse
var cu=d.createElement('div');cu.className='cur';d.body.appendChild(cu);var cx=0,cy=0,tx=0,ty=0,raf=0;
function lp(){cx+=(tx-cx)*.12;cy+=(ty-cy)*.12;cu.style.transform='translate3d('+cx+'px,'+cy+'px,0)';raf=Math.abs(tx-cx)+Math.abs(ty-cy)>.5?requestAnimationFrame(lp):0}
addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;cu.classList.add('on');raf||(raf=requestAnimationFrame(lp))},{passive:true});
d.addEventListener('mouseleave',function(){cu.classList.remove('on')});
// botões magnéticos
d.addEventListener('mousemove',function(e){var b=e.target.closest&&e.target.closest('.btn');d.querySelectorAll('.btn.mg').forEach(function(x){if(x!==b){x.classList.remove('mg');x.style.transform=''}});
  if(!b)return;var r=b.getBoundingClientRect();b.classList.add('mg');b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.28-2).toFixed(1)+'px)'},{passive:true});
// inclinação 3D nos cartões e vídeos
function tilt(e){var c=e.target.closest&&e.target.closest('.card,.vf');var o=d.querySelector('.tilt.hot');if(o&&o!==c){o.classList.remove('hot');o.style.transform=''}
  if(!c)return;c.classList.add('tilt','hot');var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  c.style.transform='perspective(900px) rotateX('+(-y*7).toFixed(2)+'deg) rotateY('+(x*9).toFixed(2)+'deg) translateY(-6px)'}
d.addEventListener('mousemove',tilt,{passive:true});
})();
