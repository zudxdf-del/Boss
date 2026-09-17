import http from 'node:http';
import crypto from 'node:crypto';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 3000);
const MAX_PLAYERS = 4;
const WORLD = { width: 1600, height: 900 };
const TICK = 30;
const players = new Map();
const rooms = new Map();

function id() { return crypto.randomBytes(4).toString('hex'); }
function roomCode() {
  let code;
  do code = Math.random().toString(36).slice(2, 8).toUpperCase(); while (rooms.has(code));
  return code;
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function send(ws, data) { if (ws.readyState === 1) ws.send(JSON.stringify(data)); }
function broadcast(room, data) { for (const p of room.players) send(p.ws, data); }
function snapshot(room) {
  return {
    type: 'state',
    players: room.players.map(p => ({ id: p.id, name: p.name, x: p.x, y: p.y, hp: p.hp, score: p.score, color: p.color })),
    boss: room.boss,
    bullets: room.bullets.map(b => ({ id: b.id, owner: b.owner, x: b.x, y: b.y, vx: b.vx, vy: b.vy })),
    phase: room.phase
  };
}
function createRoom() {
  const code = roomCode();
  const room = {
    code, players: [], bullets: [], phase: 'waiting',
    boss: { x: WORLD.width / 2, y: 180, hp: 300, maxHp: 300, angle: 0, modules: [80,80,80,80,80,80] }
  };
  rooms.set(code, room);
  return room;
}
function leave(p) {
  const room = p.room;
  if (!room) return;
  room.players = room.players.filter(x => x !== p);
  players.delete(p.id);
  broadcast(room, { type: 'room', count: room.players.length, max: MAX_PLAYERS });
  if (room.players.length === 0) rooms.delete(room.code);
}
function fire(room, p) {
  if (p.cooldown > 0 || p.hp <= 0 || room.phase !== 'playing') return;
  p.cooldown = 7;
  const dx = room.boss.x - p.x;
  const dy = room.boss.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  room.bullets.push({ id: id(), owner: p.id, x: p.x, y: p.y, vx: dx / len * 14, vy: dy / len * 14, life: 100 });
}
function resetGame(room) {
  room.phase = 'playing';
  room.bullets = [];
  room.boss.hp = room.boss.maxHp;
  room.boss.angle = 0;
  room.boss.modules = [80,80,80,80,80,80];
  room.players.forEach((p, i) => { p.x = 350 + (i % 2) * 900; p.y = 620 + Math.floor(i / 2) * 80; p.hp = 100; p.score = 0; });
}
function gameTick() {
  for (const room of rooms.values()) {
    if (room.phase === 'playing') {
      room.boss.angle += 0.015;
      room.boss.x = WORLD.width / 2 + Math.sin(room.boss.angle) * 260;
      for (const p of room.players) {
        p.x = clamp(p.x + p.input.x * 7, 30, WORLD.width - 30);
        p.y = clamp(p.y + p.input.y * 7, 300, WORLD.height - 30);
        if (p.cooldown > 0) p.cooldown--;
      }
      const next = [];
      for (const b of room.bullets) {
        b.x += b.vx; b.y += b.vy; b.life--;
        if (b.life <= 0 || b.x < -20 || b.x > WORLD.width + 20 || b.y < -20 || b.y > WORLD.height + 20) continue;
        const hitBoss = Math.hypot(b.x - room.boss.x, b.y - room.boss.y) < 105;
        if (hitBoss) {
          room.boss.hp = Math.max(0, room.boss.hp - 4);
          const p = room.players.find(x => x.id === b.owner); if (p) p.score += 4;
          continue;
        }
        next.push(b);
      }
      room.bullets = next;
      if (room.boss.hp <= 0) room.phase = 'won';
    }
    broadcast(room, snapshot(room));
  }
}
setInterval(gameTick, 1000 / TICK);

const server = http.createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: true, rooms: rooms.size })); return; }
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Boss multiplayer server is running');
});
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  const p = { id: id(), ws, room: null, name: 'Pilot', x: 800, y: 650, hp: 100, score: 0, color: '#7dd3fc', cooldown: 0, input: { x: 0, y: 0 } };
  players.set(p.id, p);
  send(ws, { type: 'hello', id: p.id, maxPlayers: MAX_PLAYERS, world: WORLD });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw.toString()); } catch { return; }
    if (m.type === 'create') {
      if (p.room) return;
      const room = createRoom();
      joinRoom(room, p, m.name);
      return;
    }
    if (m.type === 'join') {
      if (p.room) return;
      const room = rooms.get(String(m.code || '').toUpperCase());
      if (!room) return send(ws, { type: 'error', message: 'Комната не найдена' });
      if (room.players.length >= MAX_PLAYERS) return send(ws, { type: 'error', message: 'Комната заполнена' });
      joinRoom(room, p, m.name);
      return;
    }
    if (!p.room) return;
    if (m.type === 'input') {
      p.input.x = clamp(Number(m.x) || 0, -1, 1);
      p.input.y = clamp(Number(m.y) || 0, -1, 1);
    } else if (m.type === 'fire') fire(p.room, p);
    else if (m.type === 'start' && p.room.players[0] === p && p.room.players.length >= 1) resetGame(p.room);
    else if (m.type === 'restart' && p.room.players[0] === p) resetGame(p.room);
  });
  ws.on('close', () => leave(p));
});
function joinRoom(room, p, name) {
  p.room = room; p.name = String(name || 'Pilot').slice(0, 16); p.color = ['#7dd3fc','#a78bfa','#fb7185','#fbbf24'][room.players.length];
  room.players.push(p);
  send(p.ws, { type: 'joined', code: room.code, playerId: p.id, count: room.players.length, max: MAX_PLAYERS });
  broadcast(room, { type: 'room', count: room.players.length, max: MAX_PLAYERS, code: room.code });
}
server.listen(PORT, () => console.log(`Boss server listening on ${PORT}`));
