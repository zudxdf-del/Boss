export class HUD {
  constructor(root){this.root=root;}
  update(player,boss){const phase=['','I','II','III'][boss.phase];this.root.innerHTML=`<div class="title">BOSS</div><div class="bar"><i style="width:${Math.max(0,player.hp/player.maxHp*100)}%"></i></div><div>SHIP ${Math.ceil(player.hp)} HP · ${Math.ceil(player.shield)} SHIELD</div><div class="bar bossbar"><i style="width:${Math.max(0,boss.hp/boss.maxHp*100)}%"></i></div><div>BOSS ${Math.ceil(boss.hp)} HP · PHASE ${phase}</div><div class="hint">WASD / стрелки — движение · мышь/палец — прицел · FIRE — огонь</div>`;}
}
