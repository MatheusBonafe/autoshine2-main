const express=require('express'),helmet=require('helmet'),rl=require('express-rate-limit'),cp=require('cookie-parser'),bc=require('bcryptjs'),jwt=require('jsonwebtoken'),fs=require('fs'),path=require('path');
const SECRET=process.env.JWT_SECRET;if(!SECRET||SECRET.length<32){console.error('Defina JWT_SECRET com 32+ caracteres.');process.exit(1)}
const PROD=process.env.NODE_ENV==='production',F=path.join(__dirname,'data.json');
const SERV={ls:'Lavagem Simples',lc:'Lavagem Completa',hi:'Higienização Interna',hc:'Hidratação de Couro',po:'Polimento',vi:'Vitrificação'};
const USO={ls:{sh:.1,mf:.5},lc:{sh:.2,mf:1},hi:{sh:.1,mf:2},hc:{mf:1},po:{ce:.3,mf:2},vi:{vi:.5,mf:2}};
const CATS={Hatch:1,Sedan:1.15,SUV:1.35,Picape:1.4,Moto:.6},PLATE=/^[A-Z]{3}\d[A-Z0-9]\d{2}$/,PAY=['Dinheiro','PIX','Crédito','Débito'],STAT=['Aguardando','Em Execução','Pronto','Entregue'],WASH=['João','Pedro','Marcos'];
const INV0=[{id:'sh',n:'Shampoo Neutro',u:'L',q:20,min:5},{id:'ce',n:'Cera de Carnaúba',u:'un',q:12,min:4},{id:'vi',n:'Vitrificador',u:'frasco',q:6,min:2},{id:'mf',n:'Microfibra',u:'un',q:30,min:10}];
let db;try{db=JSON.parse(fs.readFileSync(F,'utf8'))}catch(e){db={users:[],clients:[],orders:[],closures:[],inventory:INV0,audit:[]}}
const save=()=>{fs.writeFileSync(F+'.tmp',JSON.stringify(db));fs.renameSync(F+'.tmp',F)};
const SP={ls:40,lc:70,hi:180,hc:120,po:250,vi:600}; // migração: cria o que ainda não existe no data.json
db.services=db.services||Object.entries(SERV).map(([id,name])=>({id,name,desc:'',price:SP[id]}));
db.placeholders=db.placeholders||[['ops.name','Nome do cliente'],['ops.phone','WhatsApp +55 (11) 99999-9999'],['ops.model','Modelo do veículo'],['ops.plate','Placa (ABC1D23)'],['ops.obs','Ex.: arranhão na porta, amassado no para-choque, pertences no porta-malas…']].map(([key,text],i)=>({id:i+1,key,text}));
db.brands=db.brands||['Chevrolet','Volkswagen','Fiat','BMW','Toyota','Honda','Hyundai','Ford'].map((name,i)=>({id:i+1,name}));
db.colors=db.colors||['Preto','Branco','Prata','Cinza','Azul','Vermelho'].map((name,i)=>({id:i+1,name}));
const audit=(req,a,d)=>{db.audit.push({ts:Date.now(),by:req.user?req.user.id:null,a,d});if(db.audit.length>5000)db.audit.shift()};
const nid=a=>Math.max(0,...a.map(x=>x.id))+1,S=(v,m)=>typeof v==='string'?v.trim().slice(0,m):'',EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pub=u=>({id:u.id,name:u.name,email:u.email,role:u.role,cid:u.cid,active:u.active});
if(!db.users.length){const e=process.env.ADMIN_EMAIL,p=process.env.ADMIN_PASSWORD;if(!e||!p||p.length<8){console.error('1ª execução: defina ADMIN_EMAIL e ADMIN_PASSWORD (8+).');process.exit(1)}
  db.users.push({id:1,name:'Gerente',email:e.toLowerCase(),hash:bc.hashSync(p,12),role:'gerente',active:true});save()}
const DUMMY=bc.hashSync('x',12);
const app=express();app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'",'https://cdn.tailwindcss.com','https://cdnjs.cloudflare.com','https://cdn.jsdelivr.net',"'unsafe-eval'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'",'data:'],connectSrc:["'self'"],frameAncestors:["'none'"]}}}));
app.use(express.json({limit:'50kb'}),cp());
app.use('/api',(req,res,next)=>{if(req.method!=='GET'&&!req.is('application/json'))return res.status(415).json({error:'Content-Type inválido.'});next()});
const login=rl({windowMs:15*60e3,max:10,standardHeaders:true,message:{error:'Muitas tentativas. Aguarde 15 minutos.'}});
const sess=(res,u)=>res.cookie('as_token',jwt.sign({id:u.id},SECRET,{expiresIn:'8h'}),{httpOnly:true,sameSite:'strict',secure:PROD,maxAge:8*3600e3});
const auth=(req,res,next)=>{try{const{id}=jwt.verify(req.cookies.as_token,SECRET),u=db.users.find(x=>x.id===id);if(!u||!u.active)throw 0;req.user=u;next()}catch(e){res.status(401).json({error:'Sessão expirada.'})}};
const need=(...r)=>(req,res,next)=>r.includes(req.user.role)?next():res.status(403).json({error:'Sem permissão.'});
const bad=(res,m)=>res.status(400).json({error:m});
const today=ts=>new Date(ts).toDateString()===new Date().toDateString();

/* ---- auth ---- */
app.post('/api/auth/register',login,(req,res)=>{const b=req.body||{},name=S(b.name,80),email=S(b.email,120).toLowerCase(),phone=S(b.phone,20),pw=typeof b.password==='string'?b.password:'';
  if(!name||!phone||!EMAIL.test(email))return bad(res,'Informe nome, e-mail válido e telefone.');if(pw.length<8||pw.length>72)return bad(res,'A senha precisa ter de 8 a 72 caracteres.');
  if(db.users.some(u=>u.email===email))return res.status(409).json({error:'Não foi possível criar a conta com estes dados.'});
  let c=db.clients.find(x=>x.phone===phone);if(!c){c={id:nid(db.clients),name,phone};db.clients.push(c)}
  const u={id:nid(db.users),name,email,hash:bc.hashSync(pw,12),role:'cliente',cid:c.id,active:true};db.users.push(u);save();sess(res,u);res.json(pub(u))}); // cadastro público = sempre cliente
app.post('/api/auth/login',login,(req,res)=>{const b=req.body||{},u=db.users.find(x=>x.email===S(b.email,120).toLowerCase()),ok=bc.compareSync(typeof b.password==='string'?b.password:'',u?u.hash:DUMMY);
  if(!u||!ok||!u.active)return res.status(401).json({error:'Usuário ou senha inválidos.'});sess(res,u);res.json(pub(u))});
app.post('/api/auth/logout',(req,res)=>{res.clearCookie('as_token');res.json({ok:1})});
app.get('/api/auth/me',auth,(req,res)=>res.json(pub(req.user)));

/* ---- dados (filtrados por perfil) ---- */
app.get('/api/data',auth,(req,res)=>{const u=req.user;
  if(u.role==='cliente')return res.json({clients:db.clients.filter(c=>c.id===u.cid),orders:db.orders.filter(o=>o.cid===u.cid),closures:[],inventory:[],services:[],placeholders:[],brands:[],colors:[]});
  res.json({clients:db.clients,orders:db.orders,closures:u.role==='gerente'?db.closures:[],inventory:db.inventory,services:db.services,placeholders:db.placeholders,brands:db.brands,colors:db.colors})});

app.post('/api/orders',auth,need('gerente','operador'),(req,res)=>{const b=req.body||{},name=S(b.name,80),model=S(b.model,40),plate=S(b.plate,10).toUpperCase(),phone=S(b.phone,20);
  if(!name||!model||!plate||!Array.isArray(b.svc)||!b.svc.length||b.svc.length>6)return bad(res,'Dados do atendimento inválidos.');
  if(!PLATE.test(plate))return bad(res,'Placa inválida. Use ABC1D23 ou ABC1234.');
  const brand=S(b.brand,40),color=S(b.color,30);
  if(brand&&!db.brands.some(x=>x.name===brand))return bad(res,'Marca inválida.');
  if(color&&!db.colors.some(x=>x.name===color))return bad(res,'Cor inválida.');
  if(!Object.hasOwn(CATS,b.cat)||!PAY.includes(b.pay)||!STAT.includes(b.status)||!WASH.includes(b.wash))return bad(res,'Categoria, pagamento, status ou executor inválido.');
  const svc=[];for(const s of b.svc){const d=s&&db.services.find(x=>x.id===s.id);if(!d||svc.some(x=>x.id===d.id))return bad(res,'Serviço inválido.');const p=req.user.role==='gerente'?Number(s.p):Math.round(d.price*CATS[b.cat]);if(!(p>=0&&p<=10000))return bad(res,'Preço inválido.');svc.push({id:d.id,n:d.name,p})}
  let c=db.clients.find(x=>x.id===b.cid)||(phone&&db.clients.find(x=>x.phone===phone));if(!c){c={id:nid(db.clients),name,phone};db.clients.push(c)}
  const o={id:Math.max(1000,...db.orders.map(x=>x.id))+1,ts:Date.now(),cid:c.id,name,phone,model,plate,color,brand,cat:b.cat,svc,total:svc.reduce((a,s)=>a+s.p,0),pay:b.pay,status:b.status,closed:false,obs:S(b.obs,500),wash:b.wash};
  db.inventory.forEach(i=>{let d=0;svc.forEach(s=>d+=(USO[s.id]||{})[i.id]||0);if(d)i.q=Math.max(0,+(i.q-d).toFixed(2))});
  db.orders.push(o);audit(req,'order.create',o.id);save();res.json(o)});
app.patch('/api/orders/:id',auth,need('gerente','operador'),(req,res)=>{const o=db.orders.find(x=>x.id===+req.params.id);if(!o)return res.status(404).json({error:'OS não encontrada.'});
  if(o.closed)return bad(res,'OS de caixa já fechado.');if(!STAT.includes(req.body.status))return bad(res,'Status inválido.');o.status=req.body.status;audit(req,'order.status',[o.id,o.status]);save();res.json(o)});
app.patch('/api/inventory/:id',auth,need('gerente','operador'),(req,res)=>{const i=db.inventory.find(x=>x.id===req.params.id),d=Number(req.body.delta);if(!i||!Number.isFinite(d)||Math.abs(d)>1000)return bad(res,'Ajuste inválido.');
  i.q=Math.max(0,+(i.q+d).toFixed(2));audit(req,'inventory.adjust',[i.id,d]);save();res.json(i)});
app.post('/api/closures',auth,need('gerente'),(req,res)=>{const fund=Number(req.body.fund),counted=Number(req.body.counted);if(!(fund>=0&&counted>=0))return bad(res,'Valores inválidos.');
  const open=db.orders.filter(o=>!o.closed&&today(o.ts));if(!open.length)return bad(res,'Nada a fechar hoje.');
  const by={Dinheiro:0,PIX:0,Crédito:0,Débito:0};open.forEach(o=>by[o.pay]+=o.total);const exp=fund+by.Dinheiro;
  const c={id:db.closures.length+1,ts:Date.now(),n:open.length,total:open.reduce((a,o)=>a+o.total,0),by,fund,counted,diff:counted-exp,sangria:Math.max(0,counted-fund),user:req.user.id};
  open.forEach(o=>o.closed=true);db.closures.unshift(c);audit(req,'closure',c.id);save();res.json(c)});

/* ---- usuários (só gerente) ---- */
app.get('/api/users',auth,need('gerente'),(req,res)=>res.json(db.users.map(pub)));
app.post('/api/users',auth,need('gerente'),(req,res)=>{const b=req.body||{},name=S(b.name,80),email=S(b.email,120).toLowerCase(),pw=typeof b.password==='string'?b.password:'';
  if(!name||!EMAIL.test(email)||pw.length<8||pw.length>72||!['operador','gerente'].includes(b.role))return bad(res,'Dados inválidos (senha: 8+ caracteres).');
  if(db.users.some(u=>u.email===email))return res.status(409).json({error:'E-mail já cadastrado.'});
  const u={id:nid(db.users),name,email,hash:bc.hashSync(pw,12),role:b.role,active:true};db.users.push(u);audit(req,'user.create',u.id);save();res.json(pub(u))});
app.patch('/api/users/:id',auth,need('gerente'),(req,res)=>{const u=db.users.find(x=>x.id===+req.params.id);if(!u)return res.status(404).json({error:'Usuário não encontrado.'});
  if(u.id===req.user.id)return bad(res,'Você não pode alterar a própria conta.');
  if(u.role!=='cliente'&&['operador','gerente'].includes(req.body.role))u.role=req.body.role;if(typeof req.body.active==='boolean')u.active=req.body.active;audit(req,'user.update',[u.id,u.role,u.active]);save();res.json(pub(u))});

const authorizeRole=need;
app.use('/api/admin',auth,require('./admin')({db,save,audit,authorizeRole,nid,S}));
app.use('/api',(req,res)=>res.status(404).json({error:'Rota não encontrada.'}));
app.use(express.static(path.join(__dirname,'public')));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Erro interno.'})});
app.listen(process.env.PORT||3000,()=>console.log('AutoShine em http://localhost:'+(process.env.PORT||3000)));
