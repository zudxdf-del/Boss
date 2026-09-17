export class Boss {
  constructor(){this.radius=145;this.maxHp=2200;this.maxCore=900;this.modules=[];this.reset(0,0);}
  reset(w,h){this.x=w*.72;this.y=h*.5;this.angle=0;this.fireTimer=.8;this.phase=1;this.attackInterval=1.2;this.bulletSpeed=250;this.damage=12;this.hp=this.maxHp;this.modules=[{id:'left-cannon',x:-105,y:20,hp:260,maxHp:260,type:'cannon',alive:true},{id:'right-cannon',x:105,y:20,hp:260,maxHp:260,type:'cannon',alive:true},{id:'top-shield',x:0,y:-105,hp:360,maxHp:360,type:'shield',alive:true},{id:'core',x:0,y:0,hp:this.maxCore,maxHp:this.maxCore,type:'core',alive:true}];}
  update(dt,w,h){this.angle+=dt*.5;this.x=w*.72+Math.sin(this.angle*.7)*Math.min(90,w*.12);this.y=h*.5+Math.cos(this.angle*.55)*Math.min(55,h*.08);this.fireTimer-=dt;const ratio=this.hp/this.maxHp;this.phase=ratio<.33?3:ratio<.66?2:1;this.attackInterval=this.phase===3?.65:this.phase===2?.9:1.2;this.bulletSpeed=this.phase===3?330:this.phase===2?285:250;this.damage=this.phase===3?17:this.phase===2?14:12;}
  moduleAt(x,y){for(const m of this.modules){if(m.hp<=0)continue;const c=Math.cos(this.angle*.2),s=Math.sin(this.angle*.2),rx=m.x*c-m.y*s,ry=m.x*s+m.y*c;if((x-(this.x+rx))**2+(y-(this.y+ry))**2<32**2)return m;}return null;}
  damageModule(m,amount){if(m.type==='core'){m.hp=Math.max(0,m.hp-amount);this.hp=Math.max(0,this.hp-amount);}else{m.hp=Math.max(0,m.hp-amount);this.hp=Math.max(0,this.hp-amount*.12);}if(m.hp<=0)m.alive=false;}
  alive(){return this.hp>0;}
}
