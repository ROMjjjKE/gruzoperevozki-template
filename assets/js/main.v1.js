
(function(){
  'use strict';
  var WA='https://wa.me/375000000000';
  var burger=document.getElementById('burger'), drawer=document.getElementById('drawer'),
      closeBtn=document.getElementById('drawerClose'), lastFocus=null;
  function openDrawer(){ if(!drawer) return; lastFocus=document.activeElement; drawer.hidden=false;
    document.body.classList.add('is-locked'); if(burger) burger.setAttribute('aria-expanded','true'); if(closeBtn) closeBtn.focus(); }
  function closeDrawer(){ if(!drawer||drawer.hidden) return; drawer.hidden=true;
    document.body.classList.remove('is-locked'); if(burger) burger.setAttribute('aria-expanded','false'); if(lastFocus) lastFocus.focus(); }
  if(burger) burger.addEventListener('click',openDrawer);
  if(closeBtn) closeBtn.addEventListener('click',closeDrawer);
  if(drawer) drawer.addEventListener('click',function(e){ if(e.target===drawer) closeDrawer(); });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') closeDrawer();
    if(e.key==='Tab' && drawer && !drawer.hidden){
      var f=drawer.querySelectorAll('a,button'); if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize',function(){ if(window.innerWidth>1049) closeDrawer(); });

  var pick=document.getElementById('pick');
  if(pick){
    var cargos=[];
    try{ cargos=JSON.parse(document.getElementById('cargoData').textContent); }catch(e){}
    var cur=cargos.length?cargos[0][0]:'';
    var oV=document.getElementById('pkOut'), oS=document.getElementById('pkSpecs'), oW=document.getElementById('pkWhy'),
        oC=document.getElementById('pkCta');
    function paintPick(){
      var c=cargos.filter(function(x){ return x[0]===cur; })[0]; if(!c) return;
      oV.textContent=c[2];
      oS.innerHTML='<span>до '+c[3].replace('до ','')+'</span><span>'+c[4]+'</span><span>'+c[5]+'</span>';
      oW.textContent=c[6];
      oC.href=WA+'?text='+encodeURIComponent('Здравствуйте! Груз: '+c[1].toLowerCase()+'. Подскажите стоимость и свободную машину.');
      pick.querySelectorAll('.pick__list button').forEach(function(b){
        b.setAttribute('aria-pressed', b.getAttribute('data-c')===cur?'true':'false');
      });
    }
    pick.querySelectorAll('.pick__list button').forEach(function(b){
      b.addEventListener('click',function(){ cur=b.getAttribute('data-c'); paintPick(); });
    });
    paintPick();
  }

  var calc=document.getElementById('calc');
  if(calc){
    var data={rates:[],extra:[],dist:[]};
    try{ data=JSON.parse(document.getElementById('calcData').textContent); }catch(e){}
    var dir=document.getElementById('c-dir'), kmIn=document.getElementById('c-km'), veh=document.getElementById('c-veh'),
        wIn=document.getElementById('c-w'), back=document.getElementById('c-back'),
        sum=document.getElementById('c-sum'), meta=document.getElementById('c-meta'), rows=document.getElementById('c-rows'),
        warn=document.getElementById('c-warn'), cta=document.getElementById('c-cta');
    var dirMap={'mow':720,'vil':190,'war':550,'kiev':520,'gom':300,'bre':350,'vit':280};
    function money(v){ return Math.round(v/5)*5; }
    function run(){
      var km=parseFloat(kmIn.value)||0;
      if(!km) km=dirMap[dir.value]||300;
      var r=data.rates.filter(function(x){ return x[0]===veh.value; })[0]||data.rates[0];
      var rate=r[2], cap=r[3], name=r[1];
      var weight=parseFloat(wIn.value)||0;
      var base=km*rate;
      var extras=0, list=[];
      calc.querySelectorAll('input[name=ex]').forEach(function(cb){
        if(cb.checked){
          var e=data.extra.filter(function(x){ return x[0]===cb.value; })[0];
          if(e){ extras+=e[2]; list.push([e[1], e[2]]); }
        }
      });
      var disc=back.checked?0.15:0;
      var total=(base+extras)*(1-disc);
      var lo=money(total*0.92), hi=money(total*1.12);
      var hours=km/65+(extras>0?1:0), days=Math.max(1, Math.ceil(hours/10));
      sum.textContent=lo+'–'+hi+' BYN';
      meta.textContent=km+' км · '+name+' · '+(disc?'попутный груз, −15%':'выделенный рейс');
      var rw=[['Пробег '+km+' км × '+rate.toFixed(2)+' BYN', money(base)]];
      list.forEach(function(it){ rw.push([it[0], it[1]]); });
      if(disc) rw.push(['Скидка за попутный груз, −15%', -money((base+extras)*disc)]);
      rw.push(['Срок в пути', '~'+Math.round(hours)+' ч, доставка в течение '+days+' сут.']);
      rows.innerHTML=rw.map(function(it){ return '<div><span>'+it[0]+'</span><span>'+it[1]+'</span></div>'; }).join('');
      var bad='';
      if(weight>cap) bad='Вес '+weight+' кг выше лимита «'+name+'» ('+cap+' кг). Нужен другой класс машины — уточните расчёт.';
      warn.hidden=!bad; warn.textContent=bad;
      cta.href=WA+'?text='+encodeURIComponent('Здравствуйте! Нужен рейс: '+km+' км, '+name+', вес '+(weight||'уточню')+' кг. Подскажите стоимость.');
    }
    [dir,kmIn,veh,wIn,back].forEach(function(el){ if(el){ el.addEventListener('input',run); el.addEventListener('change',run); } });
    calc.querySelectorAll('input[name=ex]').forEach(function(cb){ cb.addEventListener('change',run); });
    run();
  }

  var form=document.getElementById('leadForm'), msg=document.getElementById('formMsg');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var d=new FormData(form), name=(d.get('name')||'').toString().trim(), phone=(d.get('phone')||'').toString().trim();
      if(name.length<2||phone.length<6){ msg.textContent='Нужны имя и телефон, иначе не перезвонить.'; return; }
      var lines=['Заявка с сайта: '+document.title,'Имя: '+name,'Телефон: '+phone,
                 'Маршрут: '+((d.get('route')||'').toString().trim()||'уточню'),
                 'Груз: '+((d.get('cargo')||'').toString())];
      var m=(d.get('msg')||'').toString().trim(); if(m) lines.push('Детали: '+m);
      msg.textContent='Открываю WhatsApp с готовым сообщением.';
      window.open(WA+'?text='+encodeURIComponent(lines.join('\n')),'_blank');
    });
  }
})();
