(function(){var d=document,t0=performance.now();
try{var l=localStorage.getItem('lg');if(l&&/^https:\/\/[^'")\s]+$/.test(l))d.documentElement.style.setProperty('--logo','url('+l+')')}catch(e){}
var done=function(){setTimeout(function(){var p=d.getElementById('pre');p&&p.classList.add('out');d.body.classList.add('go');setTimeout(function(){d.querySelectorAll('.hero .rv,.hero .sp,.hero .pop').forEach(function(e){e.classList.add('on')})},80)},Math.max(0,2700-(performance.now()-t0)))};
d.readyState=='complete'?done():addEventListener('load',done);setTimeout(done,6000);
d.addEventListener('DOMContentLoaded',function(){var S='.rv:not(.on),.sp:not(.on),.pop:not(.on)',io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting&&(d.body.classList.contains('go')||!x.target.closest('.hero'))){x.target.classList.add('on');io.unobserve(x.target)}})},{threshold:.15});window.__obs=function(){d.querySelectorAll(S).forEach(function(e){io.observe(e)})};__obs()})})();
