import { getAIMove, evaluateBoard, isBoardFull } from "./ai.js";
import {
    playSound,
    clickSound,
    winSound,
    isMuted
} from "./audio.js";

// --- Game State Variables ---
export let board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];
export let boardSize = 3;
export let currentPlayer = "X";
export let gameOver = false;
export let gameMode = "classic";
export let opponentType = "pvp";
export let aiDifficulty = "medium";
export let player1Lives = 3;
export let player2Lives = 3;
export let aiIsThinking = false;
export let hoveredCell = null;
export let player1Symbol = "X";
export let player2Symbol = "O";

export let player1Inventory = [];
export let player2Inventory = [];
export let lockedCells = {};
export let wallCells = {};
export let player1Shield = false;
export let player2Shield = false;
export let opponentFrozen = false;
export let doubleMovesLeft = 0;
export let activeSkill = null;
export let activeSkillIndex = -1;
export let activeSkillPlayerNum = -1;
export let swapFirstCell = null;
export let selectedBoardSize = 5;
export let winningLine = null;

// --- Scoreboard Data ---
export let scoreboard = {
    classic: {
        pvp: { winsX: 0, winsO: 0, draws: 0 },
        ai: { winsPlayer: 0, winsAI: 0, draws: 0 }
    },
    battle: {
        pvp: { winsP1: 0, winsP2: 0 },
        ai: { winsPlayer: 0, winsAI: 0 }
    }
};

// --- Constant Registries ---
export const SKILLS = {
    bomb: { name: "Bomb", icon: "💣", rarity: "common", desc: "Hapus 1 simbol lawan atau tembok" },
    freeze: { name: "Freeze", icon: "❄️", rarity: "common", desc: "Bekukan lawan 1 giliran" },
    lock: { name: "Lock Cell", icon: "🔒", rarity: "common", desc: "Kunci 1 kotak (2 giliran)" },
    double: { name: "Double Move", icon: "⚡", rarity: "rare", desc: "Jalan 2 kali giliran ini" },
    wall: { name: "Wall", icon: "🧱", rarity: "rare", desc: "Tembok di kotak kosong (hilang dalam 2 giliran)" },
    swap: { name: "Swap", icon: "🔄", rarity: "rare", desc: "Tukar posisi 2 simbol" },
    shield: { name: "Shield", icon: "🛡️", rarity: "epic", desc: "Kebal skill lawan 1 giliran" },
    replace: { name: "Replace", icon: "🔁", rarity: "epic", desc: "Ubah 1 simbol lawan jadi milikmu" }
};

export const TIPS = [
    "Tips: Dapatkan tiga simbol sejajar untuk menang!",
    "Tips: Di Mode Battle, sisa nyawa ronde lalu akan terbawa ke ronde berikutnya.",
    "Tips: Lawan AI? Coba tingkat kesulitan 'Sulit' untuk tantangan maksimal!",
    "Tips: Ambil posisi tengah di awal permainan untuk keunggulan taktis.",
    "Tips: Kunci sudut-sudut papan untuk memojokkan lawan Anda.",
    "Tips: Bermain tenang dan perhatikan pergerakan musuh!"
];

// --- State Setters ---
export function setBoard(val) { board = val; }
export function setBoardSize(val) { boardSize = val; }
export function setCurrentPlayer(val) { currentPlayer = val; }
export function setGameOver(val) { gameOver = val; }
export function setGameMode(val) { gameMode = val; }
export function setOpponentType(val) { opponentType = val; }
export function setAiDifficulty(val) { aiDifficulty = val; }
export function setPlayer1Lives(val) { player1Lives = val; }
export function setPlayer2Lives(val) { player2Lives = val; }
export function setAiIsThinking(val) { aiIsThinking = val; }
export function setHoveredCell(val) { hoveredCell = val; }
export function setPlayer1Symbol(val) { player1Symbol = val; }
export function setPlayer2Symbol(val) { player2Symbol = val; }
export function setPlayer1Inventory(val) { player1Inventory = val; }
export function setPlayer2Inventory(val) { player2Inventory = val; }
export function setLockedCells(val) { lockedCells = val; }
export function setWallCells(val) { wallCells = val; }
export function setPlayer1Shield(val) { player1Shield = val; }
export function setPlayer2Shield(val) { player2Shield = val; }
export function setOpponentFrozen(val) { opponentFrozen = val; }
export function setDoubleMovesLeft(val) { doubleMovesLeft = val; }
export function setActiveSkill(val) { activeSkill = val; }
export function setActiveSkillIndex(val) { activeSkillIndex = val; }
export function setActiveSkillPlayerNum(val) { activeSkillPlayerNum = val; }
export function setSwapFirstCell(val) { swapFirstCell = val; }
export function setSelectedBoardSize(val) { selectedBoardSize = val; }
export function setWinningLine(val) { winningLine = val; }

// --- UI Output Delegates ---
let drawCallback = () => {};
let updateTurnDisplayCallback = () => {};
let updateHeartsDisplayCallback = () => {};
let showAoaVictoryScreenCallback = () => {};
let showAoaDrawScreenCallback = () => {};
let showToastCallback = () => {};
let renderInventoriesCallback = () => {};
let updateShieldAvatarDisplayCallback = () => {};
let showShuffleTimeModalCallback = () => {};
let showScreenCallback = () => {};
let playP3RTransitionCallback = () => {};

export function setDrawCallback(fn) { drawCallback = fn; }
export function setUpdateTurnDisplayCallback(fn) { updateTurnDisplayCallback = fn; }
export function setUpdateHeartsDisplayCallback(fn) { updateHeartsDisplayCallback = fn; }
export function setShowAoaVictoryScreenCallback(fn) { showAoaVictoryScreenCallback = fn; }
export function setShowAoaDrawScreenCallback(fn) { showAoaDrawScreenCallback = fn; }
export function setShowToastCallback(fn) { showToastCallback = fn; }
export function setRenderInventoriesCallback(fn) { renderInventoriesCallback = fn; }
export function setUpdateShieldAvatarDisplayCallback(fn) { updateShieldAvatarDisplayCallback = fn; }
export function setShowShuffleTimeModalCallback(fn) { showShuffleTimeModalCallback = fn; }
export function setShowScreenCallback(fn) { showScreenCallback = fn; }
export function setPlayP3RTransitionCallback(fn) { playP3RTransitionCallback = fn; }

// --- Interaction Triggers ---
export function showToast(msg) { showToastCallback(msg); }
export function drawBoard() { drawCallback(); }
export function updateTurnDisplay() { updateTurnDisplayCallback(); }
export function updateHeartsDisplay() { updateHeartsDisplayCallback(); }
export function renderInventories() { renderInventoriesCallback(); }
export function updateShieldAvatarDisplay() { updateShieldAvatarDisplayCallback(); }

// --- Win Condition Evaluation ---
export function checkWinner() {
    const size = board.length;
    winningLine = null;
    
    for (let r = 0; r < size; r++) {
        const first = board[r][0];
        if (first && first !== "W" && first !== "") {
            let win = true;
            for (let c = 1; c < size; c++) {
                if (board[r][c] !== first) { win = false; break; }
            }
            if (win) {
                winningLine = { type: "row", index: r };
                return first;
            }
        }
    }
    
    for (let c = 0; c < size; c++) {
        const first = board[0][c];
        if (first && first !== "W" && first !== "") {
            let win = true;
            for (let r = 1; r < size; r++) {
                if (board[r][c] !== first) { win = false; break; }
            }
            if (win) {
                winningLine = { type: "col", index: c };
                return first;
            }
        }
    }
    
    const firstTL = board[0][0];
    if (firstTL && firstTL !== "W" && firstTL !== "") {
        let win = true;
        for (let i = 1; i < size; i++) {
            if (board[i][i] !== firstTL) { win = false; break; }
        }
        if (win) {
            winningLine = { type: "diag1", index: 0 };
            return firstTL;
        }
    }
    
    const firstTR = board[0][size - 1];
    if (firstTR && firstTR !== "W" && firstTR !== "") {
        let win = true;
        for (let i = 1; i < size; i++) {
            if (board[i][size - 1 - i] !== firstTR) { win = false; break; }
        }
        if (win) {
            winningLine = { type: "diag2", index: 0 };
            return firstTR;
        }
    }
    return null;
}

export function isDraw() {
    return board.every(row => row.every(cell => cell !== ""));
}

// --- Random Skill Selection ---
export function rollRandomSkill() {
    const rand = Math.random();
    let rarity = "common";
    if (rand < 0.15) {
        rarity = "epic";
    } else if (rand < 0.45) {
        rarity = "rare";
    }
    
    const candidates = Object.keys(SKILLS).filter(k => SKILLS[k].rarity === rarity);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

export function addRandomSkillToActivePlayer() {
    const isAi = (opponentType === "ai" && currentPlayer !== player1Symbol);
    const activeInv = (currentPlayer === player1Symbol) ? player1Inventory : player2Inventory;
    
    if (activeInv.length < 5) {
        const newSkill = rollRandomSkill();
        if (isAi) {
            activeInv.push(newSkill);
            showToast(`🎲 AI mendapat skill ${SKILLS[newSkill].name}!`);
            renderInventories();
        } else {
            showShuffleTimeModalCallback(newSkill);
        }
    } else {
        const ownerLabel = (currentPlayer === player1Symbol) ? 'Anda' : (isAi ? 'AI' : 'Pemain 2');
        showToast(`⚠️ Inventory ${ownerLabel} penuh (5/5)!`);
    }
}

// --- Skill Execution Flow ---
export function activateSkill(skillId, index, playerNum) {
    if (gameOver || aiIsThinking) return;
    activeSkill = skillId;
    swapFirstCell = null;
    
    const banner = document.getElementById("skill-activation-banner");
    const bannerText = document.getElementById("skill-banner-text");
    const skill = SKILLS[skillId];
    
    bannerText.innerHTML = `<strong>SKILL AKTIF:</strong> ${skill.icon} ${skill.name} - ${getSkillInstructionText(skillId)}`;
    banner.classList.remove("hidden");
    
    activeSkillIndex = index;
    activeSkillPlayerNum = playerNum;
    
    if (skillId === "freeze" || skillId === "shield" || skillId === "double") {
        executeInstantSkill(skillId);
    }
}

function getSkillInstructionText(skillId) {
    switch (skillId) {
        case "bomb": return "Klik 1 simbol lawan untuk meledakkan";
        case "lock": return "Klik 1 kotak kosong untuk dikunci (2 giliran)";
        case "wall": return "Klik 1 kotak kosong untuk meletakkan Tembok";
        case "swap": return "Klik simbol pertama untuk ditukar";
        case "replace": return "Klik 1 simbol lawan untuk diubah jadi simbolmu";
        case "freeze": return "Membekukan lawan untuk giliran berikutnya";
        case "shield": return "Melindungi dari skill lawan giliran ini";
        case "double": return "Gunakan 2 langkah di giliran ini";
        default: return "";
    }
}

export function executeInstantSkill(skillId) {
    const banner = document.getElementById("skill-activation-banner");
    const activeInventory = activeSkillPlayerNum === 1 ? player1Inventory : player2Inventory;
    
    if (skillId === "freeze") {
        const oppShield = activeSkillPlayerNum === 1 ? player2Shield : player1Shield;
        if (oppShield) {
            showToast(`🛡️ Freeze gagal! Lawan dilindungi oleh Shield!`);
        } else {
            opponentFrozen = true;
            showToast(`❄️ Lawan dibekukan selama 1 giliran!`);
        }
    } else if (skillId === "shield") {
        if (activeSkillPlayerNum === 1) player1Shield = true;
        else player2Shield = true;
        showToast(`🛡️ Shield diaktifkan! Melindungi dari skill lawan.`);
        updateShieldAvatarDisplay();
    } else if (skillId === "double") {
        doubleMovesLeft = 2;
        showToast(`⚡ Double Move aktif! Letakkan 2 simbol.`);
    }
    
    activeInventory.splice(activeSkillIndex, 1);
    activeSkill = null;
    banner.classList.add("hidden");
    
    drawBoard();
    renderInventories();
}

// --- Advancing Game Turns ---
export function advanceTurn() {
    if (opponentFrozen) {
        opponentFrozen = false;
        showToast(`❄️ Lawan beku! Giliran kamu kembali.`);
    } else {
        currentPlayer = (currentPlayer === "X") ? "O" : "X";
    }

    for (let key in lockedCells) {
        lockedCells[key]--;
        if (lockedCells[key] <= 0) {
            delete lockedCells[key];
        }
    }

    for (let key in wallCells) {
        wallCells[key]--;
        if (wallCells[key] <= 0) {
            const [r, c] = key.split(",").map(Number);
            if (board[r][c] === "W") {
                board[r][c] = "";
            }
            delete wallCells[key];
        }
    }

    if (currentPlayer === player1Symbol) {
        player1Shield = false;
    } else {
        player2Shield = false;
    }
    updateShieldAvatarDisplay();

    updateTurnDisplay();
    renderInventories();
    
    if (gameMode === "ultimate") {
        addRandomSkillToActivePlayer();
    }

    if (opponentType === "ai" && currentPlayer === player2Symbol) {
        aiIsThinking = true;
        setTimeout(() => {
            if (gameOver) { aiIsThinking = false; return; }
            if (gameMode === "ultimate") {
                aiUseSkills();
            }
            
            setTimeout(() => {
                if (gameOver) { aiIsThinking = false; return; }
                const move = getAIMove(board, boardSize, player1Symbol, player2Symbol, aiDifficulty, player2Lives, gameMode);
                if (move) {
                    board[move.row][move.col] = player2Symbol;
                    playSound(clickSound);
                    drawBoard();

                    const aiWinner = checkWinner();
                    if (aiWinner) handleGameEnd(aiWinner);
                    else if (isDraw()) handleGameEnd(null);
                    else {
                        if (gameMode === "ultimate" && doubleMovesLeft > 1) {
                            doubleMovesLeft--;
                            showToast(`⚡ AI menggunakan langkah kedua dari Double Move!`);
                            
                            setTimeout(() => {
                                if (gameOver) { aiIsThinking = false; return; }
                                const move2 = getAIMove(board, boardSize, player1Symbol, player2Symbol, aiDifficulty, player2Lives, gameMode);
                                if (move2) {
                                    board[move2.row][move2.col] = player2Symbol;
                                    playSound(clickSound);
                                    drawBoard();

                                    const aiWinner2 = checkWinner();
                                    if (aiWinner2) handleGameEnd(aiWinner2);
                                    else if (isDraw()) handleGameEnd(null);
                                    else {
                                        doubleMovesLeft = 0;
                                        aiIsThinking = false;
                                        advanceTurn();
                                    }
                                } else {
                                    aiIsThinking = false;
                                }
                            }, 800);
                        } else {
                            doubleMovesLeft = 0;
                            aiIsThinking = false;
                            advanceTurn();
                        }
                    }
                } else {
                    aiIsThinking = false;
                }
            }, 800);
        }, 800);
    }
}

// --- AI Skill Auto-Usage ---
export function aiUseSkills() {
    if (player2Inventory.length === 0) return;
    
    let skillsUsed = 0;
    let maxSkillsToUse = Math.min(player2Inventory.length, 2);
    
    for (let i = 0; i < maxSkillsToUse; i++) {
        if (gameOver) break;
        const skillId = player2Inventory[0];
        let used = false;
        
        if (skillId === "freeze") {
            if (!player1Shield) {
                opponentFrozen = true;
                player2Inventory.splice(0, 1);
                showToast(`❄️ AI menggunakan skill FREEZE!`);
                used = true;
            } else {
                player2Inventory.splice(0, 1);
                showToast(`🛡️ AI menggunakan FREEZE, diblokir oleh Shield Anda!`);
                used = true;
            }
        } else if (skillId === "shield") {
            player2Shield = true;
            player2Inventory.splice(0, 1);
            showToast(`🛡️ AI menggunakan skill SHIELD!`);
            updateShieldAvatarDisplay();
            used = true;
        } else if (skillId === "double") {
            doubleMovesLeft = 2;
            player2Inventory.splice(0, 1);
            showToast(`⚡ AI menggunakan skill DOUBLE MOVE!`);
            used = true;
        } else if (skillId === "bomb") {
            const targetCells = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] === player1Symbol || board[r][c] === "W") {
                        targetCells.push({ row: r, col: c, val: board[r][c] });
                    }
                }
            }
            if (targetCells.length > 0) {
                player2Inventory.splice(0, 1);
                used = true;
                const players = targetCells.filter(t => t.val === player1Symbol);
                const walls = targetCells.filter(t => t.val === "W");
                const target = players.length > 0 ? players[Math.floor(Math.random() * players.length)] : walls[Math.floor(Math.random() * walls.length)];
                
                if (target.val === "W") {
                    board[target.row][target.col] = "";
                    delete wallCells[`${target.row},${target.col}`];
                    showToast(`💣 AI meledakkan Tembok di baris ${target.row + 1} kolom ${target.col + 1}!`);
                } else {
                    if (!player1Shield) {
                        board[target.row][target.col] = "";
                        showToast(`💣 AI meledakkan simbolmu di baris ${target.row + 1} kolom ${target.col + 1}!`);
                    } else {
                        showToast(`🛡️ AI meledakkan bom, diblokir oleh Shield Anda!`);
                    }
                }
            }
        } else if (skillId === "replace") {
            const targetCells = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] === player1Symbol) {
                        targetCells.push({ row: r, col: c });
                    }
                }
            }
            if (targetCells.length > 0) {
                player2Inventory.splice(0, 1);
                used = true;
                if (!player1Shield) {
                    const target = targetCells[Math.floor(Math.random() * targetCells.length)];
                    board[target.row][target.col] = player2Symbol;
                    showToast(`🔁 AI mengubah simbolmu di baris ${target.row + 1} kolom ${target.col + 1}!`);
                    
                    const winner = checkWinner();
                    if (winner) { handleGameEnd(winner); return; }
                } else {
                    showToast(`🛡️ AI mencoba Replace, diblokir oleh Shield Anda!`);
                }
            }
        } else if (skillId === "lock") {
            const emptyCells = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] === "" && !lockedCells[`${r},${c}`]) {
                        emptyCells.push({ row: r, col: c });
                    }
                }
            }
            if (emptyCells.length > 0) {
                const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                lockedCells[`${target.row},${target.col}`] = 2;
                player2Inventory.splice(0, 1);
                showToast(`🔒 AI mengunci kotak di baris ${target.row + 1} kolom ${target.col + 1}!`);
                used = true;
            }
        } else if (skillId === "wall") {
            const emptyCells = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] === "" && !lockedCells[`${r},${c}`]) {
                        emptyCells.push({ row: r, col: c });
                    }
                }
            }
            if (emptyCells.length > 0) {
                const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                board[target.row][target.col] = "W";
                wallCells[`${target.row},${target.col}`] = 2;
                player2Inventory.splice(0, 1);
                showToast(`🧱 AI meletakkan Tembok di baris ${target.row + 1} kolom ${target.col + 1} (aktif 2 giliran)!`);
                used = true;
            }
        } else if (skillId === "swap") {
            const cells = [];
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] === "X" || board[r][c] === "O") {
                        cells.push({ row: r, col: c });
                    }
                }
            }
            if (cells.length >= 2) {
                const idx1 = Math.floor(Math.random() * cells.length);
                let idx2 = Math.floor(Math.random() * cells.length);
                while (idx1 === idx2) idx2 = Math.floor(Math.random() * cells.length);
                const c1 = cells[idx1];
                const c2 = cells[idx2];
                
                const temp = board[c1.row][c1.col];
                board[c1.row][c1.col] = board[c2.row][c2.col];
                board[c2.row][c2.col] = temp;
                player2Inventory.splice(0, 1);
                showToast(`🔄 AI menukar posisi dua simbol di papan!`);
                used = true;
                
                const winner = checkWinner();
                if (winner) { handleGameEnd(winner); return; }
            }
        }
        
        if (used) {
            skillsUsed++;
            drawBoard();
            renderInventories();
        } else {
            break;
        }
    }
}

// --- End Game Routine ---
export function handleGameEnd(winner) {
    gameOver = true;
    hoveredCell = null;
    drawBoard();

    if (gameMode === "classic" || gameMode === "ultimate") {
        if (winner) {
            showAoaVictoryScreenCallback(winner);
        } else {
            showAoaDrawScreenCallback();
        }
    } else {
        if (winner) {
            if (winner === player1Symbol) player2Lives--;
            else player1Lives--;
            updateHeartsDisplay();

            if (player1Lives === 0 || player2Lives === 0) {
                showAoaVictoryScreenCallback(winner);
            } else {
                playSound(winSound);
                const resultModal = document.getElementById("result-modal");
                const modalIcon = document.getElementById("modal-icon");
                const modalTitle = document.getElementById("modal-title");
                const modalMessage = document.getElementById("modal-message");
                const modalActionBtn = document.getElementById("modalActionBtn");
                
                modalIcon.innerHTML = `<i class="fa-solid fa-crown text-gold"></i>`;
                const roundWinner = winner === player1Symbol ? (opponentType === "ai" ? "Player (Anda)" : "Pemain 1") : (opponentType === "ai" ? "AI" : "Pemain 2");
                modalTitle.textContent = "💥 RONDE SELESAI";
                modalMessage.innerHTML = `Ronde ini dimenangkan oleh <strong>${opponentType === 'ai' && winner === player1Symbol ? 'Anda' : roundWinner}</strong>!<br>Nyawa musuh berkurang. Siapkan diri untuk ronde selanjutnya.`;
                modalActionBtn.textContent = "Lanjut Ronde";
                resultModal.classList.remove("hidden");
            }
        } else {
            showAoaDrawScreenCallback();
        }
    }
}

// --- AI First Turn Handling ---
export function checkAndTriggerAiFirstTurn() {
    if (opponentType === "ai" && player1Symbol === "O") {
        aiIsThinking = true;
        setTimeout(() => {
            if (gameOver) { aiIsThinking = false; return; }
            if (gameMode === "ultimate") {
                aiUseSkills();
            }
            
            setTimeout(() => {
                if (gameOver) { aiIsThinking = false; return; }
                const move = getAIMove(board, boardSize, player1Symbol, player2Symbol, aiDifficulty, player2Lives, gameMode);
                if (move) {
                    board[move.row][move.col] = player2Symbol;
                    playSound(clickSound);
                    drawBoard();
                    
                    currentPlayer = player1Symbol;
                    updateTurnDisplay();
                    renderInventories();
                    
                    if (gameMode === "ultimate") {
                        addRandomSkillToActivePlayer();
                    }
                }
                aiIsThinking = false;
            }, 600);
        }, 700);
    }
}

// --- Launch Game Session ---
export function _launchGame(SIZE) {
    if (gameMode === "ultimate") {
        boardSize = selectedBoardSize;
    } else {
        boardSize = 3;
    }
    
    board = [];
    for (let r = 0; r < boardSize; r++) {
        board.push(new Array(boardSize).fill(""));
    }
    
    player1Lives = 3;
    player2Lives = 3;
    gameOver = false;
    aiIsThinking = false;
    hoveredCell = null;
    currentPlayer = "X";
    
    player1Inventory = [];
    player2Inventory = [];
    lockedCells = {};
    wallCells = {};
    player1Shield = false;
    player2Shield = false;
    opponentFrozen = false;
    doubleMovesLeft = 0;
    activeSkill = null;
    swapFirstCell = null;
    winningLine = null;

    const avX = document.querySelector("#p-x-card .player-avatar");
    const avO = document.querySelector("#p-o-card .player-avatar");
    avX.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    avX.className = "player-avatar av-x";
    avO.innerHTML = '<i class="fa-solid fa-o"></i>';
    avO.className = "player-avatar av-o";
    
    const screenTitle = document.getElementById("game-screen-title");
    if (screenTitle) {
        if (gameMode === "ultimate") screenTitle.textContent = `ULTIMATE MODE (${boardSize}×${boardSize})`;
        else if (gameMode === "battle") screenTitle.textContent = "BATTLE MODE";
        else screenTitle.textContent = "CLASSIC MODE";
    }
    
    const invBoxX = document.getElementById("p-x-inventory-box");
    const invBoxO = document.getElementById("p-o-inventory-box");
    const legendBox = document.getElementById("skills-legend-box");
    if (gameMode === "ultimate") {
        invBoxX.classList.remove("hidden");
        invBoxO.classList.remove("hidden");
        if (legendBox) legendBox.classList.remove("hidden");
    } else {
        invBoxX.classList.add("hidden");
        invBoxO.classList.add("hidden");
        if (legendBox) legendBox.classList.add("hidden");
    }
    
    const banner = document.getElementById("skill-activation-banner");
    if (banner) banner.classList.add("hidden");

    const resultModal = document.getElementById("result-modal");
    if (resultModal) resultModal.classList.add("hidden");
    
    updateHeartsDisplay();
    renderInventories();
    
    const gameCard = document.querySelector(".game-card");
    showScreenCallback(gameCard);
    
    drawBoard();
    updateTurnDisplay();
    
    if (gameMode === "ultimate") {
        addRandomSkillToActivePlayer();
    }
    checkAndTriggerAiFirstTurn();
}

// --- Scoreboard Persistence ---
export function loadScoreboard() {
    const saved = localStorage.getItem("xo_arena_scoreboard");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object") {
                // Safely merge classic scoreboard
                if (parsed.classic && typeof parsed.classic === "object") {
                    if (parsed.classic.pvp && typeof parsed.classic.pvp === "object") {
                        scoreboard.classic.pvp.winsX = parsed.classic.pvp.winsX ?? 0;
                        scoreboard.classic.pvp.winsO = parsed.classic.pvp.winsO ?? 0;
                        scoreboard.classic.pvp.draws = parsed.classic.pvp.draws ?? 0;
                    }
                    if (parsed.classic.ai && typeof parsed.classic.ai === "object") {
                        scoreboard.classic.ai.winsPlayer = parsed.classic.ai.winsPlayer ?? 0;
                        scoreboard.classic.ai.winsAI = parsed.classic.ai.winsAI ?? 0;
                        scoreboard.classic.ai.draws = parsed.classic.ai.draws ?? 0;
                    }
                }
                // Safely merge battle scoreboard
                if (parsed.battle && typeof parsed.battle === "object") {
                    if (parsed.battle.pvp && typeof parsed.battle.pvp === "object") {
                        scoreboard.battle.pvp.winsP1 = parsed.battle.pvp.winsP1 ?? 0;
                        scoreboard.battle.pvp.winsP2 = parsed.battle.pvp.winsP2 ?? 0;
                    }
                    if (parsed.battle.ai && typeof parsed.battle.ai === "object") {
                        scoreboard.battle.ai.winsPlayer = parsed.battle.ai.winsPlayer ?? 0;
                        scoreboard.battle.ai.winsAI = parsed.battle.ai.winsAI ?? 0;
                    }
                }
            }
        } catch (e) {
            console.error("Scoreboard parsing error", e);
        }
    }
    updateScoreboardDOM();
}

export function saveScoreboard() {
    localStorage.setItem("xo_arena_scoreboard", JSON.stringify(scoreboard));
    updateScoreboardDOM();
}

export function updateScoreboardDOM() {
    const cp = scoreboard.classic.pvp;
    const statPvp = document.getElementById("stat-classic-pvp");
    if (statPvp) {
        statPvp.innerHTML = 
            `<span class="v-win">X: ${cp.winsX}</span> • <span class="v-lose">O: ${cp.winsO}</span> • <span class="v-draw">Seri: ${cp.draws}</span>`;
    }
        
    const ca = scoreboard.classic.ai;
    const statAi = document.getElementById("stat-classic-ai");
    if (statAi) {
        statAi.innerHTML = 
            `<span class="v-win">Player: ${ca.winsPlayer}</span> • <span class="v-lose">AI: ${ca.winsAI}</span> • <span class="v-draw">Seri: ${ca.draws}</span>`;
    }
        
    const bp = scoreboard.battle.pvp;
    const statBattlePvp = document.getElementById("stat-battle-pvp");
    if (statBattlePvp) {
        statBattlePvp.innerHTML = 
            `<span class="v-win">Pemain 1: ${bp.winsP1}</span> • <span class="v-lose">Pemain 2: ${bp.winsP2}</span>`;
    }
        
    const ba = scoreboard.battle.ai;
    const statBattleAi = document.getElementById("stat-battle-ai");
    if (statBattleAi) {
        statBattleAi.innerHTML = 
            `<span class="v-win">Player: ${ba.winsPlayer}</span> • <span class="v-lose">AI: ${ba.winsAI}</span>`;
    }
}
