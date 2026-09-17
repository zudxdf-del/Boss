export class Renderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.resize();addEventListener('resize',()=>this.resize());}
  resize(){const d=Math.min(devicePixelRatio||1,2);this.canvas.width=innerWidth*d;this.canvas.height=innerHeight*d;this.canvas.style.width='100%';this.canvas.style.height='100%';this.ctx.setTransform(d,0,0,d,0,0);this.w=innerWidth;this.h=innerHeight;}
  clear(){const c=this.ctx;c.fillStyle='#050713';c.fillRect(0,0,this.w,this.h);}
  drawArena(){const c=this.ctx;c.save();c.strokeStyle='rgba(120,160,255,.08)';c.lineWidth=1;const gap=70;for(let x=0;x<this.w;x+=gap){c.beginPath();c.moveTo(x,0);c.lineTo(x,this.h);c.stroke();}for(let y=0;y<this.h;y+=gap){c.beginPath();c.moveTo(0,y);c.lineTo(this.w,y);c.stroke();}c.restore();}
  circle(x,y,r,fill,stroke){const c=this.ctx;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
  drawPlayer(p){const c=this.ctx;c.save();c.translate(p.x,p.y);c.rotate(-Math.PI/2);c.beginPath();c.moveTo(22,0);c.lineTo(-15,-13);c.lineTo(-8,0);c.lineTo(-15,13);c.closePath();c.fillStyle='#65d9ff';c.fill();c.strokeStyle='#e7fbff';c.stroke();c.restore();}
  drawBoss(b){const c=this.ctx;c.save();c.translate(b.x,b.y);c.rotate(b.angle*.2);this.circle(0,0,b.radius,'#151a30','#6876aa');this.circle(0,0,112,'#0b0f20','#313a63');for(const m of b.modules){if(m.hp<=0)continue;const fill=m.type==='core'?'#ffbd4a':m.type==='shield'?'#8c7dff':'#ff5878';this.circle(m.x,m.y,m.type==='core'?34:29,fill,'#fff');c.fillStyle='#111827';c.fillRect(m.x-28,m.y+36,56,5);c.fillStyle='#67e39b';c.fillRect(m.x-28,m.y+36,56*Math.max(0,m.hp/m.maxHp),5);}c.restore();}
  drawProjectiles(ps){for(const p of ps)this.circle(p.x,p.y,p.radius,p.owner==='player'?'#ffe56a':'#ff6688');}
  drawResult(text){const c=this.ctx;c.fillStyle='rgba(0,0,0,.48)';c.fillRect(0,0,this.w,this.h);c.fillStyle='#fff';c.font='900 36px system-ui';c.textAlign='center';c.fillText(text,this.w/2,this.h/2);}
}
