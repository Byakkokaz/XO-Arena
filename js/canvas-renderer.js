import {
    board,
    boardSize,
    currentPlayer,
    activeSkill,
    swapFirstCell,
    winningLine,
    lockedCells,
    wallCells,
    player1Symbol,
    player2Symbol,
    hoveredCell
} from "./game-logic.js";

// --- Rendering Constants ---
const SIZE = 400;
let canvas = null;
let ctx = null;

// --- Renderer Setup & Resizing ---
export function initCanvas(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext("2d");
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
}

export function resizeCanvas() {
    if (!canvas) return;
    const wrapper = canvas.parentElement;
    if (!wrapper) return;
    
    const padding = 20;
    let displaySize = wrapper.clientWidth - padding;
    if (displaySize > 400) displaySize = 400;
    if (displaySize < 250) displaySize = 250;
    
    canvas.style.width = displaySize + "px";
    canvas.style.height = displaySize + "px";
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    
    ctx.resetTransform();
    ctx.scale((displaySize * dpr) / SIZE, (displaySize * dpr) / SIZE);
    
    drawBoard();
}

// --- Draw Rounded Rectangle Helper ---
function drawRoundedRect(x, y, width, height, radius, fillStyle, strokeStyle, strokeWidth) {
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }
    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = strokeWidth || 1;
        ctx.stroke();
    }
}

// --- Main Board Painter ---
export function drawBoard() {
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);

    const currentGap = boardSize === 3 ? 10 : (boardSize === 5 ? 6 : 4);
    const currentCellSize = Math.floor((SIZE - (boardSize + 1) * currentGap) / boardSize);

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const x = currentGap + col * (currentCellSize + currentGap);
            const y = currentGap + row * (currentCellSize + currentGap);
            
            const cellVal = board[row][col];
            const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;
            ctx.shadowBlur = 0;
            
            if (isHovered) {
                const glowStroke = currentPlayer === "X" ? "#00d2ff" : "#ff2a5f";
                drawRoundedRect(
                    x, y, currentCellSize, currentCellSize, 2,
                    "rgba(0, 210, 255, 0.15)",
                    glowStroke,
                    2.5
                );
            } else {
                drawRoundedRect(
                    x, y, currentCellSize, currentCellSize, 2,
                    "rgba(11, 26, 48, 0.8)",
                    "rgba(255, 255, 255, 0.15)",
                    1.5
                );
            }

            const cellKey = `${row},${col}`;
            if (activeSkill === "swap" && swapFirstCell && swapFirstCell.row === row && swapFirstCell.col === col) {
                ctx.strokeStyle = "#ffd32a";
                ctx.lineWidth = 2.5;
                ctx.setLineDash([5, 3]);
                ctx.strokeRect(x + 2, y + 2, currentCellSize - 4, currentCellSize - 4);
                ctx.setLineDash([]);
            }

            if (cellVal === "X") drawX(x, y, currentCellSize);
            else if (cellVal === "O") drawO(x, y, currentCellSize);
            else if (cellVal === "W") drawWall(x, y, currentCellSize);
            else if (lockedCells[cellKey]) drawLock(x, y, currentCellSize, lockedCells[cellKey]);
        }
    }

    // Draw Winning Strike Through Line
    if (winningLine) {
        ctx.shadowBlur = 0;
        ctx.lineCap = "round";
        
        let startX, startY, endX, endY;
        const halfCell = currentCellSize / 2;
        
        if (winningLine.type === "row") {
            const rowY = currentGap + winningLine.index * (currentCellSize + currentGap) + halfCell;
            startX = currentGap; startY = rowY; endX = SIZE - currentGap; endY = rowY;
        } else if (winningLine.type === "col") {
            const colX = currentGap + winningLine.index * (currentCellSize + currentGap) + halfCell;
            startX = colX; startY = currentGap; endX = colX; endY = SIZE - currentGap;
        } else if (winningLine.type === "diag1") {
            startX = currentGap; startY = currentGap; endX = SIZE - currentGap; endY = SIZE - currentGap;
        } else if (winningLine.type === "diag2") {
            startX = SIZE - currentGap; startY = currentGap; endX = currentGap; endY = SIZE - currentGap;
        }
        
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(startX + 4, startY + 4);
        ctx.lineTo(endX + 4, endY + 4);
        ctx.stroke();
        
        ctx.strokeStyle = "#ffd32a";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}

// --- Draw Specific Elements ---
function drawX(x, y, currentCellSize) {
    ctx.shadowBlur = 0;
    const PAD = currentCellSize * 0.25;
    const lineWidth = boardSize === 3 ? 8 : (boardSize === 5 ? 5.5 : 4);
    ctx.lineCap = "square";

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = lineWidth + 2.5;
    const offset = 3.5;
    ctx.beginPath();
    ctx.moveTo(x + PAD + offset, y + PAD + offset);
    ctx.lineTo(x + currentCellSize - PAD + offset, y + currentCellSize - PAD + offset);
    ctx.moveTo(x + currentCellSize - PAD + offset, y + PAD + offset);
    ctx.lineTo(x + PAD + offset, y + currentCellSize - PAD + offset);
    ctx.stroke();

    ctx.strokeStyle = "#00d2ff";
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x + PAD, y + PAD);
    ctx.lineTo(x + currentCellSize - PAD, y + currentCellSize - PAD);
    ctx.moveTo(x + currentCellSize - PAD, y + PAD);
    ctx.lineTo(x + PAD, y + currentCellSize - PAD);
    ctx.stroke();
}

function drawO(x, y, currentCellSize) {
    ctx.shadowBlur = 0;
    const PAD = currentCellSize * 0.25;
    const r = currentCellSize / 2 - PAD;
    const cx = x + currentCellSize / 2;
    const cy = y + currentCellSize / 2;
    const lineWidth = boardSize === 3 ? 8 : (boardSize === 5 ? 5.5 : 4);
    ctx.lineCap = "square";

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = lineWidth + 2.5;
    const offset = 3.5;
    ctx.beginPath();
    ctx.arc(cx + offset, cy + offset, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#ff2a5f";
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
}

function drawWall(x, y, currentCellSize) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 42, 95, 0.15)";
    ctx.strokeStyle = "#ff2a5f";
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5, currentCellSize - 10, currentCellSize - 10, 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 2.5;
    const offset = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 10 + offset, y + 10 + offset);
    ctx.lineTo(x + currentCellSize - 10 + offset, y + currentCellSize - 10 + offset);
    ctx.moveTo(x + currentCellSize - 10 + offset, y + 10 + offset);
    ctx.lineTo(x + 10 + offset, y + currentCellSize - 10 + offset);
    ctx.stroke();
    
    ctx.strokeStyle = "#ff2a5f";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 10);
    ctx.lineTo(x + currentCellSize - 10, y + currentCellSize - 10);
    ctx.moveTo(x + currentCellSize - 10, y + 10);
    ctx.lineTo(x + 10, y + currentCellSize - 10);
    ctx.stroke();
}

function drawLock(x, y, currentCellSize, turnsLeft) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 211, 42, 0.12)";
    ctx.strokeStyle = "#ffd32a";
    ctx.lineWidth = 2.5;
    
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5, currentCellSize - 10, currentCellSize - 10, 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3.5;
    const cx = x + currentCellSize / 2;
    const cy = y + currentCellSize / 2;
    const sizeScale = currentCellSize / 120;
    const offset = 1.5;
    
    ctx.beginPath();
    ctx.arc(cx + offset, cy - 10 * sizeScale + offset, 12 * sizeScale, Math.PI, 0);
    ctx.stroke();
    
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.roundRect(cx - 16 * sizeScale + offset, cy - 8 * sizeScale + offset, 32 * sizeScale, 22 * sizeScale, 2 * sizeScale);
    ctx.fill();
    
    ctx.strokeStyle = "#ffd32a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 10 * sizeScale, 12 * sizeScale, Math.PI, 0);
    ctx.stroke();
    
    ctx.fillStyle = "#ffd32a";
    ctx.beginPath();
    ctx.roundRect(cx - 16 * sizeScale, cy - 8 * sizeScale, 32 * sizeScale, 22 * sizeScale, 2 * sizeScale);
    ctx.fill();
    
    ctx.fillStyle = "#040914";
    ctx.beginPath();
    ctx.arc(cx, cy + 1 * sizeScale, 3 * sizeScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 1.5 * sizeScale, cy + 2 * sizeScale, 3 * sizeScale, 6 * sizeScale);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(11 * sizeScale)}px Outfit`;
    ctx.textAlign = "center";
    ctx.fillText(`${turnsLeft}T`, cx, cy + 28 * sizeScale);
}

// --- Coordinate Translation Helper ---
export function getCellFromCoords(clientX, clientY, canvasElement) {
    const rect = canvasElement.getBoundingClientRect();
    const clickX = ((clientX - rect.left) / rect.width) * SIZE;
    const clickY = ((clientY - rect.top) / rect.height) * SIZE;
    
    const currentGap = boardSize === 3 ? 10 : (boardSize === 5 ? 6 : 4);
    const currentCellSize = Math.floor((SIZE - (boardSize + 1) * currentGap) / boardSize);

    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const x = currentGap + c * (currentCellSize + currentGap);
            const y = currentGap + r * (currentCellSize + currentGap);
            if (clickX >= x && clickX <= x + currentCellSize &&
                clickY >= y && clickY <= y + currentCellSize) {
                return { row: r, col: c };
            }
        }
    }
    return null;
}
