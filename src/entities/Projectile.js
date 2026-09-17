export class Projectile {
  constructor(x,y,vx,vy,owner,damage){this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.owner=owner;this.damage=damage;this.radius=owner==='player'?5:7;this.life=3;}
  update(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;this.life-=dt;}
}
