// [row,column,no. of people] stored in each object for each level combined in level object
const levels = {
    easy: {
        name: "Easy",
        size: 5,
        houses: [[0, 0, 1], [0, 2, 5], [2, 1, 1], [3, 3, 5], [4, 0, 1]]
    },
    medium: {
        name: "Medium",
        size: 7,
        houses: [[0, 0, 12], [0, 6, 4], [3, 0, 1], [3, 2, 1], [5, 0, 7], [5, 5, 3]]
    },
    hard: {
        name: "Hard",
        size: 10,
        houses: [[0, 0, 12], [0, 7, 7], [2, 4, 2], [4, 0, 5], [4, 4, 1], [4, 6, 2], [4, 9, 1],
                 [6, 4, 1], [6, 6, 1], [6, 8, 1], [7, 0, 13], [7, 5, 1], [8, 7, 4]]
    }
};

// selected elements 
const startDiv = document.querySelector("#start");
const gameDiv = document.querySelector("#game");
const nameInput = document.querySelector("#name");
const levelSelect = document.querySelector("#level");
const startButton = document.querySelector("#startButton");
const startMessage = document.querySelector("#startMessage");
const rulesButton = document.querySelector("#rulesButton");
const rulesDiv = document.querySelector("#rules");
const savesList = document.querySelector("#saves");
const leaderboardDiv = document.querySelector("#leaderboard");

const playerText = document.querySelector("#player");
const levelText = document.querySelector("#levelName");
const timeText = document.querySelector("#time");
const table = document.querySelector("#board");
const message = document.querySelector("#message");
const saveButton = document.querySelector("#saveButton");
const menuButton = document.querySelector("#menuButton");
const winDiv = document.querySelector("#win");
const winText = document.querySelector("#winText");
const winMenuButton = document.querySelector("#winMenuButton");


let player = "";
let levelKey = "";
let size = 0;
let cells = [];    // "empty", "wall", "land" or "house"
let houses = [];   // number of people, or 0 if there is no house
let errors = [];   // true if the cell is part of an error
let gameId = 0;
let elapsed = 0;   // milliseconds
let startTime = 0;
let timer = null;
let gameOver = false;
let dragMode = ""; // "build", "erase" or "" (not dragging)

// makes a size x size grid filled with a value
function makeGrid(value) {
    const grid = [];
    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) {
            row.push(value);
        }
        grid.push(row);
    }
    return grid;
}

function setupLevel(key) {
    levelKey = key;
    size = levels[key].size;
    cells = makeGrid("empty");
    houses = makeGrid(0);
    for (const h of levels[key].houses) {
        houses[h[0]][h[1]] = h[2];
        cells[h[0]][h[1]] = "house";
    }
}

// ---------------- START SCREEN ----------------
function showStart() {
    gameDiv.hidden = true;
    startDiv.hidden = false;
    showSaves();
    showLeaderboard();
}

rulesButton.addEventListener("click", function () {
    rulesDiv.hidden = !rulesDiv.hidden;
});

startButton.addEventListener("click", function () {
    const name = nameInput.value.trim();
    if (name === "") {
        startMessage.innerText = "Please enter your name in the field !";
        return;
    }
    startMessage.innerText = "";
    player = name;
    setupLevel(levelSelect.value);
    gameId = Date.now();
    elapsed = 0;
    openGame();
});

function openGame() {
    gameOver = false;
    dragMode = "";
    playerText.innerText = player;
    levelText.innerText = levels[levelKey].name;
    winDiv.hidden = true;
    startDiv.hidden = true;
    gameDiv.hidden = false;
    startTimer();
    refresh();
}

menuButton.addEventListener("click", function () {
    stopTimer();
    showStart();
});

winMenuButton.addEventListener("click", function () {
    showStart();
});

// ---------------- DRAWING ----------------
function refresh() {
    const problems = checkErrors();
    drawTable();
    if (problems === 0 && isWon()) {
        win();
    }
}

function drawTable() {
    let html = "";
    for (let r = 0; r < size; r++) {
        html += "<tr>";
        for (let c = 0; c < size; c++) {
            let cls = cells[r][c];
            if (errors[r][c]) {
                cls += " error";
            }
            let text = "";
            if (houses[r][c] > 0) {
                text = houses[r][c];
            }
            html += `<td class="${cls}" data-row="${r}" data-col="${c}">${text}</td>`;
        }
        html += "</tr>";
    }
    table.innerHTML = html;
}

// ---------------- MOUSE ----------------
// left button: build or erase walls (also by dragging)
table.addEventListener("mousedown", function (e) {
    if (e.button !== 0 || gameOver) return;
    if (!e.target.matches("td")) return;
    e.preventDefault();
    const r = Number(e.target.dataset.row);
    const c = Number(e.target.dataset.col);
    if (cells[r][c] === "house") return;

    // the first cell decides what the whole drag does
    if (cells[r][c] === "wall") {
        dragMode = "erase";
    } else {
        dragMode = "build";
    }
    paint(r, c);
});

table.addEventListener("mouseover", function (e) {
    if (dragMode === "") return;
    if (!e.target.matches("td")) return;
    paint(Number(e.target.dataset.row), Number(e.target.dataset.col));
});

document.addEventListener("mouseup", function () {
    dragMode = "";
});

function paint(r, c) {
    if (gameOver || cells[r][c] === "house") return;
    if (dragMode === "build" && cells[r][c] !== "wall") {
        cells[r][c] = "wall";
        refresh();
    } else if (dragMode === "erase" && cells[r][c] === "wall") {
        cells[r][c] = "empty";
        refresh();
    }
}

// right button: mark / unmark property
table.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    if (gameOver || !e.target.matches("td")) return;
    const r = Number(e.target.dataset.row);
    const c = Number(e.target.dataset.col);
    if (cells[r][c] === "house") return;

    if (cells[r][c] === "land") {
        cells[r][c] = "empty";
    } else {
        cells[r][c] = "land";
    }
    refresh();
});

// ---------------- CHECKING ----------------
// Flood fill: marks every cell reachable from (r, c) in "visited".
// mode "land":    can go through land and houses
// mode "notwall": can go through everything except walls
// mode "wall":    can go through walls only
function fill(r, c, visited, mode) {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    if (visited[r][c]) return;

    const cell = cells[r][c];
    if (mode === "land" && cell !== "land" && cell !== "house") return;
    if (mode === "notwall" && cell === "wall") return;
    if (mode === "wall" && cell !== "wall") return;

    visited[r][c] = true;
    fill(r + 1, c, visited, mode);
    fill(r - 1, c, visited, mode);
    fill(r, c + 1, visited, mode);
    fill(r, c - 1, visited, mode);
}

// returns a list of [row, col] reachable from (r, c)
function getArea(r, c, mode) {
    const visited = makeGrid(false);
    fill(r, c, visited, mode);
    const area = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (visited[i][j]) {
                area.push([i, j]);
            }
        }
    }
    return area;
}

function countHouses(area) {
    let count = 0;
    for (const cell of area) {
        if (houses[cell[0]][cell[1]] > 0) {
            count++;
        }
    }
    return count;
}

function markErrors(area) {
    for (const cell of area) {
        errors[cell[0]][cell[1]] = true;
    }
}

// finds errors, shows them, returns how many kinds of errors there are
function checkErrors() {
    errors = makeGrid(false);
    const problems = [];

    // 1. 2x2 wall blocks
    for (let r = 0; r < size - 1; r++) {
        for (let c = 0; c < size - 1; c++) {
            if (cells[r][c] === "wall" && cells[r + 1][c] === "wall" &&
                cells[r][c + 1] === "wall" && cells[r + 1][c + 1] === "wall") {
                markErrors([[r, c], [r + 1, c], [r, c + 1], [r + 1, c + 1]]);
                if (!problems.includes("2x2 wall block")) {
                    problems.push("2x2 wall block");
                }
            }
        }
    }

    for (const h of levels[levelKey].houses) {
        const r = h[0];
        const c = h[1];
        const people = h[2];

        // 2. property too large
        const property = getArea(r, c, "land");
        if (property.length > people) {
            markErrors(property);
            if (!problems.includes("property too large")) {
                problems.push("property too large");
            }
        }

        // two houses in the same property
        if (countHouses(property) > 1) {
            markErrors(property);
            if (!problems.includes("two houses in one property")) {
                problems.push("two houses in one property");
            }
        }

        // 3. property too small (closed by walls, can not grow anymore)
        const space = getArea(r, c, "notwall");
        if (space.length < people) {
            markErrors(space);
            if (!problems.includes("property too small")) {
                problems.push("property too small");
            }
        }
    }

    if (problems.length > 0) {
        message.innerText = "Error: " + problems.join(", ");
    } else {
        message.innerText = "";
    }
    return problems.length;
}

function isWon() {
    let landCount = 0;
    const walls = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (cells[r][c] === "empty") return false; // not every cell decided
            if (cells[r][c] === "land" || cells[r][c] === "house") landCount++;
            if (cells[r][c] === "wall") walls.push([r, c]);
        }
    }

    // every house has the correct size and only one house
    let total = 0;
    for (const h of levels[levelKey].houses) {
        const property = getArea(h[0], h[1], "land");
        if (property.length !== h[2]) return false;
        if (countHouses(property) !== 1) return false;
        total += h[2];
    }

    // no land without a house
    if (total !== landCount) return false;

    // all walls are connected
    if (walls.length > 0) {
        const wallArea = getArea(walls[0][0], walls[0][1], "wall");
        if (wallArea.length !== walls.length) return false;
    }

    // (2x2 blocks are already checked in checkErrors)
    return true;
}

function win() {
    gameOver = true;
    stopTimer();
    addToLeaderboard();
    deleteSave(gameId);
    winText.innerText = player + " finished the " + levels[levelKey].name +
        " level in " + formatTime(elapsed) + "!";
    winDiv.hidden = false;
}

// ---------------- TIMER ----------------
function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

function startTimer() {
    clearInterval(timer);
    startTime = Date.now() - elapsed; // continue from the saved time
    timeText.innerText = formatTime(elapsed);
    timer = setInterval(function () {
        elapsed = Date.now() - startTime;
        timeText.innerText = formatTime(elapsed);
    }, 100);
}

function stopTimer() {
    clearInterval(timer);
}

// ---------------- SAVE / LOAD ----------------
function getSaves() {
    const data = localStorage.getItem("saves");
    if (data === null) return [];
    return JSON.parse(data);
}

saveButton.addEventListener("click", function () {
    if (gameOver) return;
    let saves = getSaves();
    saves = saves.filter(s => s.id !== gameId); // remove the old save of this game
    saves.push({ id: gameId, player: player, level: levelKey, cells: cells, time: elapsed });
    localStorage.setItem("saves", JSON.stringify(saves));
    message.innerText = "Game saved!";
});

function deleteSave(id) {
    const saves = getSaves().filter(s => s.id !== id);
    localStorage.setItem("saves", JSON.stringify(saves));
}

function showSaves() {
    const saves = getSaves();
    if (saves.length === 0) {
        savesList.innerHTML = "<li>No saved games</li>";
        return;
    }
    let html = "";
    for (const s of saves) {
        html += `<li>${s.player} - ${levels[s.level].name} - ${formatTime(s.time)}
                 <button data-id="${s.id}">Load</button></li>`;
    }
    savesList.innerHTML = html;
}

// event delegation for all Load buttons
savesList.addEventListener("click", function (e) {
    if (!e.target.matches("button")) return;
    const id = Number(e.target.dataset.id);
    for (const s of getSaves()) {
        if (s.id === id) {
            player = s.player;
            setupLevel(s.level);
            cells = s.cells;
            elapsed = s.time;
            gameId = s.id;
            openGame();
        }
    }
});

// ---------------- LEADERBOARD ----------------
function getLeaderboard() {
    const data = localStorage.getItem("leaderboard");
    if (data === null) return { easy: [], medium: [], hard: [] };
    return JSON.parse(data);
}

function addToLeaderboard() {
    const board = getLeaderboard();
    board[levelKey].push({ player: player, time: elapsed });
    board[levelKey].sort((a, b) => a.time - b.time); // fastest first
    localStorage.setItem("leaderboard", JSON.stringify(board));
}

function showLeaderboard() {
    const board = getLeaderboard();
    let html = "";
    for (const key in levels) {
        html += `<h3>${levels[key].name}</h3>`;
        if (board[key].length === 0) {
            html += "<p>No results yet</p>";
        } else {
            html += "<ol>";
            for (const result of board[key]) {
                html += `<li>${result.player} - ${formatTime(result.time)}</li>`;
            }
            html += "</ol>";
        }
    }
    leaderboardDiv.innerHTML = html;
}

// ---------------- START ----------------
showStart();



