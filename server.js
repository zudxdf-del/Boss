import http from 'node:http';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { WebSocketServer } from 'ws';

const PORT=Number(process.env.PORT||3000),MAX_PLAYERS=4,TICK=30;
const WORLD={width:1000,height:1000,cx:500,cy:500,radius:430};
const rooms=new Map();
const id=()=>crypto.randomBytes(4).toString('hex');
const code=()=>{let c;do c=Math.random().toString(36).slice(2,8).toUpperCase();while(rooms.has(c));return c};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const send=(ws,d)=>{if(ws.readyState===1)ws.send(JSON.stringify(d))};
const playersView=r=>r.players.map((p,i)=>({id:p.id,name:p.name,x:p.x,y:p.y,hp:p.hp,score:p.score,color:p.color,host:i===0}));
const roomInfo=r=>({type:'room',code:r.code,count:r.players.length,max:MAX_PLAYERS,phase:r.phase,hostId:r.players[0]?.id||null,players:playersView(r)});
const snapshot=r=>({type:'state',phase:r.phase,hostId:r.players[0]?.id||null,players:playersView(r),boss:r.boss,bullets:r.bullets});
const broadcast=(r,d)=>r.players.forEach(p=>send(p.ws,d));
function createRoom(){const c=code();const r={code:c,players:[],phase:'waiting',bullets:[],boss:{x:500,y:300,hp:500,maxHp:500,angle:0,shotTimer:45,modules:[90,90,90,90,90,90]}};rooms.set(c,r);return r}
function reset(r){r.phase='playing';r.bullets=[];r.boss={x:500,y:300,hp:500,maxHp:500,angle:0,shotTimer:45,modules:[90,90,90,90,90,90]};r.players.forEach((p,i)=>{const a=-Math.PI/2+i*Math.PI/2;p.x=500+Math.cos(a)*300;p.y=500+Math.sin(a)*300;p.hp=100;p.score=0;p.cooldown=0})}
function insideArena(x,y){return Math.hypot(x-500,y-500)<=405}
function fire(r,p){if(r.phase!=='playing'||p.cooldown>0||p.hp<=0)return;p.cooldown=6;const dx=r.boss.x-p.x,dy=r.boss.y-p.y,l=Math.hypot(dx,dy)||1;r.bullets.push({id:id(),owner:p.id,x:p.x,y:p.y,vx:dx/l*15,vy:dy/l*15,life:100,enemy:false})}
function bossFire(r){const live=r.players.filter(p=>p.hp>0);if(!live.length)return;for(const target of live){const dx=target.x-r.boss.x,dy=target.y-r.boss.y,l=Math.hypot(dx,dy)||1;r.bullets.push({id:id(),owner:'boss',x:r.boss.x,y:r.boss.y,vx:dx/l*4.8,vy:dy/l*4.8,life:190,enemy:true})}}
setInterval(()=>{for(const r of rooms.values()){
 if(r.phase==='playing'){
  r.boss.angle+=.025;r.boss.x=500+Math.cos(r.boss.angle)*120;r.boss.y=300+Math.sin(r.boss.angle)*45;r.boss.shotTimer--;if(r.boss.shotTimer<=0){bossFire(r);r.boss.shotTimer=65}
  for(const p of r.players){p.x+=p.input.x*7;p.y+=p.input.y*7;const dx=p.x-500,dy=p.y-500,d=Math.hypot(dx,dy),max=390;if(d>max){const k=max/d;p.x=500+dx*k;p.y=500+dy*k}if(p.cooldown>0)p.cooldown--}
  const next=[];
  for(const b of r.bullets){b.x+=b.vx;b.y+=b.vy;b.life--;if(b.life<=0||!insideArena(b.x,b.y))continue;if(!b.enemy&&Math.hypot(b.x-r.boss.x,b.y-r.boss.y)<90){r.boss.hp=Math.max(0,r.boss.hp-5);const p=r.players.find(x=>x.id===b.owner);if(p)p.score+=5;continue}if(b.enemy){const p=r.players.find(x=>x.hp>0&&Math.hypot(b.x-x.x,b.y-x.y)<23);if(p){p.hp=Math.max(0,p.hp-10);continue}}next.push(b)}r.bullets=next;
  if(r.boss.hp<=0)r.phase='won';else if(r.players.length&&r.players.every(p=>p.hp<=0))r.phase='lost';
 }
 broadcast(r,snapshot(r));
}},1000/TICK);
const server=http.createServer(async(req,res)=>{if(req.url==='/health'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true,rooms:rooms.size}))}if(req.url==='/'||req.url==='/index.html'){try{const html=await readFile(new URL('./public/index.html',import.meta.url),'utf8');res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-cache'});return res.end(html)}catch{res.writeHead(500);return res.end('Client unavailable')}}res.writeHead(404);res.end('Not found')});
const wss=new WebSocketServer({server});
wss.on('connection',ws=>{const p={id:id(),ws,room:null,name:'Pilot',x:500,y:800,hp:100,score:0,color:'#63d8ff',cooldown:0,input:{x:0,y:0}};send(ws,{type:'hello',id:p.id,maxPlayers:MAX_PLAYERS,world:WORLD});ws.on('message',raw=>{let m;try{m=JSON.parse(raw.toString())}catch{return};if(m.type==='create'){if(!p.room)join(createRoom(),p,m.name);return}if(m.type==='join'){if(p.room)return;const r=rooms.get(String(m.code||'').toUpperCase());if(!r)return send(ws,{type:'error',message:'Комната не найдена'});if(r.players.length>=MAX_PLAYERS)return send(ws,{type:'error',message:'Комната заполнена'});if(r.phase!=='waiting')return send(ws,{type:'error',message:'Игра уже началась'});join(r,p,m.name);return}if(!p.room)return;if(m.type==='input'){p.input.x=clamp(Number(m.x)||0,-1,1);p.input.y=clamp(Number(m.y)||0,-1,1)}else if(m.type==='fire')fire(p.room,p);else if(m.type==='start'&&p.room.players[0]===p&&p.room.phase==='waiting'){reset(p.room);broadcast(p.room,roomInfo(p.room))}else if(m.type==='restart'&&p.room.players[0]===p&&p.room.phase!=='playing'){reset(p.room);broadcast(p.room,roomInfo(p.room))}});ws.on('close',()=>{if(!p.room)return;const r=p.room;r.players=r.players.filter(x=>x!==p);if(!r.players.length)rooms.delete(r.code);else broadcast(r,roomInfo(r))})});
function join(r,p,name){p.room=r;p.name=String(name||'Pilot').slice(0,16);p.color=['#63d8ff','#b58cff','#ff6b9a','#ffd166'][r.players.length];r.players.push(p);send(p.ws,{type:'joined',code:r.code,playerId:p.id,hostId:r.players[0].id,phase:r.phase,players:playersView(r)});broadcast(r,roomInfo(r))}
server.listen(PORT,()=>console.log(`Boss server listening on ${PORT}`));
