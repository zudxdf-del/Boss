export class MobileControls {
  constructor(input){
    document.querySelectorAll('[data-key]').forEach(button=>{const key=button.dataset.key;const mapped={up:'w',down:'s',left:'a',right:'d'}[key];const press=e=>{e.preventDefault();button.setPointerCapture?.(e.pointerId);input.keys.add(mapped);};const release=e=>{e.preventDefault();input.keys.delete(mapped);};button.addEventListener('pointerdown',press);button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('pointerleave',e=>{if(e.buttons===0)release(e);});});
    const fire=document.querySelector('#fire-button');
    const on=e=>{e.preventDefault();fire.setPointerCapture?.(e.pointerId);input.pointer.down=true;};
    const off=e=>{e.preventDefault();input.pointer.down=false;};
    fire.addEventListener('pointerdown',on);fire.addEventListener('pointerup',off);fire.addEventListener('pointercancel',off);fire.addEventListener('pointerleave',e=>{if(e.buttons===0)off(e);});
  }
}
