(function(){
  var d=document, root=d.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(function(){ d.body.classList.add('loaded'); });

  /* thumb bar after hero CTA leaves view */
  var thumb=d.querySelector('.thumb'), heroCta=d.querySelector('.hero .cta-row');
  if('IntersectionObserver' in window && thumb && heroCta){
    new IntersectionObserver(function(e){
      var past=!e[0].isIntersecting && e[0].boundingClientRect.top<0;
      thumb.classList.toggle('show',past);
    }).observe(heroCta);
  } else if(thumb){ thumb.classList.add('show'); }

  /* rolling tire */
  var tire=d.querySelector('.tire-svg'), ticking=false;
  function roll(){ ticking=false; if(tire) tire.style.setProperty('--rot',(window.scrollY*0.25)+'deg'); }
  if(!reduce){ window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(roll);} },{passive:true}); }

  /* sidewall decoder */
  var info={
    w:'225 is the tread width in millimeters, measured sidewall to sidewall.',
    a:'65 is the profile: the sidewall is 65% as tall as the tire is wide. Lower numbers mean a shorter, sportier sidewall.',
    c:'R means radial construction, which is how nearly every passenger tire is built today.',
    r:'17 is the wheel (rim) diameter in inches. Your new tires must match it.',
    l:'98 is the load index: each tire can carry up to 1,653 lb.',
    s:'H is the speed rating: rated for sustained speeds up to 130 mph.'
  };
  var parts=d.querySelectorAll('.part'), spans=d.querySelectorAll('.sw-text tspan'), out=d.getElementById('part-text');
  function pick(k){
    parts.forEach(function(p){ var on=p.dataset.k===k; p.setAttribute('aria-selected',on); p.tabIndex=on?0:-1; });
    spans.forEach(function(s){ s.classList.toggle('on',s.dataset.k===k); });
    out.textContent=info[k];
  }
  parts.forEach(function(p,i){
    p.addEventListener('click',function(){ pick(p.dataset.k); });
    p.addEventListener('keydown',function(e){
      var n=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0; if(!n) return;
      e.preventDefault(); var t=parts[(i+n+parts.length)%parts.length]; t.focus(); pick(t.dataset.k);
    });
  });
  pick('w');

  /* size builder */
  var sw=d.getElementById('sel-w'), sa=d.getElementById('sel-a'), sr=d.getElementById('sel-r');
  function fill(sel,from,to,step,def){ for(var v=from; v<=to; v+=step){ var o=d.createElement('option'); o.value=o.textContent=v; if(v===def) o.selected=true; sel.appendChild(o);} }
  fill(sw,155,335,10,225); fill(sa,30,80,5,65); fill(sr,13,24,1,17);
  var so=d.getElementById('size-out'), call=d.getElementById('size-call'), copy=d.getElementById('size-copy');
  function size(){ return sw.value+'/'+sa.value+'R'+sr.value; }
  function upd(){
    var s=size(); so.textContent=s; call.querySelector('span').textContent='Call for '+s+' prices';
    call.setAttribute('aria-label','Call Golden State Tires for '+s+' tire prices');
    so.classList.remove('bump'); void so.offsetWidth; so.classList.add('bump');
  }
  [sw,sa,sr].forEach(function(s){ s.addEventListener('change',upd); });
  copy.addEventListener('click',function(){
    var s=size(), lbl=copy.querySelector('span');
    function done(){ lbl.textContent='Copied '+s; setTimeout(function(){ lbl.textContent='Copy my size'; },1800); }
    if(navigator.clipboard){ navigator.clipboard.writeText(s).then(done,function(){ lbl.textContent=s; }); } else { lbl.textContent=s; }
  });

  /* ticket lines reveal (observe the ticket, not clipped children) */
  var ticket=d.querySelector('.ticket');
  if(ticket){
    ticket.querySelectorAll('.lines li').forEach(function(li,i){ li.style.transitionDelay=(i*70)+'ms'; });
    if('IntersectionObserver' in window && !reduce){
      var io=new IntersectionObserver(function(e){ if(e[0].isIntersecting){ ticket.classList.add('in'); io.disconnect(); } },{threshold:.2});
      io.observe(ticket);
    } else ticket.classList.add('in');
  }

  /* rail progress */
  var rail=d.querySelector('.rail'), cnt=d.querySelector('.rail-count b'), bar=d.querySelector('.rail-bar i');
  if(rail && cnt){
    var cards=rail.querySelectorAll('.card');
    rail.addEventListener('scroll',function(){
      var max=rail.scrollWidth-rail.clientWidth, p=max>0?rail.scrollLeft/max:0;
      var idx=Math.min(cards.length,Math.round(p*(cards.length-1))+1);
      cnt.textContent=(idx<10?'0':'')+idx; bar.style.width=(14+p*86)+'%';
    },{passive:true});
  }

  /* today + open status, shop time */
  try{
    var f=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
    var g={}; f.forEach(function(x){ g[x.type]=x.value; });
    var day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g.weekday), mins=(parseInt(g.hour,10)%24)*60+parseInt(g.minute,10);
    var row=d.querySelector('.hours tr[data-d="'+day+'"]'); if(row) row.classList.add('today');
    var st=d.getElementById('status'), msg;
    if(day===0) msg='Sunday hours <b>vary by listing</b>. Call before you drive over.';
    else if(mins>=540 && mins<1050) msg='<b>Open now</b>, until 5:30 PM.';
    else if(mins<540) msg='<b>Closed now</b>. Opens at 9 AM today.';
    else msg='<b>Closed now</b>. '+(day===6?'Sunday hours vary, call ahead.':'Opens at 9 AM tomorrow.');
    st.innerHTML=msg;
  }catch(e){}
})();
