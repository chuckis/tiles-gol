const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
const size = 16;
const tile = canvas.width / size;

let grid = Array(size).fill().map(() => Array(size).fill(0));
let running = false;
let interval = null;

let history = [];
let historyIndex = -1;

// ---- LocalStorage: загрузка истории при старте ----
const saved = localStorage.getItem("lifeHistory");
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.history) && typeof parsed.index === "number") {
      history = parsed.history;
      historyIndex = parsed.index;
      loadHistory(historyIndex);
    }
  } catch (e) {
    console.warn("Не удалось загрузить историю из LocalStorage", e);
  }
}

// ---- функции истории ----
function saveHistory() {
  history = history.slice(0, historyIndex + 1); // обрезаем "будущее"
  history.push(grid.map(r => [...r]));
  historyIndex++;
  if (history.length > 100) history.shift();

  localStorage.setItem("lifeHistory", JSON.stringify({
    history: history,
    index: historyIndex
  }));
}

function loadHistory(index) {
  if (index < 0 || index >= history.length) return;
  grid = history[index].map(r => [...r]);
  drawGrid();
  updatePattern();
  historyIndex = index;
}

function clearHistory() {
  localStorage.removeItem("lifeHistory");
  history = [];
  historyIndex = -1;
}

// ---- рисование и отображение ----
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
  saveHistory();
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tile);
  const y = Math.floor((e.clientY - rect.top) / tile);
  toggleCell(x, y);
});

// ---- шаг игры жизни ----
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
  saveHistory();
  drawGrid();
  updatePattern();
}

// ---- старт / стоп ----
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

// ---- сброс сетки ----
function resetGrid(newGrid=null) {
  stopLife();
  grid = newGrid ? newGrid.map(r => [...r]) : Array(size).fill().map(()=>Array(size).fill(0));
  drawGrid();
  updatePattern();
  clearHistory();
  saveHistory();
}

// ---- элементы управления ----
const lifeBtn = document.getElementById("lifeBtn");
const stepBtn = document.getElementById("stepBtn");
const speedRange = document.getElementById("speedRange");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const presetSelect = document.getElementById("presetSelect");

document.getElementById("clearBtn").onclick = () => resetGrid();
document.getElementById("fillBtn").onclick = () => resetGrid(Array(size).fill().map(()=>Array(size).fill(1)));
document.getElementById("invertBtn").onclick = () => resetGrid(grid.map(r=>r.map(v=>v?0:1)));
document.getElementById("randomBtn").onclick = () => resetGrid(grid.map(r=>r.map(()=>Math.random()>0.7?1:0)));

lifeBtn.onclick = () => running ? stopLife() : startLife();
stepBtn.onclick = () => { stopLife(); stepLife(); };
speedRange.oninput = () => { if (running) { stopLife(); startLife(); } };

backBtn.onclick = () => { if(historyIndex>0) loadHistory(historyIndex-1); };
forwardBtn.onclick = () => { if(historyIndex<history.length-1) loadHistory(historyIndex+1); };

// ---- предустановки ----
const presets = {
  glider: [[1,0,0],[0,1,1],[1,1,0]],
  blinker: [[1,1,1]],
  toad: [[0,1,1,1],[1,1,1,0]],
  pulsar: [
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
    [0,0,0,0,1,1,1,0,0,0,0,0,0]
  ],
  lwss: [[0,1,1,1,1],[1,0,0,0,1],[0,0,0,0,1],[1,0,0,1,0]]
};

function placePreset(name) {
  const pattern = presets[name];
  if (!pattern) return;
  const py = Math.floor((size - pattern.length)/2);
  const px = Math.floor((size - pattern[0].length)/2);
  const newGrid = Array(size).fill().map(()=>Array(size).fill(0));
  for (let y=0; y<pattern.length; y++) {
    for (let x=0; x<pattern[y].length; x++) {
      newGrid[py+y][px+x] = pattern[y][x];
    }
  }
  resetGrid(newGrid);
}

presetSelect.onchange = () => { if(presetSelect.value){ placePreset(presetSelect.value); presetSelect.value=""; } };

// ---- стартовая отрисовка ----
drawGrid();
updatePattern();
saveHistory();
