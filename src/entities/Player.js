export class Player {
  constructor(){this.radius=17;this.speed=310;this.maxHp=100;this.maxShield=50;this.damage=34;this.fireRate=.14;this.reset(0,0);}
  reset(w,h){this.x=w*.2;this.y=h*.5;this.hp=this.maxHp;this.shield=this.maxShield;this.cooldown=0;}
  update(dt,input,w,h){const m=input.movement();const len=Math.hypot(m.x,m.y)||1;this.x=Math.max(this.radius,Math.min(w-this.radius,this.x+m.x/len*this.speed*dt));this.y=Math.max(this.radius,Math.min(h-this.radius,this.y+m.y/len*this.speed*dt));this.cooldown=Math.max(0,this.cooldown-dt);}
  takeDamage(amount){const absorbed=Math.min(this.shield,amount);this.shield-=absorbed;this.hp=Math.max(0,this.hp-(amount-absorbed));}
}
