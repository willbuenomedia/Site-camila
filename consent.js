// Cookies (LGPD): os rastreadores só carregam depois de "Aceitar".
(function(){var d=document,K='ck_v1',ids={px:'',ga:''},loaded=false;
function get(){try{return localStorage.getItem(K)}catch(e){return null}}
function set(v){try{localStorage.setItem(K,v)}catch(e){}}
function load(){if(loaded||get()!=='yes')return;
  if(/^\d{8,20}$/.test(ids.px)){loaded=true;!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,d,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',ids.px);fbq('track','PageView')}
  if(/^G-[A-Z0-9]{6,14}$/.test(ids.ga)){loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',ids.ga);var s=d.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ids.ga;d.head.appendChild(s)}}
function bar(){var o=d.getElementById('ck');o&&o.remove()}
function ask(){bar();var b=d.createElement('div');b.id='ck';b.setAttribute('role','dialog');b.setAttribute('aria-label','Cookies');
  b.innerHTML='<p>Usamos cookies para medir o desempenho do site e dos anúncios. Você escolhe. Saiba mais na <a href="privacidade.html">política de privacidade</a>.</p><div><button class="ok" type="button">Aceitar</button><button class="no" type="button">Recusar</button></div>';
  b.querySelector('.ok').onclick=function(){set('yes');bar();load()};b.querySelector('.no').onclick=function(){set('no');bar()};d.body.appendChild(b)}
d.addEventListener('cm:content',function(){ids=window.CM_IDS||ids;load()});
d.addEventListener('DOMContentLoaded',function(){if(!get())setTimeout(ask,3200);var p=d.getElementById('ck-p');p&&p.addEventListener('click',ask)});
})();
