export class Renderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.resize();addEventListener('resize',()=>this.resize());}
  resize(){const d=devicePixelRatio||1;this.canvas.width=innerWidth*d;this.canvas.height=innerHeight*d;this.canvas.style.width=innerWidth+'px';this.canvas.style.height=innerHeight+'px';this.ctx.setTransform(d,0,0,d,0,0);this.w=innerWidth;this.h=innerHeight;}
  clear(){this.ctx.fillStyle='#070914';this.ctx.fillRect(0,0,this.w,this.h);}
  circle(x,y,r,fill,stroke){const c=this.ctx;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
  drawPlayer(p){this.circle(p.x,p.y,p.radius,'#69d7ff','#d9f7ff');this.circle(p.x+12,p.y,5,'#fff');}
  drawBoss(b){const c=this.ctx;c.save();c.translate(b.x,b.y);c.rotate(b.angle*0.2);this.circle(0,0,b.radius,'#171b2d','#6976a8');for(const m of b.modules){if(m.hp<=0)continue;const active=m.type==='core'?'#ffb84d':m.type==='shield'?'#8b7cff':'#ff5c78';this.circle(m.x,m.y,30,active,'#fff');c.fillStyle='#111';c.fillRect(m.x-22,m.y+35,44,4);c.fillStyle='#62e6a5';c.fillRect(m.x-22,m.y+35,44*Math.max(0,m.hp/m.maxHp),4);}c.restore();}
  drawProjectiles(ps){for(const p of ps)this.circle(p.x,p.y,p.radius,p.owner==='player'?'#ffe36e':'#ff6b8a');}
}
