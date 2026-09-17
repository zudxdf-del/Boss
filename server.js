import http from 'node:http';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 3000);
const MAX_PLAYERS = 4;
const WORLD = { width: 1200, height: 800 };
const rooms = new Map();

const id = () => crypto.randomBytes(5).toString('hex');
const code = () => {
  let c;
  do c = Math.random().toString(36).slice(2, 8).toUpperCase();
  while (rooms.has(c));
  return c;
};
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const send = (ws, data) => { if (ws.readyState === 1) ws.send(JSON.stringify(data)); };
const view = r => r.players.map((p, i) => ({ id: p.id, name: p.name, x: p.x, y: p.y, hp: p.hp, host: i === 0 }));
const info = r => ({ type: 'room', code: r.code, phase: r.phase, count: r.players.length, max: MAX_PLAYERS, hostId: r.players[0]?.id ?? null, players: view(r) });
const broadcast = (r, data) => r.players.forEach(p => send(p.ws, data));

function makeRoom() {
  const r = { code: code(), phase: 'lobby', players: [], shots: [], stars: [] };
  for (let i = 0; i < 80; i++) r.stars.push({ x: Math.random() * WORLD.width, y: Math.random() * WORLD.height, s: 1 + Math.random() * 2 });
  rooms.set(r.code, r);
  return r;
}

function reset(r) {
  r.phase = 'playing';
  r.shots = [];
  r.players.forEach((p, i) => {
    p.x = 250 + (i % 2) * 700;
    p.y = 230 + Math.floor(i / 2) * 340;
    p.hp = 100;
    p.cooldown = 0;
    p.input = { x: 0, y: 0 };
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    return res.end(JSON.stringify({ ok: true, game: 'nebulock', websocket: true, rooms: rooms.size }));
  }
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const html = await readFile(new URL('./public/index.html', import.meta.url), 'utf8');
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(html);
    } catch (e) {
      console.error(e);
      res.writeHead(500);
      return res.end('Nebulock client unavailable');
    }
  }
  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server });
wss.on('connection', ws => {
  const p = { id: id(), ws, room: null, name: 'Pilot', x: 600, y: 400, hp: 100, cooldown: 0, input: { x: 0, y: 0 } };
  send(ws, { type: 'hello', game: 'nebulock', world: WORLD, maxPlayers: MAX_PLAYERS });

  ws.on('message', raw => {
    let m;
    try { m = JSON.parse(raw.toString()); } catch { return; }
    if (m.type === 'ping') return send(ws, { type: 'pong', t: m.t });
    if (m.type === 'create') {
      if (p.room) return send(ws, { type: 'error', message: 'Вы уже в комнате.' });
      const r = makeRoom();
      join(r, p, m.name);
      return;
    }
    if (m.type === 'join') {
      if (p.room) return send(ws, { type: 'error', message: 'Вы уже в комнате.' });
      const r = rooms.get(String(m.code || '').trim().toUpperCase());
      if (!r) return send(ws, { type: 'error', message: 'Комната не найдена.' });
      if (r.phase !== 'lobby') return send(ws, { type: 'error', message: 'Игра уже началась.' });
      if (r.players.length >= MAX_PLAYERS) return send(ws, { type: 'error', message: 'Комната заполнена.' });
      join(r, p, m.name);
      return;
    }
    if (!p.room) return send(ws, { type: 'error', message: 'Сначала создай или войди в комнату.' });
    const r = p.room;
    if (m.type === 'input') {
      p.input.x = clamp(Number(m.x) || 0, -1, 1);
      p.input.y = clamp(Number(m.y) || 0, -1, 1);
    } else if (m.type === 'start') {
      if (r.phase !== 'lobby') return;
      reset(r);
      broadcast(r, info(r));
      broadcast(r, { type: 'state', phase: r.phase, code: r.code, players: view(r), shots: r.shots, stars: r.stars });
    } else if (m.type === 'fire' && r.phase === 'playing' && p.cooldown <= 0 && p.hp > 0) {
      const target = r.players.find(x => x !== p && x.hp > 0);
      if (target) {
        const dx = target.x - p.x, dy = target.y - p.y, len = Math.hypot(dx, dy) || 1;
        r.shots.push({ x: p.x, y: p.y, vx: dx / len * 12, vy: dy / len * 12, owner: p.id, life: 90 });
        p.cooldown = 12;
      }
    }
  });

  ws.on('close', () => {
    if (!p.room) return;
    const r = p.room;
    r.players = r.players.filter(x => x !== p);
    if (!r.players.length) rooms.delete(r.code);
    else broadcast(r, info(r));
  });

  function join(r, player, name) {
    player.room = r;
    player.name = String(name || 'Pilot').slice(0, 16) || 'Pilot';
    player.x = 600;
    player.y = 400;
    r.players.push(player);
    const roomInfo = info(r);
    send(ws, { type: 'joined', playerId: player.id, isHost: r.players[0] === player, ...roomInfo });
    broadcast(r, roomInfo);
  }
});

setInterval(() => {
  for (const r of rooms.values()) {
    if (r.phase !== 'playing') continue;
    for (const p of r.players) {
      p.x = clamp(p.x + p.input.x * 6, 30, WORLD.width - 30);
      p.y = clamp(p.y + p.input.y * 6, 30, WORLD.height - 30);
      if (p.cooldown > 0) p.cooldown--;
    }
    const next = [];
    for (const s of r.shots) {
      s.x += s.vx; s.y += s.vy; s.life--;
      if (s.life <= 0 || s.x < 0 || s.x > WORLD.width || s.y < 0 || s.y > WORLD.height) continue;
      const target = r.players.find(p => p.id !== s.owner && p.hp > 0 && Math.hypot(p.x - s.x, p.y - s.y) < 24);
      if (target) { target.hp = Math.max(0, target.hp - 20); continue; }
      next.push(s);
    }
    r.shots = next;
    if (r.players.length > 1 && r.players.every(p => p.hp <= 0)) r.phase = 'finished';
    broadcast(r, { type: 'state', phase: r.phase, code: r.code, players: view(r), shots: r.shots, stars: r.stars });
  }
}, 1000 / 30);

server.listen(PORT, '0.0.0.0', () => console.log(`Nebulock listening on ${PORT}`));
