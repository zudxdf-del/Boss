export class Input {
  constructor(canvas){
    this.keys=new Set();
    this.pointer={x:0,y:0,down:false};
    addEventListener('keydown',e=>{this.keys.add(e.key.toLowerCase());if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault();});
    addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('pointermove',e=>this.setPointer(e,canvas));
    canvas.addEventListener('pointerdown',e=>{this.setPointer(e,canvas);this.pointer.down=true;});
    addEventListener('pointerup',()=>this.pointer.down=false);
  }
  setPointer(e,canvas){const r=canvas.getBoundingClientRect();this.pointer.x=e.clientX-r.left;this.pointer.y=e.clientY-r.top;}
  down(...keys){return keys.some(k=>this.keys.has(k));}
  movement(){return{x:(this.down('d','arrowright')?1:0)-(this.down('a','arrowleft')?1:0),y:(this.down('s','arrowdown')?1:0)-(this.down('w','arrowup')?1:0)};}
  getAim(px,py,w,h){if(this.pointer.x===0&&this.pointer.y===0)return{x:w,y:py};return this.pointer;}
}
