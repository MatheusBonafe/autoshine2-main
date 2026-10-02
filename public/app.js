const {useState,useMemo,useEffect}=React;const html=htm.bind(React.createElement);
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const key=d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
const getTheme=()=>{try{return localStorage.getItem('as_theme')||'dark'}catch(e){return'dark'}};
const applyTheme=t=>{document.documentElement.classList.toggle('light',t==='light');try{localStorage.setItem('as_theme',t)}catch(e){}};
const fdt=ts=>new Date(ts).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
/* persistência resiliente */
const api=async(p,m='GET',b)=>{const r=await fetch('/api'+p,{method:m,credentials:'same-origin',headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Erro '+r.status);return j};
const Ic=({d,s=22})=>html`<svg width=${s} height=${s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d=${d}/></svg>`;
const I={dash:"M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z",car:"M5 17H3v-4l2-6h14l2 6v4h-2 M5 17a2 2 0 1 0 4 0 M15 17a2 2 0 1 0 4 0 M9 17h6 M3 13h18",users:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",wallet:"M20 7H5a2 2 0 0 1 0-4h13v4 M3 5v14a2 2 0 0 0 2 2h15v-4 M18 12h4v4h-4a2 2 0 0 1 0-4z",print:"M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z",plus:"M12 5v14M5 12h14",menu:"M4 6h16M4 12h16M4 18h16",x:"M18 6 6 18M6 6l12 12",sun:"M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4",moon:"M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",sl:"M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",box:"M21 8 12 3 3 8v8l9 5 9-5z M3 8l9 5 9-5 M12 13v8"};

/* ---------- dados mock ---------- */
let SERV=[],PH={};const ph=(k,d)=>PH[k]||d;
const CATS={Hatch:1,Sedan:1.15,SUV:1.35,Picape:1.4,Moto:.6};const PAY=['Dinheiro','PIX','Crédito','Débito'];const STAT=['Aguardando','Em Execução','Pronto','Entregue'];
const SCOL={'Aguardando':'bg-amber-400/15 text-amber-300','Em Execução':'bg-sky-400/15 text-sky-300','Pronto':'bg-emerald-400/15 text-emerald-300','Entregue':'bg-slate-700 text-slate-300'};
const SBORD={'Aguardando':'border-l-amber-400','Em Execução':'border-l-sky-400','Pronto':'border-l-emerald-400','Entregue':'border-l-slate-500'};const SLA=40; // minutos até o alerta de atraso
const WASH=[{n:'João',r:.10},{n:'Pedro',r:.12},{n:'Marcos',r:.15}];
const USO={ls:{sh:.1,mf:.5},lc:{sh:.2,mf:1},hi:{sh:.1,mf:2},hc:{mf:1},po:{ce:.3,mf:2},vi:{vi:.5,mf:2}};
const price=(s,c)=>Math.round(s.p*CATS[c]);const recalc=(sel,c)=>Object.fromEntries(Object.keys(sel).map(id=>[id,price(SERV.find(s=>s.id===id),c)]));
const sumBy=os=>{const b={Dinheiro:0,PIX:0,Crédito:0,Débito:0};os.forEach(o=>b[o.pay]+=o.total);return b};

/* ---------- UI ---------- */
const inp='w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-base focus:outline-none focus:border-cyan-400';
const card='bg-slate-900 border border-slate-800 rounded-2xl p-5';
const Kpi=({l,v,s,c='text-cyan-400'})=>html`<div className=${card}><div className="text-xs uppercase tracking-wider text-slate-400">${l}</div><div className=${'text-2xl font-bold mt-1 '+c}>${v}</div><div className="text-xs text-slate-500 mt-1">${s}</div></div>`;
const Bars=({items,fmt=x=>x,color='bg-cyan-400'})=>{const mx=Math.max(1,...items.map(i=>i.v));return html`<div className="flex items-end gap-1 h-40">${items.map(i=>html`<div key=${i.l} title=${i.l+': '+fmt(i.v)} className="flex-1 h-full flex flex-col justify-end items-center"><div className=${'w-full rounded-t '+color} style=${{height:(i.v/mx*100)+'%',minHeight:2}}></div><div className="text-[10px] text-slate-500 mt-1">${i.l}</div></div>`)}</div>`};
const HBars=({items})=>{const mx=Math.max(1,...items.map(i=>i.v));return html`<div className="space-y-3">${items.map(i=>html`<div key=${i.l}><div className="flex justify-between text-sm mb-1"><span>${i.l}</span><span className="text-slate-400">${i.v}</span></div><div className="h-2 bg-slate-800 rounded"><div className="h-2 rounded bg-gradient-to-r from-cyan-400 to-amber-300" style=${{width:(i.v/mx*100)+'%'}}></div></div></div>`)}</div>`};
const seg=(opts,val,on)=>html`<div className="flex flex-wrap gap-2">${opts.map(o=>html`<button type="button" key=${o} onClick=${()=>on(o)} className=${'rounded-xl px-4 py-3 font-semibold '+(val===o?'bg-cyan-400 text-slate-950':'bg-slate-800 hover:bg-slate-700')}>${o}</button>`)}</div>`;

function Dash({orders}){
  const now=new Date(),sum=a=>a.reduce((s,o)=>s+o.total,0);
  const d=useMemo(()=>{const today=orders.filter(o=>key(new Date(o.ts))===key(now)),wk=orders.filter(o=>now-o.ts<7*864e5),mo=orders.filter(o=>{const x=new Date(o.ts);return x.getMonth()===now.getMonth()&&x.getFullYear()===now.getFullYear()});
    const daily=[...Array(14)].map((_,i)=>{const x=new Date(now-(13-i)*864e5);return{l:String(x.getDate()),v:sum(orders.filter(o=>key(new Date(o.ts))===key(x)))}});
    const sv={};orders.forEach(o=>o.svc.forEach(s=>sv[s.n]=(sv[s.n]||0)+1));
    const wd=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((l,i)=>({l,v:orders.filter(o=>new Date(o.ts).getDay()===i).length}));
    const hr=[...Array(11)].map((_,i)=>({l:(i+8)+'h',v:orders.filter(o=>new Date(o.ts).getHours()===i+8).length}));
    const wkc=[3,2,1,0].map(i=>({l:i?'S-'+i:'Atual',v:sum(orders.filter(o=>{const a=now-o.ts;return a>=i*7*864e5&&a<(i+1)*7*864e5}))}));
    const com=WASH.map(w=>{const os=mo.filter(o=>o.wash===w.n&&(o.status==='Pronto'||o.status==='Entregue')),b=sum(os);return{...w,qt:os.length,b,c:b*w.r}});
    return{wkc,today,wk,mo,daily,com,sv:Object.entries(sv).map(([l,v])=>({l,v})).sort((a,b)=>b.v-a.v),wd,hr}},[orders]);
  const peak=[...d.hr].sort((a,b)=>b.v-a.v)[0],occ=Math.round(d.today.length/16*100);
  return html`<div className="space-y-6">
  <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
    <${Kpi} l="Faturamento diário" v=${brl(sum(d.today))} s=${'Semana '+brl(sum(d.wk))} />
    <${Kpi} l="Faturamento mensal" v=${brl(sum(d.mo))} s=${d.mo.length+' atendimentos'} c="text-emerald-300"/>
    <${Kpi} l="Ticket médio (mês)" v=${brl(sum(d.mo)/Math.max(1,d.mo.length))} s=${'Hoje: '+brl(sum(d.today)/Math.max(1,d.today.length))} c="text-amber-300"/>
    <${Kpi} l="Lavagens realizadas" v=${d.today.length} s=${'Hoje · '+d.mo.length+' no mês'} />
    <${Kpi} l="Ocupação hoje" v=${occ+'%'} s=${'Pico: '+peak.l+' (cap. 16/dia)'} c="text-amber-300"/>
  </div>
  <div className="grid lg:grid-cols-3 gap-4"><div className=${card+' lg:col-span-2'}><h3 className="font-semibold mb-4">Faturamento diário · últimos 14 dias</h3><${Bars} items=${d.daily} fmt=${brl} /></div><div className=${card}><h3 className="font-semibold mb-4">Comparativo semanal</h3><${Bars} items=${d.wkc} fmt=${brl} color="bg-amber-300"/></div></div>
  <div className=${card}><h3 className="font-semibold mb-1">Comissões do mês por executor</h3><div className="text-xs text-slate-500 mb-3">Considera serviços com status Pronto ou Entregue.</div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-xs uppercase text-slate-400"><tr><th className="py-2">Executor</th><th className="text-right">Atend.</th><th className="text-right">Serviços</th><th className="text-right">Taxa</th><th className="text-right">Comissão</th></tr></thead><tbody>${d.com.map(w=>html`<tr key=${w.n} className="border-t border-slate-800"><td className="py-3 font-medium">${w.n}</td><td className="text-right">${w.qt}</td><td className="text-right">${brl(w.b)}</td><td className="text-right text-slate-400">${Math.round(w.r*100)}%</td><td className="text-right font-semibold text-amber-300">${brl(w.c)}</td></tr>`)}<tr className="border-t border-slate-700 font-bold"><td className="py-3" colSpan="4">Total</td><td className="text-right text-emerald-300">${brl(d.com.reduce((a,w)=>a+w.c,0))}</td></tr></tbody></table></div></div>
  <div className="grid lg:grid-cols-2 gap-4">
    <div className=${card}><h3 className="font-semibold mb-4">Serviços mais vendidos</h3><${HBars} items=${d.sv} /></div>
    <div className=${card}><h3 className="font-semibold mb-4">Movimento por dia da semana</h3><${Bars} items=${d.wd} color="bg-amber-300"/><h3 className="font-semibold mt-6 mb-4">Horários de pico</h3><${Bars} items=${d.hr} /></div>
  </div></div>`}

function Receipt({r,w}){
  const L=(a,b,k)=>html`<div key=${k} className="flex justify-between gap-2"><span>${a}</span><span className="whitespace-nowrap">${b}</span></div>`;
  const hr=html`<div className="my-1 overflow-hidden whitespace-nowrap">${'-'.repeat(42)}</div>`;
  const head=html`<div className="text-center"><div className="font-bold text-base">AUTOSHINE</div><div>Estética Automotiva</div><div>Av. das Palmeiras, 1200 - Centro</div><div>CNPJ 12.345.678/0001-90</div><div>Tel (11) 4002-8922</div></div>`;
  let body;
  if(r.type==='os'){const o=r.o;body=html`<div className="font-bold text-center">TICKET Nº ${o.id}</div><div className="text-center">${fdt(o.ts)}</div>${hr}
    <div>Cliente: ${o.name}</div><div>Tel: ${o.phone||'-'}</div><div>Veículo: ${o.model} ${o.color&&'· '+o.color}</div><div>Placa: ${o.plate} (${o.cat})</div>${o.wash&&html`<div>Executor: ${o.wash}</div>`}${hr}
    ${o.svc.map((s,i)=>L(s.n,brl(s.p),i))}${hr}<div className="font-bold text-base">${L('TOTAL',brl(o.total))}</div><div>Pagamento: ${o.pay}</div><div>Status: ${o.status}</div>${hr}
    ${o.obs&&html`<div className="font-bold">Vistoria / Avarias:</div><div className="whitespace-pre-wrap break-words">${o.obs}</div>${hr}`}
    <div className="text-center text-[11px]">Retire o veículo apresentando este ticket.<br/>Não nos responsabilizamos por objetos deixados no interior.<br/>Garantia de 7 dias para lavagens.<br/>Obrigado pela preferência!</div>`}
  else{const c=r.c;body=html`<div className="font-bold text-center">FECHAMENTO DE CAIXA Nº ${c.id}</div><div className="text-center">${fdt(c.ts)}</div>${hr}
    <div>Atendimentos: ${c.n}</div>${PAY.map(p=>L(p,brl(c.by[p]),p))}${hr}<div className="font-bold text-base">${L('TOTAL',brl(c.total))}</div>${hr}
    ${L('Fundo de troco',brl(c.fund))}${L('Dinheiro esperado',brl(c.fund+c.by.Dinheiro))}${L('Dinheiro contado',brl(c.counted))}${L('Divergência',brl(c.diff))}${L('Sangria',brl(c.sangria))}${hr}<div className="text-center mt-6">_____________________<br/>Operador</div>`}
  return html`<div className="print-area bg-white text-black font-mono leading-snug shadow-xl mx-auto" style=${{width:w==='58mm'?'219px':'302px',padding:8,fontSize:11,boxSizing:'border-box'}}><style>${'@media print{@page{size:'+w+' auto;margin:0}}'}</style>${head}${hr}${body}${hr}<div className="flex flex-col items-center"><${QR} seed=${r.type==='os'?r.o.id:r.c.id}/><div className="text-[10px] mt-1">QR de consulta / PIX (simulado)</div></div>${hr}<div className="text-center text-[10px]">${w} · AutoShine</div></div>`}

function Ops({orders,clients,reload,setRc,brands,colors,canPrice}){
  const empty={name:'',phone:'',model:'',plate:'',color:'',brand:'',cat:'Hatch',sel:{},pay:'PIX',status:'Aguardando',cid:null,obs:'',wash:WASH[0].n};
  const [f,setF]=useState(empty),[q,setQ]=useState(''),[err,setErr]=useState(''),[vw,setVw]=useState('Lista');
  const up=o=>setF(x=>({...x,...o}));
  const tog=s=>setF(x=>{const sel={...x.sel};if(sel[s.id]!=null)delete sel[s.id];else sel[s.id]=price(s,x.cat);return{...x,sel}});
  const total=Object.values(f.sel).reduce((a,b)=>a+b,0);
  const veh=useMemo(()=>{const m={};orders.forEach(o=>m[o.plate]={cid:o.cid,model:o.model,color:o.color,cat:o.cat,plate:o.plate});return Object.values(m).map(v=>({...v,c:clients.find(c=>c.id===v.cid)})).filter(v=>v.c)},[orders,clients]);
  const res=q.length>=2?veh.filter(v=>v.plate.toLowerCase().includes(q.toLowerCase())||v.c.name.toLowerCase().includes(q.toLowerCase())).slice(0,5):[];
  const choose=v=>{setF(x=>({...x,cid:v.cid,name:v.c.name,phone:v.c.phone,model:v.model,plate:v.plate,color:v.color,cat:v.cat,sel:recalc(x.sel,v.cat)}));setQ('')};
  const setSt=async(id,s)=>{try{await api('/orders/'+id,'PATCH',{status:s});await reload()}catch(e){setErr(e.message)}};
  const submit=async()=>{
    if(!f.name.trim()||!f.model.trim()||!f.plate.trim()||!total){setErr('Informe nome, modelo, placa e ao menos um serviço.');return}
    if(!/^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(f.plate)){setErr('Placa inválida. Use o formato ABC1D23 ou ABC1234.');return}
    try{const o=await api('/orders','POST',{cid:f.cid,name:f.name.trim(),phone:f.phone,model:f.model,plate:f.plate,color:f.color,brand:f.brand,cat:f.cat,svc:Object.entries(f.sel).map(([id,p])=>({id,p})),pay:f.pay,status:f.status,obs:f.obs,wash:f.wash});await reload();setF(empty);setErr('');setRc({type:'os',o})}catch(e){setErr(e.message)}};
  const today=orders.filter(o=>key(new Date(o.ts))===key(new Date())).sort((a,b)=>b.ts-a.ts);
  const [now,setNow]=useState(Date.now()),[dragId,setDragId]=useState(null),[over,setOver]=useState(null);
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(t)},[]);
  const toggle=html`<div className="flex gap-2 mb-4">${seg(['Lista','Kanban'],vw,setVw)}</div>`;
  if(vw==='Kanban')return html`<div>${toggle}<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">${STAT.map(s=>{const col=today.filter(o=>o.status===s),sum=col.reduce((a,o)=>a+o.total,0);return html`<div key=${s} data-status=${s} onDragOver=${e=>{e.preventDefault();setOver(s)}} onDragLeave=${()=>setOver(x=>x===s?null:x)} onDrop=${e=>{e.preventDefault();const id=+e.dataTransfer.getData('text/plain'),x=today.find(v=>v.id===id);setOver(null);setDragId(null);if(x&&!x.closed&&x.status!==s)setSt(id,s)}} className=${'rounded-2xl bg-slate-950/70 border p-3 transition '+(over===s?'border-cyan-400 ring-2 ring-cyan-400/40':'border-slate-800')}><div className=${'rounded-lg px-3 py-2 mb-3 font-semibold '+SCOL[s]}>${s} (${col.length}) • ${brl(sum)}</div><div className="space-y-2 min-h-[3rem]">${col.length===0&&html`<div className="text-xs text-slate-600 text-center py-4">Nenhum veículo</div>`}${col.map(o=>{const mins=Math.max(0,Math.floor((now-o.ts)/60000)),act=o.status==='Aguardando'||o.status==='Em Execução',late=act&&mins>SLA,warn=act&&!late&&mins>=SLA*.75,tm=mins<60?mins+' min':Math.floor(mins/60)+'h '+(mins%60)+'min';return html`<div key=${o.id} data-order-id=${o.id} draggable=${!o.closed} onDragStart=${e=>{e.dataTransfer.setData('text/plain',String(o.id));e.dataTransfer.effectAllowed='move';setDragId(o.id)}} onDragEnd=${()=>{setDragId(null);setOver(null)}} className=${'rounded-xl bg-slate-800 border-l-4 '+SBORD[s]+' p-3 shadow-md shadow-black/30 '+(o.closed?'':'cursor-grab active:cursor-grabbing ')+(dragId===o.id?'opacity-40 ':'')+(late?'ring-1 ring-red-500/60':'')}><div className="flex justify-between"><b>${o.plate}</b><b className="text-amber-300">${brl(o.total)}</b></div><div className="text-sm text-slate-300">${o.model} · ${o.name}</div><div className="flex flex-wrap items-center gap-1 mt-1"><span className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 bg-slate-700 text-slate-300">${o.cat}</span><span title=${'Meta: '+SLA+' min'} className=${'text-[11px] rounded px-1.5 py-0.5 '+(late?'bg-red-500/20 text-red-300 font-semibold':warn?'bg-amber-400/20 text-amber-300':'bg-slate-700 text-slate-300')}>⏱️ ${tm}${late?' · atraso':''}</span></div><div className="text-xs text-slate-400 mt-1">${o.svc.map(x=>x.n).join(', ')}${o.wash?' · '+o.wash:''}</div>${o.obs&&html`<div className="text-xs text-amber-200/80 mt-1">⚠ ${o.obs}</div>`}<div className="flex items-center gap-1 mt-2">${s==='Pronto'&&o.phone&&html`<a href=${waReady(o)} target="_blank" rel="noopener noreferrer" title="Avisar o cliente no WhatsApp" className="rounded-lg px-2 py-1 text-xs font-semibold bg-emerald-500 text-slate-950">WhatsApp</a>`}<button title="Imprimir ordem de serviço" onClick=${()=>setRc({type:'os',o})} className="rounded-lg px-2 py-1 bg-slate-700 hover:bg-slate-600"><${Ic} s=${14} d=${I.print}/></button></div><div className="flex flex-wrap gap-1 mt-2">${STAT.filter(x=>x!==s).map(x=>html`<button key=${x} disabled=${o.closed} onClick=${()=>setSt(o.id,x)} className=${'rounded-lg px-2 py-1 text-xs font-medium disabled:opacity-40 '+SCOL[x]}>${x}</button>`)}</div></div>`})}</div></div>`})}</div></div>`;
  return html`<div>${toggle}<div className="grid xl:grid-cols-5 gap-6">
  <div className=${card+' xl:col-span-3 space-y-4'}>
    <h3 className="text-lg font-bold">Novo atendimento</h3>
    <div className="relative"><input className=${inp} placeholder="Buscar cliente cadastrado por nome ou placa…" value=${q} onChange=${e=>setQ(e.target.value)}/>
      ${res.length>0&&html`<div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">${res.map(v=>html`<button key=${v.plate} onClick=${()=>choose(v)} className="w-full text-left px-3 py-3 hover:bg-slate-700">${v.c.name} · <span className="text-cyan-300">${v.plate}</span> · ${v.model}</button>`)}</div>`}</div>
    <div className="grid sm:grid-cols-2 gap-3"><input className=${inp} placeholder=${ph('ops.name','Nome do cliente')} value=${f.name} onChange=${e=>up({name:e.target.value,cid:null})}/><input className=${inp} placeholder=${ph('ops.phone','WhatsApp +55 (11) 99999-9999')} value=${f.phone} onChange=${e=>up({phone:e.target.value,cid:null})}/>
    <select className=${inp} value=${f.brand} onChange=${e=>up({brand:e.target.value})}><option value="">Marca…</option>${brands.map(b=>html`<option key=${b.id} value=${b.name}>${b.name}</option>`)}</select><input className=${inp} placeholder=${ph('ops.model','Modelo do veículo')} value=${f.model} onChange=${e=>up({model:e.target.value})}/><input className=${inp+' font-mono tracking-widest'} maxLength="7" placeholder=${ph('ops.plate','Placa (ABC1D23)')} value=${f.plate} onChange=${e=>up({plate:e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,7)})}/><select className=${inp} value=${f.color} onChange=${e=>up({color:e.target.value})}><option value="">Cor…</option>${colors.map(b=>html`<option key=${b.id} value=${b.name}>${b.name}</option>`)}</select></div>
    <div><div className="text-sm text-slate-400 mb-2">Categoria</div>${seg(Object.keys(CATS),f.cat,c=>setF(x=>({...x,cat:c,sel:recalc(x.sel,c)})))}</div>
    <div><div className="text-sm text-slate-400 mb-2">Serviços (preço editável)</div><div className="grid sm:grid-cols-2 gap-2">${SERV.map(s=>{const on=f.sel[s.id]!=null;return html`<div key=${s.id} className=${'flex items-center gap-2 rounded-xl border p-2 '+(on?'border-cyan-400 bg-cyan-400/10':'border-slate-700')}>
      <button type="button" onClick=${()=>tog(s)} className="flex-1 text-left px-2 py-2 font-medium">${s.n}${!on&&html`<div className="text-xs text-slate-400">${brl(price(s,f.cat))}</div>`}</button>
      ${on&&html`<input type="number" min="0" disabled=${!canPrice} title=${canPrice?'':'Somente o Gerente altera preços'} className="w-24 bg-slate-800 rounded-lg px-2 py-2 text-right disabled:opacity-60" value=${f.sel[s.id]} onChange=${e=>setF(x=>({...x,sel:{...x.sel,[s.id]:+e.target.value||0}}))}/>`}</div>`})}</div></div>
    <div><div className="text-sm text-slate-400 mb-2">Lavador / Detalhista responsável</div>${seg(WASH.map(w=>w.n),f.wash,w=>up({wash:w}))}</div>
    <div><div className="text-sm text-slate-400 mb-2">Observações / Avarias pré-existentes</div><textarea rows="3" className=${inp} placeholder=${ph('ops.obs','Ex.: arranhões, amassados, pertences no interior')} value=${f.obs} onChange=${e=>up({obs:e.target.value})}></textarea></div>
    <div className="grid sm:grid-cols-2 gap-4"><div><div className="text-sm text-slate-400 mb-2">Pagamento</div>${seg(PAY,f.pay,p=>up({pay:p}))}</div><div><div className="text-sm text-slate-400 mb-2">Status</div>${seg(STAT,f.status,s=>up({status:s}))}</div></div>
    ${err&&html`<div className="text-red-400 text-sm">${err}</div>`}
    <div className="flex items-center justify-between gap-4 pt-2"><div className="text-3xl font-bold text-amber-300">${brl(total)}</div><button onClick=${submit} className="rounded-xl px-6 py-4 text-lg font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-2"><${Ic} d=${I.plus}/>Registrar e imprimir</button></div>
  </div>
  <div className=${card+' xl:col-span-2'}><h3 className="text-lg font-bold mb-3">Atendimentos de hoje (${today.length})</h3><div className="space-y-2 max-h-[75vh] overflow-auto">${today.map(o=>html`<div key=${o.id} className="rounded-xl bg-slate-800/60 p-3">
    <div className="flex justify-between"><div><span className="text-slate-400">#${o.id}</span> <b>${o.plate}</b> · ${o.model}</div><b className="text-amber-300">${brl(o.total)}</b></div>
    <div className="text-sm text-slate-400">${o.name} · ${o.svc.map(s=>s.n).join(', ')} · ${o.pay}${o.wash?' · '+o.wash:''}</div>
    ${o.obs&&html`<div className="text-sm text-amber-200/80 mt-1">⚠ ${o.obs}</div>`}
    <div className="flex items-center gap-2 mt-2"><select disabled=${o.closed} value=${o.status} onChange=${e=>setSt(o.id,e.target.value)} className=${'rounded-lg px-3 py-2 font-medium border-0 '+SCOL[o.status]}>${STAT.map(s=>html`<option key=${s} className="bg-slate-900 text-slate-200">${s}</option>`)}</select>
    <button onClick=${()=>setRc({type:'os',o})} className="ml-auto rounded-lg px-3 py-2 bg-slate-700 hover:bg-slate-600 flex items-center gap-2"><${Ic} s=${18} d=${I.print}/>Comprovante</button></div></div>`)}</div></div></div></div>`}

function Clientes({orders,clients}){
  const [q,setQ]=useState('');
  const rows=clients.map(c=>{const os=orders.filter(o=>o.cid===c.id);const vs={};os.forEach(o=>vs[o.plate]=o.model);return{...c,visits:os.length,total:os.reduce((a,o)=>a+o.total,0),last:os.length?Math.max(...os.map(o=>o.ts)):0,vs}}).filter(r=>!q||(r.name+r.phone+Object.keys(r.vs).join(' ')).toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.total-a.total);
  return html`<div className=${card}><div className="relative mb-4 max-w-md"><input className=${inp} placeholder="Buscar por nome, telefone ou placa…" value=${q} onChange=${e=>setQ(e.target.value)}/></div>
  <div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-xs uppercase text-slate-400"><tr><th className="py-2 pr-4">Cliente</th><th className="pr-4">Telefone</th><th className="pr-4">Veículos</th><th className="pr-4 text-right">Visitas</th><th className="pr-4 text-right">Gasto total</th><th className="pr-4">Última visita</th><th>WhatsApp</th></tr></thead>
  <tbody>${rows.map(r=>html`<tr key=${r.id} className="border-t border-slate-800"><td className="py-3 pr-4 font-medium">${r.name}</td><td className="pr-4 text-slate-400">${r.phone}</td><td className="pr-4">${Object.entries(r.vs).map(([p,m])=>html`<div key=${p}>${m} · <span className="text-cyan-300">${p}</span></div>`)}</td><td className="pr-4 text-right">${r.visits}</td><td className="pr-4 text-right font-semibold text-amber-300">${brl(r.total)}</td><td className="text-slate-400 whitespace-nowrap">${r.last?new Date(r.last).toLocaleDateString('pt-BR'):'-'}</td><td><a href=${'https://wa.me/'+waNum(r.phone)+'?text='+encodeURIComponent('Olá, '+r.name+'! Aqui é da AutoShine.')} target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg px-3 py-2 bg-emerald-500 text-slate-950 font-semibold">WhatsApp</a></td></tr>`)}</tbody></table></div></div>`}

function Caixa({orders,closures,reload,setRc}){
  const [fund,setFund]=useState('100'),[cnt,setCnt]=useState('');
  const open=orders.filter(o=>!o.closed&&key(new Date(o.ts))===key(new Date())),by=sumBy(open),total=open.reduce((a,o)=>a+o.total,0);
  const exp=(+fund||0)+by.Dinheiro,has=cnt!=='',diff=(+cnt||0)-exp,sang=Math.max(0,(+cnt||0)-(+fund||0));
  const close=async()=>{if(!has||!open.length)return;try{const c=await api('/closures','POST',{fund:+fund||0,counted:+cnt});await reload();setCnt('');setRc({type:'caixa',c})}catch(e){alert(e.message)}};
  return html`<div className="space-y-6"><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <${Kpi} l="Dinheiro" v=${brl(by.Dinheiro)} s="Em caixa hoje"/><${Kpi} l="PIX" v=${brl(by.PIX)} s="Recebido hoje"/><${Kpi} l="Cartão" v=${brl(by.Crédito+by.Débito)} s=${'Créd. '+brl(by.Crédito)+' · Déb. '+brl(by.Débito)} c="text-amber-300"/><${Kpi} l="Total do dia" v=${brl(total)} s=${open.length+' atendimentos em aberto'} c="text-emerald-300"/></div>
  <div className="grid lg:grid-cols-2 gap-6"><div className=${card+' space-y-4'}><h3 className="text-lg font-bold">Conferência de caixa</h3>
    <label className="block text-sm text-slate-400">Fundo de troco (R$)<input type="number" className=${inp+' mt-1'} value=${fund} onChange=${e=>setFund(e.target.value)}/></label>
    <label className="block text-sm text-slate-400">Dinheiro físico contado (R$)<input type="number" className=${inp+' mt-1 text-2xl'} value=${cnt} onChange=${e=>setCnt(e.target.value)}/></label>
    <div className="rounded-xl bg-slate-800 p-4 space-y-1"><div className="flex justify-between"><span>Esperado (fundo + dinheiro)</span><b>${brl(exp)}</b></div>
    <div className=${'flex justify-between '+(!has?'text-slate-500':diff===0?'text-emerald-300':'text-red-400')}><span>${diff<0?'Falta':diff>0?'Sobra':'Divergência'}</span><b>${has?brl(diff):'—'}</b></div>
    <div className="flex justify-between text-amber-300"><span>Sangria sugerida</span><b>${has?brl(sang):'—'}</b></div></div>
    <button disabled=${!has||!open.length} onClick=${close} className="w-full rounded-xl py-4 text-lg font-bold bg-cyan-400 text-slate-950 disabled:opacity-40">Fechar o dia e imprimir relatório</button></div>
  <div className=${card}><h3 className="text-lg font-bold mb-3">Histórico de fechamentos</h3><div className="space-y-2 max-h-96 overflow-auto">${closures.map(c=>html`<div key=${c.id} className="flex items-center gap-3 rounded-xl bg-slate-800/60 p-3"><div className="flex-1"><div className="font-medium">#${c.id} · ${new Date(c.ts).toLocaleDateString('pt-BR')}</div><div className="text-sm text-slate-400">${c.n} atend. · Total ${brl(c.total)} · Diverg. <span className=${c.diff?'text-red-400':'text-emerald-300'}>${brl(c.diff)}</span></div></div><button onClick=${()=>setRc({type:'caixa',c})} className="rounded-lg p-2 bg-slate-700 hover:bg-slate-600"><${Ic} s=${18} d=${I.print}/></button></div>`)}</div></div></div></div>`}

function Estoque({inv,reload}){
  const [d,setD]=useState({});
  const apply=async id=>{const v=+d[id];if(!v)return;try{await api('/inventory/'+id,'PATCH',{delta:v});await reload();setD(x=>({...x,[id]:''}))}catch(e){alert(e.message)}};
  const low=inv.filter(i=>i.q<=i.min);
  return html`<div className="space-y-6">
  ${low.length>0&&html`<div className="rounded-xl border border-red-400/40 bg-red-400/10 text-red-300 p-4">Repor estoque: ${low.map(i=>i.n).join(', ')}.</div>`}
  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">${inv.map(i=>{const lo=i.q<=i.min;return html`<div key=${i.id} className=${card}>
    <div className="font-semibold">${i.n}</div><div className=${'text-3xl font-bold mt-1 '+(lo?'text-red-400':'text-cyan-400')}>${i.q} <span className="text-base text-slate-400">${i.u}</span></div>
    <div className="text-xs text-slate-500 mb-2">Ponto de reposição: ${i.min} ${i.u}${lo?' · ESTOQUE BAIXO':''}</div>
    <div className="h-2 bg-slate-800 rounded mb-3"><div className=${'h-2 rounded '+(lo?'bg-red-400':'bg-emerald-400')} style=${{width:Math.min(100,i.q/(i.min*4)*100)+'%'}}></div></div>
    <div className="flex gap-2"><input type="number" className=${inp+' py-2'} placeholder="± qtd" value=${d[i.id]||''} onChange=${e=>setD(x=>({...x,[i.id]:e.target.value}))}/><button onClick=${()=>apply(i.id)} className="rounded-lg px-4 bg-cyan-400 text-slate-950 font-bold">Aplicar</button></div></div>`})}</div>
  <div className=${card}><h3 className="font-semibold mb-1">Consumo estimado por serviço</h3><div className="text-xs text-slate-500 mb-3">Deduzido automaticamente do estoque a cada atendimento registrado.</div>
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">${SERV.map(s=>html`<div key=${s.id} className="rounded-xl bg-slate-800/60 p-3"><div className="font-medium">${s.n}</div><div className="text-sm text-slate-400">${Object.entries(USO[s.id]||{}).map(([k,v])=>{const it=inv.find(i=>i.id===k);return it?v+' '+it.u+' '+it.n:''}).join(' · ')}</div></div>`)}</div></div></div>`}

function Portal({user,orders,clients,setRc}){
  const c=clients.find(x=>x.id===user.cid),mine=orders.filter(o=>o.cid===user.cid).sort((a,b)=>b.ts-a.ts);
  const vs={};mine.forEach(o=>{if(!vs[o.plate])vs[o.plate]=o});
  const act=mine.filter(o=>o.status!=='Entregue');
  return html`<div className="space-y-6">
  <div className=${card}><div className="text-xl font-bold">Olá, ${(c&&c.name||user.name).split(' ')[0]}!</div><div className="text-slate-400 text-sm">Acompanhe seus veículos e atendimentos na AutoShine.</div></div>
  <div className=${card}><h3 className="font-semibold mb-3">Em andamento (${act.length})</h3>${act.length===0?html`<div className="text-slate-400">Nenhum veículo no pátio agora.</div>`:html`<div className="space-y-3">${act.map(o=>html`<div key=${o.id} className="rounded-xl bg-slate-800/60 p-4"><div className="flex justify-between"><b>${o.model} · ${o.plate}</b><span className=${'rounded-lg px-3 py-1 text-sm font-semibold '+SCOL[o.status]}>${o.status}</span></div><div className="flex gap-1 mt-3">${STAT.map((s,i)=>html`<div key=${s} className=${'h-2 flex-1 rounded '+(i<=STAT.indexOf(o.status)?'bg-cyan-400':'bg-slate-700')}></div>`)}</div><div className="text-sm text-slate-400 mt-2">${o.svc.map(s=>s.n).join(', ')}</div></div>`)}</div>`}</div>
  <div className="grid lg:grid-cols-3 gap-6"><div className=${card}><h3 className="font-semibold mb-3">Meus veículos</h3>${Object.values(vs).length===0?html`<div className="text-slate-400">Nenhum veículo registrado ainda.</div>`:Object.values(vs).map(o=>html`<div key=${o.plate} className="py-2 border-t border-slate-800 first:border-0">${o.model} ${o.color&&'· '+o.color}<div className="text-cyan-300 text-sm">${o.plate}</div></div>`)}</div>
  <div className=${card+' lg:col-span-2'}><h3 className="font-semibold mb-3">Histórico de serviços</h3><div className="space-y-2 max-h-[60vh] overflow-auto">${mine.length===0?html`<div className="text-slate-400">Seu histórico aparecerá aqui após o primeiro atendimento.</div>`:mine.map(o=>html`<div key=${o.id} className="rounded-xl bg-slate-800/60 p-3 flex items-center gap-3"><div className="flex-1"><div><span className="text-slate-400">#${o.id}</span> <b>${o.plate}</b> · ${fdt(o.ts)}</div><div className="text-sm text-slate-400">${o.svc.map(s=>s.n).join(', ')} · ${brl(o.total)}</div></div><span className=${'rounded-lg px-2 py-1 text-xs font-semibold '+SCOL[o.status]}>${o.status}</span><button onClick=${()=>setRc({type:'os',o})} className="rounded-lg p-2 bg-slate-700 hover:bg-slate-600"><${Ic} s=${18} d=${I.print}/></button></div>`)}</div></div></div></div>`}

const waNum=p=>{let d=(p||'').replace(/\D/g,'');if(d.length<=11)d='55'+d;return d};
const waUrl=o=>'https://wa.me/'+waNum(o.phone)+'?text='+encodeURIComponent(`*AutoShine Estética Automotiva*\nOlá, ${o.name}! Segue o comprovante do ticket nº ${o.id}.\n\n🚗 ${o.model} · ${o.plate}\n🧽 Serviços:\n${o.svc.map(s=>'• '+s.n+' — '+brl(s.p)).join('\n')}\n\n💰 Total: ${brl(o.total)} (${o.pay})\nStatus: ${o.status}\n\nObrigado pela preferência! 🙏`);
const waReady=o=>'https://wa.me/'+waNum(o.phone)+'?text='+encodeURIComponent(`*AutoShine Estética Automotiva*\nOlá, ${o.name}! Seu ${o.model} (${o.plate}) está pronto para retirada. 🚗✨\n\nTotal: ${brl(o.total)} (${o.pay})\nAguardamos você!`);
const QR=({seed})=>{const n=21;let st=seed*9301+49297;const r=()=>(st=(st*9301+49297)%233280)/233280;const rs=[];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){let on;if((x<7&&y<7)||(x>13&&y<7)||(x<7&&y>13)){const lx=x<7?x:x-14,ly=y<7?y:y-14;on=lx===0||lx===6||ly===0||ly===6||(lx>1&&lx<5&&ly>1&&ly<5)}else on=r()<.5;if(on)rs.push(html`<rect key=${x+'-'+y} x=${x} y=${y} width="1" height="1"/>`)}
  return html`<svg width="110" height="110" viewBox="0 0 21 21" shapeRendering="crispEdges" fill="#000">${rs}</svg>`};

const AdmErr=({e})=>e?html`<div className="text-red-400 text-sm">${e}</div>`:null;
function AdmList({title,path,items,reload}){
  const [n,setN]=useState(''),[err,setErr]=useState('');
  const add=async e=>{e.preventDefault();try{await api('/admin/'+path,'POST',{name:n});setN('');setErr('');await reload()}catch(x){setErr(x.message)}};
  const rm=async i=>{try{await api('/admin/'+path+'/'+i.id,'DELETE',{});await reload()}catch(x){setErr(x.message)}};
  return html`<div className=${card+' max-w-xl space-y-3'}><form onSubmit=${add} className="flex gap-2"><input className=${inp} placeholder=${'Nova '+title.toLowerCase()} value=${n} onChange=${e=>setN(e.target.value)}/><button className="rounded-xl px-5 font-bold bg-cyan-400 text-slate-950">Adicionar</button></form><${AdmErr} e=${err}/>
  <div className="flex flex-wrap gap-2">${items.map(i=>html`<span key=${i.id} className="inline-flex items-center gap-2 rounded-full bg-slate-800 pl-4 pr-2 py-1">${i.name}<button onClick=${()=>rm(i)} title="Remover" className="rounded-full w-7 h-7 bg-slate-700 hover:bg-red-500/30">×</button></span>`)}</div></div>`}
function AdmPh({items,reload}){
  const E={id:null,key:'',text:''},[f,setF]=useState(E),[err,setErr]=useState('');
  const sv=async e=>{e.preventDefault();try{await api('/admin/placeholders'+(f.id?'/'+f.id:''),f.id?'PUT':'POST',f.id?{text:f.text}:{key:f.key,text:f.text});setF(E);setErr('');await reload()}catch(x){setErr(x.message)}};
  const rm=async i=>{try{await api('/admin/placeholders/'+i.id,'DELETE',{});await reload()}catch(x){setErr(x.message)}};
  return html`<div className="grid lg:grid-cols-3 gap-6"><form onSubmit=${sv} className=${card+' space-y-3'}><h3 className="font-bold">${f.id?'Editar':'Novo'} placeholder</h3>
    <input className=${inp} disabled=${!!f.id} placeholder="Chave (ex.: ops.plate)" value=${f.key} onChange=${e=>setF({...f,key:e.target.value})}/><input className=${inp} placeholder="Texto exibido" value=${f.text} onChange=${e=>setF({...f,text:e.target.value})}/>
    <div className="text-xs text-slate-500">Chaves em uso: ops.name, ops.phone, ops.model, ops.plate, ops.obs</div><${AdmErr} e=${err}/>
    <div className="flex gap-2"><button className="flex-1 rounded-xl py-3 font-bold bg-cyan-400 text-slate-950">Salvar</button>${f.id&&html`<button type="button" onClick=${()=>setF(E)} className="rounded-xl px-4 bg-slate-800">Cancelar</button>`}</div></form>
  <div className=${card+' lg:col-span-2 space-y-2'}>${items.map(i=>html`<div key=${i.id} className="rounded-xl bg-slate-800/60 p-3 flex items-center gap-3"><div className="flex-1 min-w-0"><div className="text-cyan-300 text-sm">${i.key}</div><div className="truncate">${i.text}</div></div><button onClick=${()=>setF(i)} className="rounded-lg px-3 py-2 bg-slate-700">Editar</button><button onClick=${()=>rm(i)} className="rounded-lg px-3 py-2 bg-red-500/20 text-red-300">Excluir</button></div>`)}</div></div>`}
function AdmServ({items,isG,reload}){
  const E={id:null,name:'',desc:'',price:''},[f,setF]=useState(E),[err,setErr]=useState(''),[del,setDel]=useState(null);
  const sv=async e=>{e.preventDefault();try{const b={name:f.name,desc:f.desc};if(isG)b.price=+f.price||0;await api('/admin/services'+(f.id?'/'+f.id:''),f.id?'PUT':'POST',b);setF(E);setErr('');await reload()}catch(x){setErr(x.message)}};
  const rm=async()=>{try{await api('/admin/services/'+del.id,'DELETE',{});await reload();setErr('')}catch(x){setErr(x.message)}setDel(null)};
  return html`<div className="grid lg:grid-cols-3 gap-6"><form onSubmit=${sv} className=${card+' space-y-3'}><h3 className="font-bold">${f.id?'Editar':'Novo'} serviço</h3>
    <input className=${inp} placeholder="Nome" value=${f.name} onChange=${e=>setF({...f,name:e.target.value})}/><textarea rows="3" className=${inp} placeholder="Descrição" value=${f.desc} onChange=${e=>setF({...f,desc:e.target.value})}></textarea>
    <label className="block text-sm text-slate-400">Preço base (R$)<input type="number" min="0" disabled=${!isG} className=${inp+' mt-1 disabled:opacity-50'} placeholder=${isG?'0,00':'Somente o Gerente'} value=${isG?f.price:''} onChange=${e=>setF({...f,price:e.target.value})}/></label>
    ${!isG&&html`<div className="text-xs text-slate-500">Preços só podem ser definidos ou alterados pelo Gerente.</div>`}<${AdmErr} e=${err}/>
    <div className="flex gap-2"><button className="flex-1 rounded-xl py-3 font-bold bg-cyan-400 text-slate-950">Salvar</button>${f.id&&html`<button type="button" onClick=${()=>setF(E)} className="rounded-xl px-4 bg-slate-800">Cancelar</button>`}</div></form>
  <div className=${card+' lg:col-span-2 space-y-2'}>${items.map(i=>html`<div key=${i.id} className="rounded-xl bg-slate-800/60 p-3 flex items-center gap-3"><div className="flex-1 min-w-0"><div className="font-medium">${i.name}</div><div className="text-sm text-slate-400 truncate">${i.desc||'Sem descrição'}</div></div>${isG&&html`<b className="text-amber-300">${brl(i.price)}</b>`}
    <button onClick=${()=>setF({id:i.id,name:i.name,desc:i.desc||'',price:String(i.price)})} className="rounded-lg px-3 py-2 bg-slate-700">Editar</button>${isG&&html`<button onClick=${()=>setDel(i)} className="rounded-lg px-3 py-2 bg-red-500/20 text-red-300">Excluir</button>`}</div>`)}</div>
  ${del&&html`<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className=${card+' max-w-sm w-full space-y-4'}><div className="text-lg font-bold">Excluir serviço?</div><div className="text-slate-400">“${del.name}” será removido. Atendimentos já registrados não são afetados.</div><div className="flex gap-2"><button onClick=${()=>setDel(null)} className="flex-1 rounded-xl py-3 bg-slate-800">Cancelar</button><button onClick=${rm} className="flex-1 rounded-xl py-3 font-bold bg-red-500 text-white">Excluir</button></div></div></div>`}</div>`}
function Admin({data,user,reload}){
  const [t,setT]=useState('Serviços');
  return html`<div className="space-y-4">${seg(['Serviços','Placeholders','Marcas','Cores'],t,setT)}
    ${t==='Serviços'&&html`<${AdmServ} items=${data.services} isG=${user.role==='gerente'} reload=${reload}/>`}${t==='Placeholders'&&html`<${AdmPh} items=${data.placeholders} reload=${reload}/>`}
    ${t==='Marcas'&&html`<${AdmList} title="Marca" path="brands" items=${data.brands} reload=${reload}/>`}${t==='Cores'&&html`<${AdmList} title="Cor" path="colors" items=${data.colors} reload=${reload}/>`}</div>`}

const ROLE={gerente:'Gerente',operador:'Operador de Balcão',cliente:'Cliente'};
function Login({onLogin,theme,onTheme}){
  let saved='';try{saved=localStorage.getItem('as_user')||''}catch(e){}
  const [mode,setMode]=useState('in'),[u,setU]=useState(saved),[p,setP]=useState(''),[rem,setRem]=useState(!!saved),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const [nm,setNm]=useState(''),[ph,setPh]=useState(''),[p2,setP2]=useState('');
  const run=async(path,body)=>{setBusy(true);try{const m=await api(path,'POST',body);try{rem?localStorage.setItem('as_user',m.email):localStorage.removeItem('as_user')}catch(e){}onLogin(m)}catch(e){setErr(e.message)}setBusy(false)};
  const go=e=>{e.preventDefault();run('/auth/login',{email:u.trim(),password:p})};
  const reg=e=>{e.preventDefault();if(!nm.trim()||!u.trim()||!ph.trim())return setErr('Preencha nome, e-mail e telefone.');if(p.length<8)return setErr('A senha precisa ter ao menos 8 caracteres.');if(p!==p2)return setErr('A confirmação não confere com a senha.');run('/auth/register',{name:nm,email:u.trim(),phone:ph,password:p})};
  const sw=m=>{setMode(m);setErr('');setP('');setP2('')};
  return html`<div className="login-bg relative min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,#0e3a4a,#020617_60%)]"><button type="button" onClick=${onTheme} title=${theme==='light'?'Tema escuro':'Tema claro'} className="absolute top-4 right-4 rounded-xl p-3 bg-slate-800 hover:bg-slate-700 text-slate-300"><${Ic} s=${20} d=${theme==='light'?I.moon:I.sun}/></button><form onSubmit=${mode==='in'?go:reg} className=${card+' w-full max-w-md space-y-4'}>
    <div className="text-center"><div className="text-4xl font-extrabold tracking-wide"><span className="text-cyan-400">AUTO</span>SHINE</div><div className="text-slate-400 mt-1">Gestão de Estética Automotiva</div></div>
    <div className="grid grid-cols-2 gap-2 bg-slate-800 rounded-xl p-1">${[['in','Entrar'],['up','Criar nova conta']].map(([k,l])=>html`<button type="button" key=${k} onClick=${()=>sw(k)} className=${'rounded-lg py-2 font-semibold '+(mode===k?'bg-cyan-400 text-slate-950':'text-slate-300')}>${l}</button>`)}</div>
    ${mode==='up'&&html`<input className=${inp} placeholder="Nome completo" value=${nm} onChange=${e=>setNm(e.target.value)}/>`}
    <input className=${inp} placeholder="E-mail" value=${u} onChange=${e=>setU(e.target.value)} autoComplete="username"/>
    ${mode==='up'&&html`<input className=${inp} placeholder="Telefone / WhatsApp" value=${ph} onChange=${e=>setPh(e.target.value)}/>`}
    <input type="password" className=${inp} placeholder="Senha" value=${p} onChange=${e=>setP(e.target.value)} autoComplete=${mode==='in'?'current-password':'new-password'}/>
    ${mode==='up'&&html`<input type="password" className=${inp} placeholder="Confirmar senha" value=${p2} onChange=${e=>setP2(e.target.value)} autoComplete="new-password"/>`}
    ${mode==='up'&&html`<div className="text-xs text-slate-400 bg-slate-800/60 rounded-lg p-3">Esta conta é de cliente. Acessos da equipe são criados pelo Gerente.</div>`}
    ${mode==='in'&&html`<label className="flex items-center gap-2 text-slate-300"><input type="checkbox" className="w-5 h-5" checked=${rem} onChange=${e=>setRem(e.target.checked)}/>Lembrar e-mail</label>`}
    ${err&&html`<div className="text-red-400 text-sm">${err}</div>`}
    <button type="submit" disabled=${busy} className="w-full rounded-xl py-4 text-lg font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-50">${mode==='in'?'Entrar':'Criar conta'}</button></form></div>`}

function Usuarios({me}){
  const [us,setUs]=useState([]),[f,setF]=useState({name:'',email:'',password:'',role:'operador'}),[err,setErr]=useState('');
  const load=()=>api('/users').then(setUs).catch(e=>setErr(e.message));useEffect(()=>{load()},[]);
  const add=async e=>{e.preventDefault();try{await api('/users','POST',f);setF({...f,name:'',email:'',password:''});setErr('');load()}catch(x){setErr(x.message)}};
  const patch=async(id,b)=>{try{await api('/users/'+id,'PATCH',b);setErr('');load()}catch(x){setErr(x.message)}};
  return html`<div className="grid lg:grid-cols-3 gap-6"><form onSubmit=${add} className=${card+' space-y-3'}><h3 className="text-lg font-bold">Novo acesso da equipe</h3>
    <input className=${inp} placeholder="Nome" value=${f.name} onChange=${e=>setF({...f,name:e.target.value})}/><input className=${inp} placeholder="E-mail" value=${f.email} onChange=${e=>setF({...f,email:e.target.value})}/><input type="password" className=${inp} placeholder="Senha provisória (8+)" value=${f.password} onChange=${e=>setF({...f,password:e.target.value})} autoComplete="new-password"/>
    ${seg(['operador','gerente'],f.role,r=>setF({...f,role:r}))}${err&&html`<div className="text-red-400 text-sm">${err}</div>`}<button className="w-full rounded-xl py-3 font-bold bg-cyan-400 text-slate-950">Criar acesso</button></form>
  <div className=${card+' lg:col-span-2'}><h3 className="text-lg font-bold mb-3">Usuários (${us.length})</h3><div className="space-y-2 max-h-[70vh] overflow-auto">${us.map(x=>html`<div key=${x.id} className="rounded-xl bg-slate-800/60 p-3 flex items-center gap-3"><div className="flex-1"><div className="font-medium">${x.name}</div><div className="text-sm text-slate-400">${x.email}</div></div>
    ${x.role==='cliente'?html`<span className="text-sm text-slate-400">Cliente</span>`:html`<select disabled=${x.id===me.id} value=${x.role} onChange=${e=>patch(x.id,{role:e.target.value})} className="rounded-lg bg-slate-700 px-2 py-2"><option value="operador">Operador</option><option value="gerente">Gerente</option></select>`}
    <button disabled=${x.id===me.id} onClick=${()=>patch(x.id,{active:!x.active})} className=${'rounded-lg px-3 py-2 font-medium disabled:opacity-40 '+(x.active?'bg-emerald-400/15 text-emerald-300':'bg-red-400/15 text-red-300')}>${x.active?'Ativo':'Bloqueado'}</button></div>`)}</div></div></div>`}

function App(){
  const E={clients:[],orders:[],closures:[],inventory:[],services:[],placeholders:[],brands:[],colors:[]};
  const [user,setUser]=useState(null),[boot,setBoot]=useState(true),[tab,setTab]=useState('op'),[col,setCol]=useState(false),[w,setW]=useState('80mm'),[rc,setRc]=useState(null),[data,setData]=useState(E);
  const [theme,setTheme]=useState(getTheme());
  const toggleTheme=()=>{const t=theme==='light'?'dark':'light';applyTheme(t);setTheme(t)};
  const reload=async()=>{const d=await api('/data');SERV=d.services.map(s=>({id:s.id,n:s.name,p:s.price}));PH=Object.fromEntries(d.placeholders.map(x=>[x.key,x.text]));setData(d)};
  useEffect(()=>{api('/auth/me').then(setUser).catch(()=>{}).finally(()=>setBoot(false))},[]);
  useEffect(()=>{if(user)reload().catch(()=>setUser(null))},[user&&user.id]);
  const logout=async()=>{try{await api('/auth/logout','POST',{})}catch(e){}setUser(null);setData(E);setRc(null);setTab('op')};
  if(boot)return html`<div className="min-h-screen flex items-center justify-center text-slate-400">Carregando…</div>`;
  if(!user)return html`<${Login} onLogin=${setUser} theme=${theme} onTheme=${toggleTheme}/>`;
  const {clients,orders,closures,inventory}=data,isCli=user.role==='cliente';
  const ALL={portal:['Meu Portal',I.car],op:['Operação / Balcão',I.car],dash:['Dashboard',I.dash],cli:['Clientes',I.users],est:['Estoque de Insumos',I.box],cx:['Fechamento de Caixa',I.wallet],usr:['Usuários',I.users],adm:['Painel Administrativo',I.sl]};
  const keys={cliente:['portal'],operador:['op','cli','est','adm'],gerente:['op','dash','cli','est','cx','adm','usr']}[user.role];
  const cur=keys.includes(tab)?tab:keys[0],nav=keys.map(k=>[k,...ALL[k]]);
  return html`<div className="flex min-h-screen">
  <aside className=${'sticky top-0 h-screen shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 p-3 transition-all '+(col?'w-[72px]':'w-64')}>
    <button onClick=${()=>setCol(!col)} className="w-full flex items-center gap-3 p-3 mb-4 rounded-xl hover:bg-slate-800"><${Ic} d=${I.menu}/>${!col&&html`<span className="text-xl font-extrabold tracking-wide"><span className="text-cyan-400">AUTO</span>SHINE</span>`}</button>
    ${nav.map(([k,l,d])=>html`<button key=${k} onClick=${()=>setTab(k)} className=${'w-full flex items-center gap-3 p-4 mb-2 rounded-xl font-semibold text-left '+(cur===k?'bg-cyan-400 text-slate-950':'hover:bg-slate-800 text-slate-300')}><${Ic} d=${d}/>${!col&&html`<span>${l}</span>`}</button>`)}
    <button onClick=${toggleTheme} title=${theme==='light'?'Mudar para o tema escuro':'Mudar para o tema claro'} className="mt-auto w-full flex items-center gap-3 p-4 rounded-xl font-semibold text-left hover:bg-slate-800 text-slate-300"><${Ic} d=${theme==='light'?I.moon:I.sun}/>${!col&&html`<span>${theme==='light'?'Tema escuro':'Tema claro'}</span>`}</button>
  </aside>
  <main className="flex-1 min-w-0 p-4 md:p-8"><header className="flex items-center justify-between gap-4 mb-6"><h1 className="text-2xl font-bold">${ALL[cur][0]}</h1><div className="flex items-center gap-3"><div className="text-right"><div className="font-semibold">${user.name}</div><div className="text-xs text-cyan-300">${ROLE[user.role]}</div></div><button onClick=${logout} className="rounded-xl px-4 py-3 bg-slate-800 hover:bg-slate-700 font-semibold">Sair</button></div></header>
    ${cur==='portal'&&html`<${Portal} user=${user} orders=${orders} clients=${clients} setRc=${setRc}/>`}
    ${cur==='op'&&html`<${Ops} orders=${orders} clients=${clients} reload=${reload} setRc=${setRc} brands=${data.brands} colors=${data.colors} canPrice=${user.role==='gerente'}/>`}
    ${cur==='dash'&&html`<${Dash} orders=${orders}/>`}
    ${cur==='cli'&&html`<${Clientes} orders=${orders} clients=${clients}/>`}
    ${cur==='est'&&html`<${Estoque} inv=${inventory} reload=${reload}/>`}
    ${cur==='cx'&&html`<${Caixa} orders=${orders} closures=${closures} reload=${reload} setRc=${setRc}/>`}
    ${cur==='adm'&&html`<${Admin} data=${data} user=${user} reload=${reload}/>`}
    ${cur==='usr'&&html`<${Usuarios} me=${user}/>`}</main>
  ${rc&&html`<div className="fixed inset-0 z-50 bg-black/80 overflow-auto p-4"><div className="max-w-md mx-auto">
    <div className="flex gap-2 mb-3">${rc.type==='os'&&!isCli&&html`<a href=${waUrl(rc.o)} target="_blank" rel="noopener noreferrer" className="rounded-xl px-4 py-3 font-bold bg-emerald-500 text-slate-950 flex items-center whitespace-nowrap">Enviar no WhatsApp</a>`}
    <button onClick=${()=>setW(w==='80mm'?'58mm':'80mm')} className="rounded-xl px-4 py-3 bg-slate-800 font-semibold">${w}</button>
    <button onClick=${()=>window.print()} className="flex-1 rounded-xl px-4 py-3 font-bold bg-cyan-400 text-slate-950 flex items-center justify-center gap-2"><${Ic} s=${18} d=${I.print}/>Imprimir</button>
    <button onClick=${()=>setRc(null)} className="rounded-xl px-4 py-3 bg-slate-800"><${Ic} s=${18} d=${I.x}/></button></div>
    <${Receipt} r=${rc} w=${w}/></div></div>`}
  </div>`}
class EB extends React.Component{constructor(p){super(p);this.state={e:null}}static getDerivedStateFromError(e){return{e}}render(){return this.state.e?html`<div className="p-6 text-red-300">Erro na interface: ${String(this.state.e.message||this.state.e)}<br/><button className="mt-3 rounded-xl px-4 py-2 bg-slate-800 text-slate-200" onClick=${()=>location.reload()}>Recarregar</button></div>`:this.props.children}}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${EB}><${App}/><//>`);
