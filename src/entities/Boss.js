export class Boss {
  constructor(){this.radius=0;this.maxHp=2600;this.modules=[];this.reset(0,0);}
  reset(w,h,arena=null){this.x=arena?arena.cx+arena.radius*.34:w*.70;this.y=arena?arena.cy:h*.50;this.angle=0;this.fireTimer=.7;this.attackTimer=1.2;this.attackIndex=0;this.phase=1;this.hp=this.maxHp;this.flash=0;this.modules=[
    {id:'armor-top',x:0,y:-126,size:84,hp:260,maxHp:260,type:'armor',alive:true},
    {id:'armor-top-left',x:-84,y:-84,size:84,hp:220,maxHp:220,type:'armor',alive:true},
    {id:'armor-top-right',x:84,y:-84,size:84,hp:220,maxHp:220,type:'armor',alive:true},
    {id:'armor-left',x:-126,y:0,size:84,hp:260,maxHp:260,type:'armor',alive:true},
    {id:'armor-right',x:126,y:0,size:84,hp:260,maxHp:260,type:'armor',alive:true},
    {id:'armor-bottom-left',x:-84,y:84,size:84,hp:220,maxHp:220,type:'armor',alive:true},
    {id:'armor-bottom-right',x:84,y:84,size:84,hp:220,maxHp:220,type:'armor',alive:true},
    {id:'armor-bottom',x:0,y:126,size:84,hp:260,maxHp:260,type:'armor',alive:true},
    {id:'cannon-left',x:-126,y:0,size:84,hp:300,maxHp:300,type:'cannon',alive:true},
    {id:'cannon-right',x:126,y:0,size:84,hp:300,maxHp:300,type:'cannon',alive:true},
    {id:'shield-top',x:0,y:-84,size:84,hp:240,maxHp:240,type:'shield',alive:true},
    {id:'shield-bottom',x:0,y:84,size:84,hp:240,maxHp:240,type:'shield',alive:true},
    {id:'core',x:0,y:0,size:84,hp:1000,maxHp:1000,type:'core',alive:true}
  ];this.radius=168;}
  update(dt,arena){this.angle+=dt*.42;this.flash=Math.max(0,this.flash-dt);const ratio=this.hp/this.maxHp;this.phase=ratio<.30?3:ratio<.62?2:1;this.attackTimer-=dt;this.fireTimer-=dt;const driftX=Math.cos(this.angle*.63)*arena.radius*.12;const driftY=Math.sin(this.angle*.8)*arena.radius*.10;this.x=arena.cx+arena.radius*.34+driftX;this.y=arena.cy+driftY;}
  modulePosition(m){const a=this.angle*.35,c=Math.cos(a),s=Math.sin(a);return{x:this.x+m.x*c-m.y*s,y:this.y+m.x*s+m.y*c};}
  moduleAt(x,y){let hit=null;let best=Infinity;for(const m of this.modules){if(!m.alive)continue;const p=this.modulePosition(m);const half=m.size*.5;if(Math.abs(x-p.x)<=half&&Math.abs(y-p.y)<=half){const d=Math.hypot(x-p.x,y-p.y);if(d<best){hit=m;best=d;}}}return hit;}
  damageModule(m,amount){if(!m||!m.alive)return;const multiplier=m.type==='core'?1.35:1;m.hp=Math.max(0,m.hp-amount*multiplier);this.hp=Math.max(0,this.hp-(m.type==='core'?amount:amount*.18));this.flash=.06;if(m.hp<=0){m.alive=false;if(m.type==='core')this.hp=0;}}
  alive(){return this.hp>0;}
  activeCannons(){return this.modules.filter(m=>m.alive&&m.type==='cannon');}
}
