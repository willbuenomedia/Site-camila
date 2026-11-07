(function(){var d=document,t0=performance.now();
try{var l=localStorage.getItem('lg');if(l&&/^https:\/\/[^'")\s]+$/.test(l))d.documentElement.style.setProperty('--logo','url('+l+')')}catch(e){}
var done=function(){setTimeout(function(){var p=d.getElementById('pre');p&&p.classList.add('out');d.body.classList.add('go')},Math.max(0,2700-(performance.now()-t0)))};
d.readyState=='complete'?done():addEventListener('load',done);setTimeout(done,6000);
d.addEventListener('DOMContentLoaded',function(){var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}})},{threshold:.12});window.__obs=function(){d.querySelectorAll('.rv:not(.on)').forEach(function(e){io.observe(e)})};__obs()})})();
