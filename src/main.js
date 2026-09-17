import { Input } from './core/Input.js';
import { Arena } from './core/Arena.js';
import { Player } from './entities/Player.js';
import { Boss } from './entities/Boss.js';
import { Projectile } from './entities/Projectile.js';
import { Renderer } from './render/Renderer.js';
import { HUD } from './ui/HUD.js';
import { MobileControls } from './ui/MobileControls.js';

const canvas=document.querySelector('#game');
const renderer=new Renderer(canvas);
const input=new Input(canvas);
const arena=new Arena();
const player=new Player();
const boss=new Boss();
const hud=new HUD(document.querySelector('#hud'));
new MobileControls(input);
const menu=document.querySelector('#menu');
const start=document.querySelector('#start');
const projectiles=[];
const warnings=[];
let running=false,ended=false,last=performance.now();

function reset(){projectiles.length=0;warnings.length=0;arena.reset(renderer.w,renderer.h);player.reset(renderer.w,renderer.h);boss.reset(renderer.w,renderer.h);ended=false;running=true;menu.classList.add('hidden');start.textContent='НАЧАТЬ БОЙ';last=performance.now();}
start.addEventListener('click',reset);
addEventListener('resize',()=>{arena.reset(renderer.w,renderer.h);if(!running){player.reset(renderer.w,renderer.h);boss.reset(renderer.w,renderer.h);}});

function autoAim(){let target=null,best=Infinity;for(const m of boss.modules){if(!m.alive)continue;const p=boss.modulePosition(m);const d=(p.x-player.x)**2+(p.y-player.y)**2;if(d<best){best=d;target=p;}}return target||{x:boss.x,y:boss.y};}
function playerFire(){if(player.cooldown>0)return;const target=input.isTouchDevice?autoAim():input.getAim(player.x,player.y,renderer.w,renderer.h);const dx=target.x-player.x,dy=target.y-player.y,d=Math.hypot(dx,dy)||1;projectiles.push(new Projectile(player.x,player.y,dx/d*720,dy/d*720,'player',player.damage));player.cooldown=player.fireRate;}
function spawnAimBullet(x,y,targetX,targetY,speed,damage){const dx=targetX-x,dy=targetY-y,d=Math.hypot(dx,dy)||1;projectiles.push(new Projectile(x,y,dx/d*speed,dy/d*speed,'boss',damage));}
function spawnRadial(count,speed,damage,rotation=0){for(let i=0;i<count;i++){const a=rotation+i*Math.PI*2/count;projectiles.push(new Projectile(boss.x,boss.y,Math.cos(a)*speed,Math.sin(a)*speed,'boss',damage));}}
function bossAttack(){if(boss.attackTimer>0||!boss.alive())return;boss.attackTimer=boss.phase===3?.78:boss.phase===2?1.0:1.25;const cannons=boss.activeCannons();for(const m of cannons){const p=boss.modulePosition(m);spawnAimBullet(p.x,p.y,player.x,player.y,boss.phase===3?380:315,boss.phase===3?13:10);}if(boss.phase>=2){const rotation=boss.angle+boss.attackIndex*.21;spawnRadial(boss.phase===3?18:10,boss.phase===3?260:215,boss.phase===3?9:7,rotation);}if(boss.phase===3&&boss.attackIndex%3===0){const a=Math.atan2(player.y-boss.y,player.x-boss.x);for(let i=-2;i<=2;i++){const t=a+i*.12;projectiles.push(new Projectile(boss.x,boss.y,Math.cos(t)*430,Math.sin(t)*430,'boss',14));}}boss.attackIndex++;}
function updateWarnings(dt){for(let i=warnings.length-1;i>=0;i--){const w=warnings[i];w.ttl-=dt;if(w.ttl<=0){spawnRadial(w.count,w.speed,w.damage,w.rotation);warnings.splice(i,1);}}}
function collisions(){for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];if(p.owner==='player'){const module=boss.moduleAt(p.x,p.y);if(module){boss.damageModule(module,p.damage);projectiles.splice(i,1);continue;}}else if(Math.hypot(p.x-player.x,p.y-player.y)<player.radius+p.radius){player.takeDamage(p.damage);projectiles.splice(i,1);continue;}if(p.life<=0||!arena.contains(p.x,p.y,0)){projectiles.splice(i,1);}}}
function update(dt){arena.update(dt,renderer.w,renderer.h);player.update(dt,input,arena);boss.update(dt,arena);if(input.pointer.down)playerFire();bossAttack();updateWarnings(dt);for(const p of projectiles)p.update(dt);collisions();if(player.hp<=0||!boss.alive()){ended=true;running=false;menu.classList.remove('hidden');start.textContent=boss.alive()?'ПОВТОРИТЬ БОЙ':'ИГРАТЬ СНОВА';}}
function render(){renderer.clear();renderer.drawArena(arena);renderer.drawBoss(boss);renderer.drawWarnings(warnings);renderer.drawProjectiles(projectiles);renderer.drawPlayer(player);hud.update(player,boss);if(ended)renderer.drawResult(boss.alive()?'Корабль уничтожен':'Босс уничтожен');}
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;if(running)update(dt);render();requestAnimationFrame(loop)}
arena.reset(renderer.w,renderer.h);player.reset(renderer.w,renderer.h);boss.reset(renderer.w,renderer.h);requestAnimationFrame(loop);
