/* Painel Administrativo: rotas + controllers (montado em /api/admin, já atrás de auth/JWT) */
const express=require('express');
module.exports=({db,save,audit,authorizeRole,nid,S})=>{
  const r=express.Router();
  const ok=(res,data,st=200)=>res.status(st).json({ok:true,data});
  const fail=(res,st,error,code)=>res.status(st).json({ok:false,error,code});
  const staff=authorizeRole('gerente','operador'),gerente=authorizeRole('gerente');
  const money=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=10000;
  const isG=q=>q.user.role==='gerente';

  /* ===== Serviços (preço e exclusão: só Gerente) ===== */
  r.get('/services',staff,(q,s)=>ok(s,db.services.map(x=>isG(q)?x:{id:x.id,name:x.name,desc:x.desc})));
  r.post('/services',staff,(q,s)=>{const b=q.body||{},name=S(b.name,60),desc=S(b.desc,200);
    if(name.length<2)return fail(s,400,'Informe o nome do serviço.','VALIDATION');
    if(db.services.some(x=>x.name.toLowerCase()===name.toLowerCase()))return fail(s,409,'Já existe um serviço com este nome.','DUPLICATE');
    let price=0;if(b.price!==undefined){if(!isG(q))return fail(s,403,'Apenas o Gerente pode definir preços.','FORBIDDEN_PRICE');if(!money(b.price))return fail(s,400,'Preço inválido.','VALIDATION');price=b.price}
    const x={id:'s'+Date.now().toString(36),name,desc,price};db.services.push(x);audit(q,'service.create',x.id);save();ok(s,x,201)});
  r.put('/services/:id',staff,(q,s)=>{const x=db.services.find(v=>v.id===q.params.id);if(!x)return fail(s,404,'Serviço não encontrado.','NOT_FOUND');
    const b=q.body||{},name=b.name===undefined?x.name:S(b.name,60);
    if(name.length<2)return fail(s,400,'Informe o nome do serviço.','VALIDATION');
    if(db.services.some(v=>v!==x&&v.name.toLowerCase()===name.toLowerCase()))return fail(s,409,'Já existe um serviço com este nome.','DUPLICATE');
    if(b.price!==undefined&&b.price!==x.price){if(!isG(q))return fail(s,403,'Apenas o Gerente pode alterar preços.','FORBIDDEN_PRICE');if(!money(b.price))return fail(s,400,'Preço inválido.','VALIDATION');audit(q,'service.price',[x.id,x.price,b.price]);x.price=b.price}
    x.name=name;if(b.desc!==undefined)x.desc=S(b.desc,200);audit(q,'service.update',x.id);save();ok(s,x)});
  r.delete('/services/:id',gerente,(q,s)=>{const i=db.services.findIndex(v=>v.id===q.params.id);if(i<0)return fail(s,404,'Serviço não encontrado.','NOT_FOUND');
    const[x]=db.services.splice(i,1);audit(q,'service.delete',x.id);save();ok(s,{id:x.id})}); // OS antigas guardam nome e preço, então não são afetadas

  /* ===== Placeholders ===== */
  const KEY=/^[a-z]{2,15}\.[a-z]{2,15}$/;
  r.get('/placeholders',staff,(q,s)=>ok(s,db.placeholders));
  r.post('/placeholders',staff,(q,s)=>{const key=S(q.body.key,31).toLowerCase(),text=S(q.body.text,100);
    if(!KEY.test(key)||!text)return fail(s,400,'Chave no formato tela.campo (ex.: ops.plate) e texto são obrigatórios.','VALIDATION');
    if(db.placeholders.some(x=>x.key===key))return fail(s,409,'Já existe um placeholder com esta chave.','DUPLICATE');
    const x={id:nid(db.placeholders),key,text};db.placeholders.push(x);audit(q,'ph.create',key);save();ok(s,x,201)});
  r.put('/placeholders/:id',staff,(q,s)=>{const x=db.placeholders.find(v=>v.id===+q.params.id),text=S(q.body.text,100);
    if(!x)return fail(s,404,'Placeholder não encontrado.','NOT_FOUND');if(!text)return fail(s,400,'Informe o texto.','VALIDATION');
    x.text=text;audit(q,'ph.update',x.key);save();ok(s,x)});
  r.delete('/placeholders/:id',staff,(q,s)=>{const i=db.placeholders.findIndex(v=>v.id===+q.params.id);if(i<0)return fail(s,404,'Placeholder não encontrado.','NOT_FOUND');
    const[x]=db.placeholders.splice(i,1);audit(q,'ph.delete',x.key);save();ok(s,{id:x.id})});

  /* ===== Marcas e Cores (mesmo controller) ===== */
  for(const[path,coll,label]of[['brands','brands','marca'],['colors','colors','cor']]){
    r.get('/'+path,staff,(q,s)=>ok(s,db[coll]));
    r.post('/'+path,staff,(q,s)=>{const name=S(q.body.name,30);if(name.length<2)return fail(s,400,'Informe o nome da '+label+'.','VALIDATION');
      if(db[coll].some(x=>x.name.toLowerCase()===name.toLowerCase()))return fail(s,409,'Esta '+label+' já está cadastrada.','DUPLICATE');
      const x={id:nid(db[coll]),name};db[coll].push(x);audit(q,coll+'.create',name);save();ok(s,x,201)});
    r.delete('/'+path+'/:id',staff,(q,s)=>{const i=db[coll].findIndex(v=>v.id===+q.params.id);if(i<0)return fail(s,404,'Item não encontrado.','NOT_FOUND');
      const[x]=db[coll].splice(i,1);audit(q,coll+'.delete',x.name);save();ok(s,{id:x.id})});
  }
  return r;
};
