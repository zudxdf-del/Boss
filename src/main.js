import {Input} from './core/Input.js';
import {Player} from './entities/Player.js';
import {Boss} from './entities/Boss.js';
import {Projectile} from './entities/Projectile.js';
import {Renderer} from './render/Renderer.js';
import {HUD} from './ui/HUD.js';
import {MobileControls} from './ui/MobileControls.js';

const canvas=document.querySelector('#game');
const renderer=new Renderer(canvas),input=new Input(canvas),player=new Player(),boss=new Boss();
const hud=new HUD(document.querySelector('#hud'));new MobileControls(input);
const projectiles=[];let last=performance.now(),over=false;
function resize(){player.x=renderer.w*.22;player.y=renderer.h*.5;boss.y=renderer.h*.5;}
resize();addEventListener('resize',resize);
function fire(){if(player.cooldown>0)return;const dx=input.pointer.x-player.x,dy=input.pointer.y-player.y,d=Math.hypot(dx,dy)||1;projectiles.push(new Projectile(player.x,player.y,dx/d*650,dy/d*650,'player',30));player.cooldown=.14;}
function bossFire(){if(boss.fireTimer>0||!boss.alive())return;boss.fireTimer=1.25;const dx=player.x-boss.x,dy=player.y-boss.y,d=Math.hypot(dx,dy)||1;projectiles.push(new Projectile(boss.x,boss.y,dx/d*260,dy/d*260,'boss',12));}
function hitTest(){for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];if(p.owner==='player'){const m=boss.moduleAt(p.x,p.y);if(m){m.hp=Math.max(0,m.hp-p.damage);boss.hp=Math.max(0,boss.hp-(m.type==='core'?p.damage:p.damage*.12));projectiles.splice(i,1);}}else if(Math.hypot(p.x-player.x,p.y-player.y)<player.radius+p.radius){player.hp=Math.max(0,player.hp-p.damage);projectiles.splice(i,1);}}}
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;if(!over){player.update(dt,input,renderer.w,renderer.h);boss.update(dt,renderer.w);if(input.pointer.down)fire();bossFire();for(const p of projectiles)p.update(dt);hitTest();for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];if(p.life<=0||p.x<-20||p.x>renderer.w+20||p.y<-20||p.y>renderer.h+20)projectiles.splice(i,1);}over=player.hp<=0||boss.hp<=0;}renderer.clear();renderer.drawBoss(boss);renderer.drawPlayer(player);renderer.drawProjectiles(projectiles);hud.update(player,boss);if(over){renderer.ctx.fillStyle='#fff';renderer.ctx.font='700 32px system-ui';renderer.ctx.textAlign='center';renderer.ctx.fillText(boss.hp<=0?'BOSS DESTROYED':'SHIP DESTROYED',renderer.w/2,renderer.h/2);}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
