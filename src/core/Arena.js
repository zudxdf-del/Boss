export class Arena {
  constructor(){this.cx=0;this.cy=0;this.radius=0;this.time=0;this.w=0;this.h=0;}
  reset(w,h){this.w=w;this.h=h;this.cx=w*.5;this.cy=h*.5;this.radius=Math.min(w,h)*.43;this.time=0;}
  update(dt,w,h){if(w!==this.w||h!==this.h)this.reset(w,h);this.time+=dt;}
  clamp(x,y,r){const dx=x-this.cx,dy=y-this.cy,d=Math.hypot(dx,dy)||1;const max=Math.max(1,this.radius-r);if(d>max)return{x:this.cx+dx/d*max,y:this.cy+dy/d*max};return{x,y};}
  contains(x,y,r=0){return Math.hypot(x-this.cx,y-this.cy)<=this.radius-r;}
}
