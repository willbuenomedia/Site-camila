// Efeitos: palavras que surgem com desfoque e acordeão.
(function(){var d=document;
function split(el){if(el.querySelector('.wd'))return;var i=0;(function walk(n){[].slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType==3){var f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(t){if(!t)return;if(/^\s+$/.test(t))f.append(t);else{var s=d.createElement('span');s.className='wd';s.style.setProperty('--i',i++);s.textContent=t;f.append(s)}});c.replaceWith(f)}
  else if(c.nodeType==1)walk(c)})})(el)}
function run(){d.querySelectorAll('.sp').forEach(split);if(matchMedia('(max-width:900px)').matches)d.querySelectorAll('.hist .rv,.hist .pop').forEach(function(e){e.classList.add('on')});window.__obs&&window.__obs()}
d.addEventListener('DOMContentLoaded',run);d.addEventListener('cm:content',run);
d.addEventListener('click',function(e){var a=e.target.closest('.ai');if(!a)return;var on=a.classList.contains('on');d.querySelectorAll('.ai').forEach(function(x){x.classList.remove('on')});if(!on)a.classList.add('on')});
})();
