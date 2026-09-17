export class Boss {
  constructor() {
    this.x=0; this.y=0; this.radius=120; this.maxHp=1200; this.hp=1200; this.angle=0; this.fireTimer=0;
    this.modules=[
      {id:'cannon-left',x:-95,y:15,hp:180,maxHp:180,type:'cannon'},
      {id:'cannon-right',x:95,y:15,hp:180,maxHp:180,type:'cannon'},
      {id:'shield',x:0,y:-100,hp:240,maxHp:240,type:'shield'},
      {id:'core',x:0,y:0,hp:600,maxHp:600,type:'core'}
    ];
  }
  update(dt,w) { this.angle+=dt*0.35; this.x=w/2+Math.sin(this.angle)*Math.min(110,w*0.18); this.fireTimer-=dt; }
  moduleAt(x,y) { for(const m of this.modules){ if(m.hp<=0) continue; const dx=x-(this.x+m.x),dy=y-(this.y+m.y); if(dx*dx+dy*dy<34*34)return m; } return null; }
  alive(){ return this.hp>0; }
}
