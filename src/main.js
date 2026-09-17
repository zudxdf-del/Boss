import { Input } from './core/Input.js';
import { Player } from './entities/Player.js';
import { Boss } from './entities/Boss.js';
import { Projectile } from './entities/Projectile.js';
import { Renderer } from './render/Renderer.js';
import { HUD } from './ui/HUD.js';
import { MobileControls } from './ui/MobileControls.js';

const canvas=document.querySelector('#game');
const renderer=new Renderer(canvas);
const input=new Input(canvas);
const player=new Player();
const boss=new Boss();
const hud=new HUD(document.querySelector('#hud'));
new MobileControls(input);
const menu=document.querySelector('#menu');
const start=document.querySelector('#start');
const projectiles=[];
let running=false,ended=false,last=performance.now();

function reset(){projectiles.length=0;player.reset(renderer.w,renderer.h);boss.reset(renderer.w,renderer.h);ended=false;running=true;menu.classList.add('hidden');last=performance.now();}
start.addEventListener('click',reset);
addEventListener('resize',()=>{if(!running)player.reset(renderer.w,renderer.h);});

function playerFire(){
  if(player.cooldown>0)return;
  const target=input.getAim(player.x,player.y,renderer.w,renderer.h);
  const dx=target.x-player.x,dy=target.y-player.y,d=Math.hypot(dx,dy)||1;
  projectiles.push(new Projectile(player.x,player.y,dx/d*680,dy/d*680,'player',player.damage));
  player.cooldown=player.fireRate;
}
function bossFire(){
  if(boss.fireTimer>0||!boss.alive())return;
  boss.fireTimer=boss.attackInterval;
  const count=boss.phase>=3?5:boss.phase>=2?3:1;
  const base=Math.atan2(player.y-boss.y,player.x-boss.x);
  for(let i=0;i<count;i++){
    const offset=count===1?0:(i-(count-1)/2)*0.18;
    const a=base+offset;
    projectiles.push(new Projectile(boss.x,boss.y,Math.cos(a)*boss.bulletSpeed,Math.sin(a)*boss.bulletSpeed,'boss',boss.damage));
  }
}
function collisions(){
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i];
    if(p.owner==='player'){
      const module=boss.moduleAt(p.x,p.y);
      if(module){boss.damageModule(module,p.damage);projectiles.splice(i,1);continue;}
    }else if(Math.hypot(p.x-player.x,p.y-player.y)<player.radius+p.radius){
      player.takeDamage(p.damage);projectiles.splice(i,1);continue;
    }
    if(p.life<=0||p.x<-50||p.x>renderer.w+50||p.y<-50||p.y>renderer.h+50)projectiles.splice(i,1);
  }
}
function update(dt){
  player.update(dt,input,renderer.w,renderer.h);
  boss.update(dt,renderer.w,renderer.h);
  if(input.pointer.down)playerFire();
  bossFire();
  for(const p of projectiles)p.update(dt);
  collisions();
  if(player.hp<=0||!boss.alive()){ended=true;running=false;menu.classList.remove('hidden');document.querySelector('#start').textContent=boss.alive()?'ПОВТОРИТЬ БОЙ':'ИГРАТЬ СНОВА';}
}
function render(){renderer.clear();renderer.drawArena();renderer.drawBoss(boss);renderer.drawPlayer(player);renderer.drawProjectiles(projectiles);hud.update(player,boss);if(ended)renderer.drawResult(boss.alive()?'Корабль уничтожен':'Босс уничтожен');}
function loop(now){const dt=Math.min(0.033,(now-last)/1000);last=now;if(running)update(dt);render();requestAnimationFrame(loop)}
player.reset(renderer.w,renderer.h);boss.reset(renderer.w,renderer.h);requestAnimationFrame(loop);
