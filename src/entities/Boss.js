export class Boss {
  constructor(){this.radius=132;this.maxHp=2600;this.modules=[];this.reset(0,0);}
  reset(w,h,arena=null){this.x=arena?arena.cx+arena.radius*.34:w*.70;this.y=arena?arena.cy:h*.50;this.angle=0;this.fireTimer=.7;this.attackTimer=1.2;this.attackIndex=0;this.phase=1;this.hp=this.maxHp;this.flash=0;this.modules=[
    {id:'armor-top',x:0,y:-92,w:62,h:42,hp:260,maxHp:260,type:'armor',alive:true},
    {id:'armor-bottom',x:0,y:92,w:62,h:42,hp:260,maxHp:260,type:'armor',alive:true},
    {id:'cannon-left',x:-100,y:0,w:48,h:62,hp:300,maxHp:300,type:'cannon',alive:true},
    {id:'cannon-right',x:100,y:0,w:48,h:62,hp:300,maxHp:300,type:'cannon',alive:true},
    {id:'shield-left',x:-66,y:-66,w:44,h:44,hp:240,maxHp:240,type:'shield',alive:true},
    {id:'shield-right',x:66,y:-66,w:44,h:44,hp:240,maxHp:240,type:'shield',alive:true},
    {id:'core',x:0,y:0,w:70,h:70,hp:1000,maxHp:1000,type:'core',alive:true}
  ];}
  update(dt,arena){this.angle+=dt*.42;this.flash=Math.max(0,this.flash-dt);const ratio=this.hp/this.maxHp;this.phase=ratio<.30?3:ratio<.62?2:1;this.attackTimer-=dt;this.fireTimer-=dt;const driftX=Math.cos(this.angle*.63)*arena.radius*.12;const driftY=Math.sin(this.angle*.8)*arena.radius*.10;this.x=arena.cx+arena.radius*.34+driftX;this.y=arena.cy+driftY;}
  modulePosition(m){const a=this.angle*.35,c=Math.cos(a),s=Math.sin(a);return{x:this.x+m.x*c-m.y*s,y:this.y+m.x*s+m.y*c};}
  moduleAt(x,y){let hit=null;let best=Infinity;for(const m of this.modules){if(!m.alive)continue;const p=this.modulePosition(m);const r=Math.max(m.w,m.h)*.55;if((x-p.x)**2+(y-p.y)**2<r*r&&r<best){hit=m;best=r;}}return hit;}
  damageModule(m,amount){if(!m||!m.alive)return;const multiplier=m.type==='core'?1.35:1;m.hp=Math.max(0,m.hp-amount*multiplier);this.hp=Math.max(0,this.hp-(m.type==='core'?amount:amount*.18));this.flash=.06;if(m.hp<=0){m.alive=false;if(m.type==='core')this.hp=0;}}
  alive(){return this.hp>0;}
  activeCannons(){return this.modules.filter(m=>m.alive&&m.type==='cannon');}
}
