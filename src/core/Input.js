export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pointer = { x: canvas.width / 2, y: canvas.height / 2, down: false };
    addEventListener('keydown', e => this.keys.add(e.key.toLowerCase()));
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('pointermove', e => { const r=canvas.getBoundingClientRect(); this.pointer.x=e.clientX-r.left; this.pointer.y=e.clientY-r.top; });
    canvas.addEventListener('pointerdown', () => this.pointer.down=true);
    addEventListener('pointerup', () => this.pointer.down=false);
  }
  down(...keys) { return keys.some(k => this.keys.has(k)); }
  movement() { return { x:(this.down('d','arrowright')?1:0)-(this.down('a','arrowleft')?1:0), y:(this.down('s','arrowdown')?1:0)-(this.down('w','arrowup')?1:0) }; }
}
