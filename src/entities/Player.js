export class Player {
  constructor() { this.x=0; this.y=0; this.radius=18; this.speed=300; this.hp=100; this.maxHp=100; this.cooldown=0; }
  update(dt, input, w, h) {
    const m=input.movement(); const len=Math.hypot(m.x,m.y)||1;
    this.x=Math.max(this.radius,Math.min(w-this.radius,this.x+m.x/len*this.speed*dt));
    this.y=Math.max(this.radius,Math.min(h-this.radius,this.y+m.y/len*this.speed*dt));
    this.cooldown=Math.max(0,this.cooldown-dt);
  }
}
