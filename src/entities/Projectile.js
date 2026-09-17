export class Projectile {
  constructor(x,y,vx,vy,owner,damage=25){this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.owner=owner;this.damage=damage;this.radius=5;this.life=2.5;}
  update(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;this.life-=dt;}
}
