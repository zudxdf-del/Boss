export class Camera {
  constructor(){this.x=0;this.y=0;this.w=0;this.h=0;this.smooth=10;}
  resize(w,h){this.w=w;this.h=h;}
  follow(target,arena,dt){const halfW=this.w*.5,halfH=this.h*.5;const minX=arena.cx-arena.radius+halfW,maxX=arena.cx+arena.radius-halfW;const minY=arena.cy-arena.radius+halfH,maxY=arena.cy+arena.radius-halfH;const tx=Math.max(minX,Math.min(maxX,target.x));const ty=Math.max(minY,Math.min(maxY,target.y));const k=1-Math.exp(-this.smooth*dt);this.x+=(tx-this.x)*k;this.y+=(ty-this.y)*k;}
  toScreen(x,y){return{x:x-this.x+this.w*.5,y:y-this.y+this.h*.5};}
  toWorld(x,y){return{x:x+this.x-this.w*.5,y:y+this.y-this.h*.5};}
}
