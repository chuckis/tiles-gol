const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
const size = 16;
const tile = canvas.width / size;
let grid = Array(size).fill().map(() => Array(size).fill(0));
let running = false;
let interval = null;

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.fillStyle = grid[y][x] ? "black" : "white";
      ctx.fillRect(x * tile, y * tile, tile, tile);
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.strokeRect(x * tile, y * tile, tile, tile);
    }
  }
}

function updatePattern() {
  document.getElementById("pattern").textContent = grid.map(r => r.join("")).join("\n");
}

function toggleCell(x, y) {
  grid[y][x] = grid[y][x] ? 0 : 1;
  drawGrid();
  updatePattern();
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tile);
  const y = Math.floor((e.clientY - rect.top) / tile);
  toggleCell(x, y);
});

// ---- Управление ----
document.getElementById("clearBtn").onclick = () => { stopLife(); grid = grid.map(r => r.fill(0)); drawGrid(); updatePattern(); };
document.getElementById("fillBtn").onclick = () => { stopLife(); grid = grid.map(r => r.fill(1)); drawGrid(); updatePattern(); };
document.getElementById("invertBtn").onclick = () => { stopLife(); grid = grid.map(r => r.map(v => v ? 0 : 1)); drawGrid(); updatePattern(); };
document.getElementById("randomBtn").onclick = () => { stopLife(); grid = grid.map(r => r.map(() => Math.random() > 0.7 ? 1 : 0)); drawGrid(); updatePattern(); };

const lifeBtn = document.getElementById("lifeBtn");
const stepBtn = document.getElementById("stepBtn");
const speedRange = document.getElementById("speedRange");

function stepLife() {
  const next = grid.map((row, y) =>
    row.map((cell, x) => {
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
            neighbors += grid[ny][nx];
          }
        }
      }
      if (cell === 1 && (neighbors === 2 || neighbors === 3)) return 1;
      if (cell === 0 && neighbors === 3) return 1;
      return 0;
    })
  );
  grid = next;
  drawGrid();
  updatePattern();
}

function startLife() {
  if (!running) {
    running = true;
    lifeBtn.textContent = "Остановить игру жизни";
    interval = setInterval(stepLife, speedRange.value);
  }
}

function stopLife() {
  running = false;
  lifeBtn.textContent = "Запустить игру жизни";
  clearInterval(interval);
}

lifeBtn.onclick = () => running ? stopLife() : startLife();
stepBtn.onclick = () => { stopLife(); stepLife(); };
speedRange.oninput = () => { if (running) { stopLife(); startLife(); } };

drawGrid();
updatePattern();

const presetSelect = document.getElementById("presetSelect");

const presets = {
  glider: [
    [1,0,0],
    [0,1,1],
    [1,1,0],
  ],
  blinker: [
    [1,1,1],
  ],
  toad: [
    [0,1,1,1],
    [1,1,1,0],
  ],
  pulsar: [
    // классический пульсар 13x13
    [0,0,0,0,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,1,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,1],
    [0,0,0,0,1,1,1,0,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,1,1,1,0,0],
    [1,0,0,1,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,0,0,0],
  ],
  lwss: [
    [0,1,1,1,1],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [1,0,0,1,0],
  ]
};

function placePreset(name) {
  stopLife();
  grid = Array(size).fill().map(() => Array(size).fill(0));
  const pattern = presets[name];
  if (!pattern) return;
  const py = Math.floor((size - pattern.length) / 2);
  const px = Math.floor((size - pattern[0].length) / 2);
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[y].length; x++) {
      grid[py + y][px + x] = pattern[y][x];
    }
  }
  drawGrid();
  updatePattern();
}

presetSelect.onchange = () => {
  if (presetSelect.value) {
    placePreset(presetSelect.value);
    presetSelect.value = ""; // сбросить выбор
  }
};
