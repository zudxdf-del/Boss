export class Player {
  constructor(){this.radius=16;this.speed=285;this.maxHp=100;this.maxShield=50;this.damage=30;this.fireRate=.11;this.reset(0,0);}
  reset(w,h){this.x=w*.27;this.y=h*.5;this.hp=this.maxHp;this.shield=this.maxShield;this.cooldown=0;}
  update(dt,input,arena){const m=input.movement();const len=Math.hypot(m.x,m.y)||1;let x=this.x+m.x/len*this.speed*dt;let y=this.y+m.y/len*this.speed*dt;const p=arena.clamp(x,y,this.radius);this.x=p.x;this.y=p.y;this.cooldown=Math.max(0,this.cooldown-dt);}
  takeDamage(amount){const absorbed=Math.min(this.shield,amount);this.shield-=absorbed;this.hp=Math.max(0,this.hp-(amount-absorbed));}
}
