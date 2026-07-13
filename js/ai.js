// --- AI Search Settings ---
let startTime = 0;
const TIME_LIMIT = 500;
let searchAborted = false;

// --- Board State Evaluation ---
export function evaluateBoard(b, boardSize, player1Symbol, player2Symbol) {
    const size = boardSize;
    
    for (let r = 0; r < size; r++) {
        const first = b[r][0];
        if (first && first !== "W" && first !== "") {
            let win = true;
            for (let c = 1; c < size; c++) {
                if (b[r][c] !== first) { win = false; break; }
            }
            if (win) return first;
        }
    }
    
    for (let c = 0; c < size; c++) {
        const first = b[0][c];
        if (first && first !== "W" && first !== "") {
            let win = true;
            for (let r = 1; r < size; r++) {
                if (b[r][c] !== first) { win = false; break; }
            }
            if (win) return first;
        }
    }
    
    const firstTL = b[0][0];
    if (firstTL && firstTL !== "W" && firstTL !== "") {
        let win = true;
        for (let i = 1; i < size; i++) {
            if (b[i][i] !== firstTL) { win = false; break; }
        }
        if (win) return firstTL;
    }
    
    const firstTR = b[0][size - 1];
    if (firstTR && firstTR !== "W" && firstTR !== "") {
        let win = true;
        for (let i = 1; i < size; i++) {
            if (b[i][size - 1 - i] !== firstTR) { win = false; break; }
        }
        if (win) return firstTR;
    }
    
    return null;
}

export function isBoardFull(b) {
    return b.every(row => row.every(cell => cell !== ""));
}

// --- Heuristic Evaluation Functions ---
export function heuristicScore(b, boardSize, player1Symbol, player2Symbol) {
    let score = 0;
    const size = boardSize;
    
    function scoreLine(cells) {
        let aiCount = 0, playerCount = 0, wallCount = 0;
        cells.forEach(val => {
            if (val === player2Symbol) aiCount++;
            else if (val === player1Symbol) playerCount++;
            else if (val === "W") wallCount++;
        });
        if (wallCount > 0) return 0;
        if (aiCount > 0 && playerCount > 0) return 0;
        if (aiCount > 0) {
            return Math.pow(10, aiCount);
        }
        if (playerCount > 0) {
            return -Math.pow(10, playerCount) * 1.5;
        }
        return 0;
    }
    
    for (let r = 0; r < size; r++) score += scoreLine(b[r]);
    for (let c = 0; c < size; c++) {
        const colCells = [];
        for (let r = 0; r < size; r++) colCells.push(b[r][c]);
        score += scoreLine(colCells);
    }
    const diag1 = [], diag2 = [];
    for (let i = 0; i < size; i++) { diag1.push(b[i][i]); diag2.push(b[i][size - 1 - i]); }
    score += scoreLine(diag1);
    score += scoreLine(diag2);
    return score;
}

// --- Move Ordering Optimization ---
function getOrderedMoves(b, boardSize, player1Symbol, player2Symbol, isMax) {
    const moves = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (b[r][c] === "") {
                let hasNeighbor = false;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
                            if (b[nr][nc] !== "" && b[nr][nc] !== "W") {
                                hasNeighbor = true;
                                break;
                            }
                        }
                    }
                    if (hasNeighbor) break;
                }
                
                let moveScore = 0;
                if (hasNeighbor || boardSize === 3) {
                    b[r][c] = isMax ? player2Symbol : player1Symbol;
                    moveScore = heuristicScore(b, boardSize, player1Symbol, player2Symbol);
                    b[r][c] = "";
                } else {
                    moveScore = isMax ? -1000 : 1000;
                }
                
                moves.push({ row: r, col: c, score: moveScore });
            }
        }
    }
    
    if (isMax) {
        moves.sort((a, b) => b.score - a.score);
    } else {
        moves.sort((a, b) => a.score - b.score);
    }
    return moves;
}

// --- Alpha-Beta Minimax Engine ---
function minimax(b, depth, maxDepth, isMax, alpha, beta, boardSize, player1Symbol, player2Symbol) {
    if (performance.now() - startTime > TIME_LIMIT) {
        searchAborted = true;
        return 0;
    }

    const score = evaluateBoard(b, boardSize, player1Symbol, player2Symbol);
    if (score === player2Symbol) return 1000 - depth;
    if (score === player1Symbol) return depth - 1000;
    if (isBoardFull(b)) return 0;
    
    if (depth >= maxDepth) {
        return heuristicScore(b, boardSize, player1Symbol, player2Symbol);
    }

    const moves = getOrderedMoves(b, boardSize, player1Symbol, player2Symbol, isMax);

    if (isMax) {
        let best = -10000;
        for (let i = 0; i < moves.length; i++) {
            const { row, col } = moves[i];
            b[row][col] = player2Symbol;
            const val = minimax(b, depth + 1, maxDepth, false, alpha, beta, boardSize, player1Symbol, player2Symbol);
            b[row][col] = "";
            
            if (searchAborted) return 0;
            best = Math.max(best, val);
            alpha = Math.max(alpha, best);
            if (beta <= alpha) break;
        }
        return best;
    } else {
        let best = 10000;
        for (let i = 0; i < moves.length; i++) {
            const { row, col } = moves[i];
            b[row][col] = player1Symbol;
            const val = minimax(b, depth + 1, maxDepth, true, alpha, beta, boardSize, player1Symbol, player2Symbol);
            b[row][col] = "";
            
            if (searchAborted) return 0;
            best = Math.min(best, val);
            beta = Math.min(beta, best);
            if (beta <= alpha) break;
        }
        return best;
    }
}

// --- Instant Win/Block Scans ---
function findImmediateWin(b, boardSize, symbol, player1Symbol, player2Symbol) {
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (b[r][c] === "") {
                b[r][c] = symbol;
                const hasWon = evaluateBoard(b, boardSize, player1Symbol, player2Symbol) === symbol;
                b[r][c] = "";
                if (hasWon) return { row: r, col: c };
            }
        }
    }
    return null;
}

// --- Iterative Deepening Minimax Search ---
export function findBestMove(b, boardSize, player1Symbol, player2Symbol) {
    startTime = performance.now();
    searchAborted = false;
    
    const immediateAIWin = findImmediateWin(b, boardSize, player2Symbol, player1Symbol, player2Symbol);
    if (immediateAIWin) return immediateAIWin;
    
    const immediatePlayerWin = findImmediateWin(b, boardSize, player1Symbol, player1Symbol, player2Symbol);
    if (immediatePlayerWin) return immediatePlayerWin;
    
    let overallBestMove = { row: -1, col: -1 };
    const maxAllowedDepth = boardSize === 3 ? 9 : (boardSize === 5 ? 5 : 3);
    
    for (let currentMaxDepth = 1; currentMaxDepth <= maxAllowedDepth; currentMaxDepth++) {
        let bestVal = -100000;
        let bestMoveForDepth = { row: -1, col: -1 };
        
        const orderedMoves = getOrderedMoves(b, boardSize, player1Symbol, player2Symbol, true);
        if (orderedMoves.length === 0) break;
        if (orderedMoves.length === 1) {
            overallBestMove = orderedMoves[0];
            break;
        }

        for (let i = 0; i < orderedMoves.length; i++) {
            const { row, col } = orderedMoves[i];
            b[row][col] = player2Symbol;
            const v = minimax(b, 0, currentMaxDepth, false, -100000, 100000, boardSize, player1Symbol, player2Symbol);
            b[row][col] = "";
            
            if (searchAborted) break;
            
            if (v > bestVal) {
                bestVal = v;
                bestMoveForDepth = { row, col };
            }
        }
        
        if (!searchAborted) {
            overallBestMove = bestMoveForDepth;
        } else {
            break;
        }
    }
    
    if (overallBestMove.row === -1) {
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (b[r][c] === "") return { row: r, col: c };
            }
        }
    }
    return overallBestMove;
}

// --- Entry Point for AI Decision ---
export function getAIMove(board, boardSize, player1Symbol, player2Symbol, difficulty, player2Lives, gameMode) {
    let randomChance = 0.3;

    if (gameMode === "classic") {
        if (difficulty === "easy") randomChance = 0.6;
        else if (difficulty === "medium") randomChance = 0.3;
        else randomChance = 0.05;
    } else {
        if (difficulty === "easy") {
            if (player2Lives === 3) randomChance = 0.7;
            else if (player2Lives === 2) randomChance = 0.5;
            else randomChance = 0.3;
        } else if (difficulty === "medium") {
            if (player2Lives === 3) randomChance = 0.5;
            else if (player2Lives === 2) randomChance = 0.3;
            else randomChance = 0.1;
        } else {
            if (player2Lives === 3) randomChance = 0.2;
            else if (player2Lives === 2) randomChance = 0.1;
            else randomChance = 0.0;
        }
    }

    const empty = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === "") empty.push({ row: r, col: c });
        }
    }

    if (empty.length === 0) return null;

    if (Math.random() < randomChance) {
        return empty[Math.floor(Math.random() * empty.length)];
    }
    
    const boardCopy = board.map(row => [...row]);
    const best = findBestMove(boardCopy, boardSize, player1Symbol, player2Symbol);
    return (best.row !== -1) ? best : empty[Math.floor(Math.random() * empty.length)];
}
