export class CombatSystem {
  firePlayer(player,target,projectiles){if(player.cooldown>0)return;const dx=target.x-player.x,dy=target.y-player.y,d=Math.hypot(dx,dy)||1;projectiles.push(new this.Projectile(player.x,player.y,dx/d*620,dy/d*620,'player',28));player.cooldown=.16;}
  update(projectiles,player,boss,w,h){for(const p of projectiles)p.update(1/60);for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];let remove=p.life<=0||p.x<0||p.y<0||p.x>w||p.y>h;if(!remove&&p.owner==='player'){const m=boss.moduleAt(p.x,p.y);if(m){m.hp=Math.max(0,m.hp-p.damage);boss.hp=Math.max(0,boss.hp-(m.type==='core'?p.damage:p.damage*.15));remove=true;}}if(!remove&&p.owner==='boss'){if(Math.hypot(p.x-player.x,p.y-player.y)<player.radius+p.radius){player.hp=Math.max(0,player.hp-p.damage);remove=true;}}if(remove)projectiles.splice(i,1);}}
  setProjectileClass(Projectile){this.Projectile=Projectile;}
}
