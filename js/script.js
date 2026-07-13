import {
    board,
    boardSize,
    currentPlayer,
    gameOver,
    gameMode,
    opponentType,
    aiDifficulty,
    player1Lives,
    player2Lives,
    aiIsThinking,
    hoveredCell,
    player1Symbol,
    player2Symbol,
    player1Inventory,
    player2Inventory,
    lockedCells,
    wallCells,
    player1Shield,
    player2Shield,
    opponentFrozen,
    doubleMovesLeft,
    activeSkill,
    activeSkillIndex,
    activeSkillPlayerNum,
    swapFirstCell,
    selectedBoardSize,
    winningLine,
    scoreboard,
    SKILLS,
    TIPS,
    
    // Setters
    setBoard,
    setBoardSize,
    setCurrentPlayer,
    setGameOver,
    setGameMode,
    setOpponentType,
    setAiDifficulty,
    setPlayer1Lives,
    setPlayer2Lives,
    setAiIsThinking,
    setHoveredCell,
    setPlayer1Symbol,
    setPlayer2Symbol,
    setPlayer1Inventory,
    setPlayer2Inventory,
    setLockedCells,
    setWallCells,
    setPlayer1Shield,
    setPlayer2Shield,
    setOpponentFrozen,
    setDoubleMovesLeft,
    setActiveSkill,
    setActiveSkillIndex,
    setActiveSkillPlayerNum,
    setSwapFirstCell,
    setSelectedBoardSize,
    setWinningLine,
    
    // Callbacks
    setDrawCallback,
    setUpdateTurnDisplayCallback,
    setUpdateHeartsDisplayCallback,
    setShowAoaVictoryScreenCallback,
    setShowAoaDrawScreenCallback,
    setShowToastCallback,
    setRenderInventoriesCallback,
    setUpdateShieldAvatarDisplayCallback,
    setShowShuffleTimeModalCallback,
    setShowScreenCallback,
    setPlayP3RTransitionCallback,
    
    // Core Logic Functions
    checkWinner,
    isDraw,
    activateSkill,
    executeInstantSkill,
    advanceTurn,
    handleGameEnd,
    checkAndTriggerAiFirstTurn,
    _launchGame,
    loadScoreboard,
    saveScoreboard
} from "./game-logic.js";

import {
    isMuted,
    bgmVolume,
    sfxVolume,
    clickSound,
    winSound,
    initBGM,
    playBGM,
    playSound,
    playButtonClickSound,
    playCardAppearSound,
    playCardCollectSound,
    playP3RVictorySound,
    playP3RDrawSound,
    playP3RTransitionSound,
    setBgmVolume,
    setSfxVolume,
    toggleMute,
    updateMuteButtonVisual
} from "./audio.js";

import {
    initCanvas,
    drawBoard,
    resizeCanvas,
    getCellFromCoords
} from "./canvas-renderer.js";

// --- DOM Cache ---
const canvas = document.getElementById("game");
const turnText = document.getElementById("turn");

const homeScreen = document.getElementById("home-screen");
const rulesScreen = document.getElementById("rules-screen");
const playScreen = document.getElementById("play-screen");
const gameCard = document.querySelector(".game-card");

const resultModal = document.getElementById("result-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalIcon = document.getElementById("modal-icon");
const modalActionBtn = document.getElementById("modalActionBtn");
const modalHomeBtn = document.getElementById("modalHomeBtn");

const scoreboardModal = document.getElementById("scoreboard-modal");
const closeScoreboardBtn = document.getElementById("closeScoreboardBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const playBtn = document.getElementById("playBtn");
const scoreboardBtn = document.getElementById("scoreboardBtn");
const rulesBtn = document.getElementById("rulesBtn");
const rulesBackBtn = document.getElementById("rulesBackBtn");

const modeBackBtn = document.getElementById("modeBackBtn");
const modeHomeBackBtn = document.getElementById("modeHomeBackBtn");
const playPvpBtn = document.getElementById("playPvpBtn");
const playAiBtn = document.getElementById("playAiBtn");

const exitGameBtn = document.getElementById("exitGameBtn");
const gameRulesBtn = document.getElementById("gameRulesBtn");
const resetGameBtn = document.getElementById("resetGameBtn");

const playerXLivesText = document.getElementById("player-x-lives");
const playerOLivesText = document.getElementById("player-o-lives");
const labelX = document.getElementById("label-x");
const labelO = document.getElementById("label-o");
const difficultySection = document.getElementById("difficulty-section");

const symbolPickerModal = document.getElementById("symbol-picker-modal");
const symbolPickLabel = document.getElementById("symbol-pick-label");
const pickXBtn = document.getElementById("pickXBtn");
const pickOBtn = document.getElementById("pickOBtn");

const globalMuteBtn = document.getElementById("global-mute-btn");
const audioSettingsPanel = document.getElementById("audio-settings-panel");
const bgmSlider = document.getElementById("bgm-volume-slider");
const sfxSlider = document.getElementById("sfx-volume-slider");
const bgmValText = document.getElementById("bgm-vol-value");
const sfxValText = document.getElementById("sfx-vol-value");
const muteAllBtn = document.getElementById("mute-all-btn");

const SIZE = 400;
let previousScreen = homeScreen;

// --- Canvas Initial Setup ---
initCanvas(canvas);

// --- Register Delegates ---
setDrawCallback(drawBoard);
setUpdateTurnDisplayCallback(updateTurnDisplayUI);
setUpdateHeartsDisplayCallback(updateHeartsDisplayUI);
setShowAoaVictoryScreenCallback(showAoaVictoryScreen);
setShowAoaDrawScreenCallback(showAoaDrawScreen);
setShowToastCallback(showToast);
setRenderInventoriesCallback(renderInventoriesUI);
setUpdateShieldAvatarDisplayCallback(updateShieldAvatarDisplayUI);
setShowShuffleTimeModalCallback(showShuffleTimeModal);
setShowScreenCallback(showScreen);
setPlayP3RTransitionCallback(playP3RTransition);

// --- UI Route Coordinator ---
function showScreen(screen) {
    if (screen === rulesScreen) {
        if (!homeScreen.classList.contains("hidden")) previousScreen = homeScreen;
        else if (!gameCard.classList.contains("hidden")) previousScreen = gameCard;
    }
    
    [homeScreen, rulesScreen, playScreen, gameCard].forEach(s => {
        if (s) s.classList.add("hidden");
    });
    if (screen) screen.classList.remove("hidden");
}

// --- Dynamic HUD Updates ---
function updateTurnDisplayUI() {
    const pXCard = document.getElementById("p-x-card");
    const pOCard = document.getElementById("p-o-card");

    if (currentPlayer === "X") {
        pXCard.classList.add("active");
        pOCard.classList.remove("active");
        turnText.style.color = "var(--neon-cyan)";
    } else {
        pOCard.classList.add("active");
        pXCard.classList.remove("active");
        turnText.style.color = "var(--neon-pink)";
    }

    if (currentPlayer === player1Symbol) {
        turnText.textContent = opponentType === "ai" ? `Player (Anda) (${player1Symbol})` : `Pemain 1 (${player1Symbol})`;
    } else {
        turnText.textContent = opponentType === "ai" ? `AI (${player2Symbol})` : `Pemain 2 (${player2Symbol})`;
    }
}

function updateHeartsDisplayUI() {
    if (player1Symbol === "X") {
        labelX.textContent = opponentType === "ai" ? "Player (Anda)" : "Pemain 1";
        labelO.textContent = opponentType === "ai" ? "AI (Komputer)" : "Pemain 2";
        playerXLivesText.textContent = "❤️".repeat(player1Lives) + "🖤".repeat(3 - player1Lives);
        playerOLivesText.textContent = "❤️".repeat(player2Lives) + "🖤".repeat(3 - player2Lives);
    } else {
        labelX.textContent = opponentType === "ai" ? "AI (Komputer)" : "Pemain 2";
        labelO.textContent = opponentType === "ai" ? "Player (Anda)" : "Pemain 1";
        playerXLivesText.textContent = "❤️".repeat(player2Lives) + "🖤".repeat(3 - player2Lives);
        playerOLivesText.textContent = "❤️".repeat(player1Lives) + "🖤".repeat(3 - player1Lives);
    }

    if (gameMode === "battle") {
        playerXLivesText.classList.remove("hidden");
        playerOLivesText.classList.remove("hidden");
    } else {
        playerXLivesText.classList.add("hidden");
        playerOLivesText.classList.add("hidden");
    }
}

function showConfetti() {
    if (window.confetti) {
        window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
}

// --- Victory Screen Controller ---
function showAoaVictoryScreen(winner) {
    const aoaScreen = document.getElementById("aoa-victory-screen");
    const aoaSymbol = document.getElementById("aoa-winner-symbol");
    const aoaTitle = document.getElementById("aoa-winner-title");
    const aoaQuote = document.getElementById("aoa-victory-quote");
    const aoaSubtext = document.getElementById("aoa-subtext");
    
    aoaSymbol.textContent = winner;
    const variant = Math.random() < 0.5 ? "A" : "B";
    
    if (winner === "X") {
        if (variant === "A") {
            document.documentElement.style.setProperty('--aoa-color-primary', '#0e1e38');
            document.documentElement.style.setProperty('--aoa-color-accent', '#00d2ff');
        } else {
            document.documentElement.style.setProperty('--aoa-color-primary', '#121b2d');
            document.documentElement.style.setProperty('--aoa-color-accent', '#00f5d4');
        }
    } else {
        if (variant === "A") {
            document.documentElement.style.setProperty('--aoa-color-primary', '#3a0512');
            document.documentElement.style.setProperty('--aoa-color-accent', '#ff2a5f');
        } else {
            document.documentElement.style.setProperty('--aoa-color-primary', '#1c170d');
            document.documentElement.style.setProperty('--aoa-color-accent', '#ffd32a');
        }
    }
    
    const isP1Winner = (winner === player1Symbol);
    
    if (isP1Winner) {
        aoaTitle.textContent = opponentType === "ai" ? "PLAYER WINS" : "PLAYER 1 WINS";
        if (winner === "X") {
            aoaQuote.textContent = (variant === "A") ? `"I've got this."` : `"Target locked. Eliminating."`;
        } else {
            aoaQuote.textContent = (variant === "A") ? `"Formidable."` : `"Justice has been served!"`;
        }
        aoaSubtext.textContent = opponentType === "ai"
            ? "Pertempuran berhasil dituntaskan dengan kemenangan gemilang atas AI!"
            : "Pemain 1 membuktikan taktiknya jauh lebih unggul!";
            
        if (gameMode === "battle") {
            if (opponentType === "pvp") scoreboard.battle.pvp.winsP1++;
            else scoreboard.battle.ai.winsPlayer++;
        } else {
            if (opponentType === "pvp") scoreboard.classic.pvp.winsX++;
            else scoreboard.classic.ai.winsPlayer++;
        }
    } else {
        if (opponentType === "ai") {
            aoaTitle.textContent = "AI WINS";
            if (winner === "X") {
                aoaQuote.textContent = (variant === "A") ? `"Calculated to perfection."` : `"A logical outcome."`;
            } else {
                aoaQuote.textContent = (variant === "A") ? `"There is no avoiding one's fate."` : `"The Arcana is the means by which all is revealed..."`;
            }
            aoaSubtext.textContent = "Analisis AI membuktikan strateginya tidak tertembus!";
            
            if (gameMode === "battle") {
                scoreboard.battle.ai.winsAI++;
            } else {
                scoreboard.classic.ai.winsAI++;
            }
        } else {
            aoaTitle.textContent = "PLAYER 2 WINS";
            if (winner === "X") {
                aoaQuote.textContent = (variant === "A") ? `"Who's da man?!"` : `"Outplayed and outmatched!"`;
            } else {
                aoaQuote.textContent = (variant === "A") ? `"I've been waiting for this!"` : `"Too hot to handle!"`;
            }
            aoaSubtext.textContent = "Pemain 2 melumpuhkan pertahanan lawan dengan sempurna!";
            
            if (gameMode === "battle") {
                scoreboard.battle.pvp.winsP2++;
            } else {
                if (winner === "X") scoreboard.classic.pvp.winsX++;
                else scoreboard.classic.pvp.winsO++;
            }
        }
    }
    
    saveScoreboard();
    playP3RVictorySound();
    aoaScreen.classList.remove("hidden");
    showConfetti();
}

// --- Draw Screen Controller ---
function showAoaDrawScreen() {
    const drawScreen = document.getElementById("aoa-draw-screen");
    const drawTitle = document.getElementById("aoa-draw-title");
    const drawQuote = document.getElementById("aoa-draw-quote");
    
    document.documentElement.style.setProperty('--aoa-color-primary', '#1e293b');
    document.documentElement.style.setProperty('--aoa-color-accent', '#94a3b8');
    
    const drawQuotes = [
        `"Two forces, perfectly matched."`,
        `"The battle rages on..."`,
        `"Let's keep up the momentum!"`,
        `"Neither side yields."`,
    ];
    drawQuote.textContent = drawQuotes[Math.floor(Math.random() * drawQuotes.length)];
    
    if (gameMode === "battle") {
        drawTitle.textContent = "ROUND DRAW";
    } else {
        drawTitle.textContent = "DRAW GAME";
    }
    
    if (gameMode === "classic" || gameMode === "ultimate") {
        if (opponentType === "pvp") scoreboard.classic.pvp.draws++;
        else scoreboard.classic.ai.draws++;
    }
    saveScoreboard();
    playP3RDrawSound();
    drawScreen.classList.remove("hidden");
}

// --- Toast Popup ---
function showToast(message) {
    let toast = document.getElementById("toast-alert");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-alert";
        toast.className = "toast-alert";
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>${message}</span>`;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// --- Skills Inventory Updates ---
function renderInventoriesUI() {
    const p1Count = document.getElementById("p-x-inv-count");
    const p1SkillsGrid = document.getElementById("p-x-skills");
    if (p1Count && p1SkillsGrid) {
        p1Count.textContent = `(${player1Inventory.length}/5)`;
        p1SkillsGrid.innerHTML = "";
        player1Inventory.forEach((skillId, index) => {
            const skill = SKILLS[skillId];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `skill-item rarity-${skill.rarity}`;
            btn.innerHTML = skill.icon;
            btn.title = `${skill.name}: ${skill.desc}`;
            
            const isP1Turn = (currentPlayer === player1Symbol);
            const isHuman = (opponentType !== "ai" || player1Symbol === "X" ? isP1Turn : false);
            if (isP1Turn && !aiIsThinking && !gameOver && isHuman) {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    activateSkill(skillId, index, 1);
                });
            } else {
                btn.disabled = true;
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
            }
            p1SkillsGrid.appendChild(btn);
        });
    }

    const p2Count = document.getElementById("p-o-inv-count");
    const p2SkillsGrid = document.getElementById("p-o-skills");
    if (p2Count && p2SkillsGrid) {
        p2Count.textContent = `(${player2Inventory.length}/5)`;
        p2SkillsGrid.innerHTML = "";
        player2Inventory.forEach((skillId, index) => {
            const skill = SKILLS[skillId];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `skill-item rarity-${skill.rarity}`;
            btn.innerHTML = skill.icon;
            btn.title = `${skill.name}: ${skill.desc}`;
            
            const isP2Turn = (currentPlayer === player2Symbol);
            const isHuman = (opponentType !== "ai" && isP2Turn);
            if (isP2Turn && !aiIsThinking && !gameOver && isHuman) {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    activateSkill(skillId, index, 2);
                });
            } else {
                btn.disabled = true;
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
            }
            p2SkillsGrid.appendChild(btn);
        });
    }
}

// --- Shield Indicators ---
function updateShieldAvatarDisplayUI() {
    const indicators = document.querySelectorAll(".shield-active-indicator");
    indicators.forEach(el => el.remove());
    
    if (player1Shield) {
        const shieldSpan = document.createElement("span");
        shieldSpan.className = "shield-active-indicator";
        shieldSpan.innerHTML = `<i class="fa-solid fa-shield-halved"></i> SHIELD`;
        if (player1Symbol === "X") labelX.appendChild(shieldSpan);
        else labelO.appendChild(shieldSpan);
    }
    if (player2Shield) {
        const shieldSpan = document.createElement("span");
        shieldSpan.className = "shield-active-indicator";
        shieldSpan.innerHTML = `<i class="fa-solid fa-shield-halved"></i> SHIELD`;
        if (player2Symbol === "X") labelX.appendChild(shieldSpan);
        else labelO.appendChild(shieldSpan);
    }
}

// --- Shuffle Time Overlay ---
function showShuffleTimeModal(skillId) {
    const shuffleModal = document.getElementById("shuffle-modal");
    const card = document.getElementById("holo-card");
    const rarityText = document.getElementById("holo-card-rarity");
    const iconDiv = document.getElementById("holo-card-icon");
    const nameH2 = document.getElementById("holo-card-name");
    const descP = document.getElementById("holo-card-desc");

    const skill = SKILLS[skillId];
    rarityText.textContent = skill.rarity.toUpperCase();
    iconDiv.textContent = skill.icon;
    nameH2.textContent = skill.name;
    descP.textContent = skill.desc;

    shuffleModal.className = "modal-overlay";
    card.style.transform = 'perspective(1000px) rotateY(180deg) scale(0.1)';
    card.classList.remove("spin-in");
    void card.offsetWidth;
    card.classList.add("spin-in");
    
    let glow, h1, h2;
    if (skill.rarity === "common") {
        glow = "rgba(46, 213, 115, 0.35)";
        h1 = "rgba(46, 213, 115, 0.2)";
        h2 = "rgba(255, 255, 255, 0.1)";
        rarityText.style.background = "#2ed573";
        rarityText.style.color = "#ffffff";
    } else if (skill.rarity === "rare") {
        glow = "rgba(255, 211, 42, 0.35)";
        h1 = "rgba(255, 211, 42, 0.2)";
        h2 = "rgba(255, 42, 95, 0.15)";
        rarityText.style.background = "#ffd32a";
        rarityText.style.color = "#000000";
    } else {
        glow = "rgba(191, 85, 236, 0.45)";
        h1 = "rgba(191, 85, 236, 0.25)";
        h2 = "rgba(0, 210, 255, 0.2)";
        rarityText.style.background = "#bf55ec";
        rarityText.style.color = "#ffffff";
    }
    
    card.style.setProperty('--color-glow', glow);
    card.style.setProperty('--color-holo-1', h1);
    card.style.setProperty('--color-holo-2', h2);

    shuffleModal.classList.remove("hidden");
    playCardAppearSound();

    const removeSpinClass = () => {
        card.classList.remove("spin-in");
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        card.removeEventListener("animationend", removeSpinClass);
    };
    card.addEventListener("animationend", removeSpinClass);
    
    card.onmouseenter = () => {
        card.classList.remove("spin-in");
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    };

    card.onclick = () => {
        shuffleModal.classList.add("collecting");
        const playerNum = (currentPlayer === player1Symbol) ? 1 : 2;
        shuffleModal.classList.add(`collect-p${playerNum}`);
        
        playCardCollectSound();

        setTimeout(() => {
            const activeInv = (currentPlayer === player1Symbol) ? player1Inventory : player2Inventory;
            activeInv.push(skillId);
            renderInventoriesUI();
            
            shuffleModal.classList.add("hidden");
            shuffleModal.classList.remove("collecting", `collect-p${playerNum}`);
            
            const playerLabel = (currentPlayer === player1Symbol) ? 'Pemain 1' : 'Pemain 2';
            showToast(`🎲 ${playerLabel} mendapat skill ${skill.name}!`);
        }, 600);
    };
}

// --- Screen Slide Transitions ---
function playP3RTransition(label, callback) {
    const el = document.getElementById("p3r-transition");
    const textEl = document.getElementById("p3r-trans-label");
    
    textEl.textContent = label || "ENGAGE!";
    el.classList.remove("active");
    el.classList.remove("hidden");
    
    void el.offsetWidth;
    el.classList.add("active");
    playP3RTransitionSound();
    
    setTimeout(() => {
        if (callback) callback();
    }, 400);
    
    setTimeout(() => {
        el.classList.remove("active");
        el.classList.add("hidden");
    }, 1050);
}

function updateRandomTip() {
    const tipText = document.getElementById("tip-text");
    if (tipText) {
        tipText.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
    }
}

function startGame() {
    let transLabel;
    if (gameMode === "ultimate") transLabel = "ULTIMATE MODE";
    else if (gameMode === "battle") transLabel = "BATTLE START";
    else transLabel = "GAME START";
    
    playP3RTransition(transLabel, () => _launchGame(SIZE));
}

// --- Lobby Nav Events ---
const modeTabBtns = document.querySelectorAll(".lobby-tab-btn");
modeTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        modeTabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        setGameMode(btn.dataset.mode);

        const pvpDesc = document.querySelector(".lobby-card[data-opponent='pvp'] .lobby-card-desc");
        const aiDesc = document.querySelector(".lobby-card[data-opponent='ai'] .lobby-card-desc");
        const pvpBadge = document.querySelector(".lobby-card[data-opponent='pvp'] .badge-rules");

        if (gameMode === "ultimate") {
            if (pvpDesc) pvpDesc.textContent = "Bermain offline bergantian dengan sistem Random Skill Inventory & board dinamis.";
            if (aiDesc) aiDesc.textContent = "Tantang AI di papan besar. AI akan menggunakan taktik cerdas, memasang tembok, dan menggunakan skill!";
            if (pvpBadge) {
                pvpBadge.textContent = "SKILL INVENTORY";
                pvpBadge.style.background = "rgba(255, 159, 67, 0.15)";
                pvpBadge.style.color = "#ff9f43";
                pvpBadge.style.border = "1px solid rgba(255, 159, 67, 0.3)";
            }
        } else if (gameMode === "battle") {
            if (pvpDesc) pvpDesc.textContent = "Bermain offline dengan 3 Nyawa. Siapa yang kehabisan nyawa lebih dulu kalah!";
            if (aiDesc) aiDesc.textContent = "Tantang AI dengan sistem nyawa. Ketika nyawa AI berkurang, kekuatan dan tingkat kesulitannya bertambah!";
            if (pvpBadge) {
                pvpBadge.textContent = "3 NYAWA (LIVES)";
                pvpBadge.style.background = "rgba(255, 42, 95, 0.15)";
                pvpBadge.style.color = "var(--neon-pink)";
                pvpBadge.style.border = "1px solid rgba(255, 42, 95, 0.3)";
            }
        } else {
            if (pvpDesc) pvpDesc.textContent = "Bermain berdua secara offline di satu perangkat secara bergantian.";
            if (aiDesc) aiDesc.textContent = "Tantang kecerdasan AI minimax dengan tingkat kesulitan adaptif.";
            if (pvpBadge) {
                pvpBadge.textContent = "ATURAN KLASIK";
                pvpBadge.style.background = "rgba(0, 229, 255, 0.15)";
                pvpBadge.style.color = "var(--neon-cyan)";
                pvpBadge.style.border = "1px solid rgba(0, 229, 255, 0.3)";
            }
        }
    });
});

const opponentCards = document.querySelectorAll(".lobby-card");
opponentCards.forEach(card => {
    card.addEventListener("click", () => {
        opponentCards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        setOpponentType(card.dataset.opponent);

        if (opponentType === "ai") {
            difficultySection.classList.remove("disabled-style");
        } else {
            difficultySection.classList.add("disabled-style");
        }
    });
});

const diffBtns = document.querySelectorAll(".lobby-diff-btn");
diffBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = btn.closest(".lobby-card");
        if (card) {
            opponentCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            setOpponentType(card.dataset.opponent);
            difficultySection.classList.remove("disabled-style");
        }
        diffBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        setAiDifficulty(btn.dataset.difficulty);
    });
});

// --- Action Clicks ---
playBtn.addEventListener("click", () => showScreen(playScreen));
rulesBtn.addEventListener("click", () => showScreen(rulesScreen));
rulesBackBtn.addEventListener("click", () => showScreen(previousScreen));
modeBackBtn.addEventListener("click", () => showScreen(homeScreen));
modeHomeBackBtn.addEventListener("click", () => showScreen(homeScreen));

function openSymbolPicker() {
    const boardSizeStep = document.getElementById("board-size-step");
    const symbolStep = document.getElementById("symbol-step-1");
    if (gameMode === "ultimate") {
        boardSizeStep.classList.remove("hidden");
        symbolStep.classList.add("hidden");
    } else {
        boardSizeStep.classList.add("hidden");
        symbolStep.classList.remove("hidden");
    }
    symbolPickerModal.classList.remove("hidden");
}

playPvpBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpponentType("pvp");
    symbolPickLabel.textContent = "Pemain 1, pilih simbolmu:";
    openSymbolPicker();
});

playAiBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpponentType("ai");
    symbolPickLabel.textContent = "Pilih simbolmu:";
    openSymbolPicker();
});

const size5Btn = document.getElementById("size5Btn");
const size7Btn = document.getElementById("size7Btn");

size5Btn.addEventListener("click", () => {
    setSelectedBoardSize(5);
    document.getElementById("board-size-step").classList.add("hidden");
    document.getElementById("symbol-step-1").classList.remove("hidden");
});

size7Btn.addEventListener("click", () => {
    setSelectedBoardSize(7);
    document.getElementById("board-size-step").classList.add("hidden");
    document.getElementById("symbol-step-1").classList.remove("hidden");
});

pickXBtn.addEventListener("click", () => {
    setPlayer1Symbol("X");
    setPlayer2Symbol("O");
    symbolPickerModal.classList.add("hidden");
    startGame();
});

pickOBtn.addEventListener("click", () => {
    setPlayer1Symbol("O");
    setPlayer2Symbol("X");
    symbolPickerModal.classList.add("hidden");
    startGame();
});

exitGameBtn.addEventListener("click", () => {
    resultModal.classList.add("hidden");
    showScreen(homeScreen);
});

gameRulesBtn.addEventListener("click", () => showScreen(rulesScreen));

resetGameBtn.addEventListener("click", () => {
    const newBoard = [];
    for (let r = 0; r < boardSize; r++) newBoard.push(new Array(boardSize).fill(""));
    setBoard(newBoard);
    setCurrentPlayer("X");
    setGameOver(false);
    setAiIsThinking(false);
    setHoveredCell(null);
    setLockedCells({});
    setWallCells({});
    setPlayer1Shield(false);
    setPlayer2Shield(false);
    setOpponentFrozen(false);
    setDoubleMovesLeft(0);
    setActiveSkill(null);
    setSwapFirstCell(null);
    setWinningLine(null);
    setPlayer1Inventory([]);
    setPlayer2Inventory([]);
    
    const banner = document.getElementById("skill-activation-banner");
    if (banner) banner.classList.add("hidden");
    drawBoard();
    updateTurnDisplayUI();
    updateRandomTip();
    
    if (gameMode === "ultimate") {
        addRandomSkillToActivePlayer();
    }
    renderInventoriesUI();
    checkAndTriggerAiFirstTurn();
});

const cancelSkillBtn = document.getElementById("cancelSkillBtn");
if (cancelSkillBtn) {
    cancelSkillBtn.addEventListener("click", () => {
        setActiveSkill(null);
        setSwapFirstCell(null);
        const banner = document.getElementById("skill-activation-banner");
        if (banner) banner.classList.add("hidden");
        drawBoard();
    });
}

// --- Scoreboard Interactions ---
scoreboardBtn.addEventListener("click", () => {
    loadScoreboard();
    scoreboardModal.classList.remove("hidden");
});

closeScoreboardBtn.addEventListener("click", () => {
    scoreboardModal.classList.add("hidden");
});

resetScoreBtn.addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua rekor skor?")) {
        localStorage.removeItem("xo_arena_scoreboard");
        loadScoreboard();
    }
});

// --- Dialog Overlays ---
modalActionBtn.addEventListener("click", () => {
    resultModal.classList.add("hidden");
    const isBattleOver = gameMode === "battle" && (player1Lives === 0 || player2Lives === 0);
    let transLabel = "NEXT ROUND";
    if (isBattleOver) {
        transLabel = "BATTLE RESTART";
    } else if (gameMode !== "battle") {
        transLabel = "RESTART GAME";
    }

    playP3RTransition(transLabel, () => {
        if (isBattleOver) {
            setPlayer1Lives(3);
            setPlayer2Lives(3);
            updateHeartsDisplayUI();
        }

        const newBoard = [];
        for (let r = 0; r < boardSize; r++) newBoard.push(new Array(boardSize).fill(""));
        setBoard(newBoard);
        setGameOver(false);
        setCurrentPlayer("X");
        setHoveredCell(null);
        setLockedCells({});
        setWallCells({});
        setWinningLine(null);
        setPlayer1Inventory([]);
        setPlayer2Inventory([]);
        
        drawBoard();
        updateTurnDisplayUI();
        updateRandomTip();
        
        if (gameMode === "ultimate") {
            addRandomSkillToActivePlayer();
        }
        renderInventoriesUI();
        checkAndTriggerAiFirstTurn();
    });
});

modalHomeBtn.addEventListener("click", () => {
    resultModal.classList.add("hidden");
    showScreen(homeScreen);
});

const viewBoardBtn = document.getElementById("viewBoardBtn");
const closeViewBoardBtn = document.getElementById("closeViewBoardBtn");
if (viewBoardBtn && closeViewBoardBtn) {
    viewBoardBtn.addEventListener("click", () => {
        resultModal.classList.add("hidden");
        closeViewBoardBtn.classList.remove("hidden");
    });
    closeViewBoardBtn.addEventListener("click", () => {
        const winner = checkWinner();
        const isBattleOver = gameMode === "battle" && (player1Lives === 0 || player2Lives === 0);
        if (winner && (gameMode !== "battle" || isBattleOver)) {
            document.getElementById("aoa-victory-screen").classList.remove("hidden");
        } else if (!winner && isDraw()) {
            document.getElementById("aoa-draw-screen").classList.remove("hidden");
        } else {
            resultModal.classList.remove("hidden");
        }
        closeViewBoardBtn.classList.add("hidden");
    });
}

// --- Victory Screen Buttons ---
const aoaActionBtn = document.getElementById("aoaActionBtn");
const aoaViewBoardBtn = document.getElementById("aoaViewBoardBtn");
const aoaHomeBtn = document.getElementById("aoaHomeBtn");

if (aoaActionBtn) {
    aoaActionBtn.addEventListener("click", () => {
        document.getElementById("aoa-victory-screen").classList.add("hidden");
        modalActionBtn.click();
    });
}
if (aoaViewBoardBtn) {
    aoaViewBoardBtn.addEventListener("click", () => {
        document.getElementById("aoa-victory-screen").classList.add("hidden");
        closeViewBoardBtn.classList.remove("hidden");
    });
}
if (aoaHomeBtn) {
    aoaHomeBtn.addEventListener("click", () => {
        document.getElementById("aoa-victory-screen").classList.add("hidden");
        modalHomeBtn.click();
    });
}

// --- Draw Screen Buttons ---
const drawActionBtn = document.getElementById("drawActionBtn");
const drawViewBoardBtn = document.getElementById("drawViewBoardBtn");
const drawHomeBtn = document.getElementById("drawHomeBtn");

if (drawActionBtn) {
    drawActionBtn.addEventListener("click", () => {
        document.getElementById("aoa-draw-screen").classList.add("hidden");
        modalActionBtn.click();
    });
}
if (drawViewBoardBtn) {
    drawViewBoardBtn.addEventListener("click", () => {
        document.getElementById("aoa-draw-screen").classList.add("hidden");
        closeViewBoardBtn.classList.remove("hidden");
    });
}
if (drawHomeBtn) {
    drawHomeBtn.addEventListener("click", () => {
        document.getElementById("aoa-draw-screen").classList.add("hidden");
        modalHomeBtn.click();
    });
}

// --- Canvas Action Handlers ---
canvas.addEventListener("click", function (event) {
    if (gameOver || aiIsThinking) return;
    if (opponentType === "ai" && currentPlayer !== player1Symbol && !activeSkill) return;

    const cell = getCellFromCoords(event.clientX, event.clientY, canvas);
    if (!cell) return;

    const { row, col } = cell;
    const cellKey = `${row},${col}`;
    const cellVal = board[row][col];
    const banner = document.getElementById("skill-activation-banner");
    const activeInventory = activeSkillPlayerNum === 1 ? player1Inventory : player2Inventory;
    const mySymbol = activeSkillPlayerNum === 1 ? player1Symbol : player2Symbol;
    const oppSymbol = activeSkillPlayerNum === 1 ? player2Symbol : player1Symbol;

    if (activeSkill && gameMode === "ultimate") {
        if (activeSkill === "bomb") {
            if (cellVal === oppSymbol || cellVal === "W") {
                if (cellVal === "W") {
                    board[row][col] = "";
                    delete wallCells[cellKey];
                    showToast(`💣 Boom! Tembok di baris ${row+1} kolom ${col+1} dihancurkan!`);
                } else {
                    const oppShield = activeSkillPlayerNum === 1 ? player2Shield : player1Shield;
                    if (oppShield) {
                        showToast(`🛡️ Bomb gagal! Lawan dilindungi oleh Shield!`);
                    } else {
                        board[row][col] = "";
                        showToast(`💣 Boom! Simbol lawan di baris ${row+1} kolom ${col+1} dihancurkan!`);
                    }
                }
                activeInventory.splice(activeSkillIndex, 1);
                setActiveSkill(null);
                banner.classList.add("hidden");
                drawBoard();
                renderInventoriesUI();
            } else {
                showToast(`⚠️ Pilih simbol lawan atau tembok untuk meledakkan!`);
            }
            return;
        }
        if (activeSkill === "replace") {
            if (cellVal === oppSymbol) {
                const oppShield = activeSkillPlayerNum === 1 ? player2Shield : player1Shield;
                if (oppShield) {
                    showToast(`🛡️ Replace gagal! Lawan dilindungi oleh Shield!`);
                } else {
                    board[row][col] = mySymbol;
                    showToast(`🔁 Simbol lawan diubah menjadi simbolmu di baris ${row+1} kolom ${col+1}!`);
                    const winner = checkWinner();
                    if (winner) { setActiveSkill(null); banner.classList.add("hidden"); handleGameEnd(winner); return; }
                }
                activeInventory.splice(activeSkillIndex, 1);
                setActiveSkill(null);
                banner.classList.add("hidden");
                drawBoard();
                renderInventoriesUI();
            } else {
                showToast(`⚠️ Pilih simbol lawan untuk di-replace!`);
            }
            return;
        }
        if (activeSkill === "lock") {
            if (cellVal === "" && !lockedCells[cellKey]) {
                lockedCells[cellKey] = 2;
                activeInventory.splice(activeSkillIndex, 1);
                setActiveSkill(null);
                banner.classList.add("hidden");
                showToast(`🔒 Kotak di baris ${row+1} kolom ${col+1} dikunci 2 giliran!`);
                drawBoard();
                renderInventoriesUI();
            } else {
                showToast(`⚠️ Pilih kotak kosong yang belum terkunci!`);
            }
            return;
        }
        if (activeSkill === "wall") {
            if (cellVal === "" && !lockedCells[cellKey]) {
                board[row][col] = "W";
                wallCells[cellKey] = 2;
                activeInventory.splice(activeSkillIndex, 1);
                setActiveSkill(null);
                banner.classList.add("hidden");
                showToast(`🧱 Tembok diletakkan di baris ${row+1} kolom ${col+1} (aktif 2 giliran)!`);
                drawBoard();
                renderInventoriesUI();
            } else {
                showToast(`⚠️ Pilih kotak kosong untuk membangun tembok!`);
            }
            return;
        }
        if (activeSkill === "swap") {
            if (cellVal !== "X" && cellVal !== "O") {
                showToast(`⚠️ Pilih simbol (X atau O) untuk ditukar!`);
                return;
            }
            if (!swapFirstCell) {
                setSwapFirstCell({ row, col });
                const bannerText = document.getElementById("skill-banner-text");
                bannerText.innerHTML = `<strong>SWAP:</strong> Simbol pertama dipilih. Klik simbol kedua untuk ditukar.`;
                drawBoard();
            } else {
                if (swapFirstCell.row === row && swapFirstCell.col === col) {
                    showToast(`⚠️ Pilih simbol yang berbeda!`);
                    return;
                }
                const temp = board[swapFirstCell.row][swapFirstCell.col];
                board[swapFirstCell.row][swapFirstCell.col] = board[row][col];
                board[row][col] = temp;
                activeInventory.splice(activeSkillIndex, 1);
                setActiveSkill(null);
                setSwapFirstCell(null);
                banner.classList.add("hidden");
                showToast(`🔄 Dua simbol berhasil ditukar posisinya!`);
                drawBoard();
                renderInventoriesUI();
                const winner = checkWinner();
                if (winner) { handleGameEnd(winner); return; }
            }
            return;
        }
    }

    if (opponentType === "ai" && currentPlayer !== player1Symbol) return;
    if (cellVal !== "") return;
    if (lockedCells[cellKey]) {
        showToast(`🔒 Kotak ini terkunci! Sisa ${lockedCells[cellKey]} giliran.`);
        return;
    }

    board[row][col] = currentPlayer;
    playSound(clickSound);
    
    setHoveredCell(null);
    drawBoard();

    const winner = checkWinner();
    if (winner) { handleGameEnd(winner); return; }
    if (isDraw()) { handleGameEnd(null); return; }

    if (gameMode === "ultimate" && doubleMovesLeft > 1) {
        setDoubleMovesLeft(doubleMovesLeft - 1);
        showToast(`⚡ Double Move: Letakkan simbol kedua!`);
        drawBoard();
        renderInventoriesUI();
        return;
    }
    setDoubleMovesLeft(0);

    if (gameMode === "ultimate") {
        advanceTurn();
    } else {
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
        updateTurnDisplayUI();

        if (opponentType === "ai" && currentPlayer === player2Symbol) {
            setAiIsThinking(true);
            setTimeout(() => {
                if (gameOver) { setAiIsThinking(false); return; }
                const move = getAIMove(board, boardSize, player1Symbol, player2Symbol, aiDifficulty, player2Lives, gameMode);
                if (move) {
                    board[move.row][move.col] = player2Symbol;
                    playSound(clickSound);
                    drawBoard();

                    const aiWinner = checkWinner();
                    if (aiWinner) handleGameEnd(aiWinner);
                    else if (isDraw()) handleGameEnd(null);
                    else { setCurrentPlayer(player1Symbol); updateTurnDisplayUI(); }
                }
                setAiIsThinking(false);
            }, 600);
        }
    }
});

canvas.addEventListener("mousemove", function (event) {
    if (gameOver || aiIsThinking) return;
    if (opponentType === "ai" && currentPlayer !== player1Symbol) return;
    const cell = getCellFromCoords(event.clientX, event.clientY, canvas);
    
    if (cell) {
        const { row, col } = cell;
        if (board[row][col] === "") {
            if (!hoveredCell || hoveredCell.row !== row || hoveredCell.col !== col) {
                setHoveredCell({ row, col });
                drawBoard();
            }
            return;
        }
    }
    
    if (hoveredCell !== null) {
        setHoveredCell(null);
        drawBoard();
    }
});

canvas.addEventListener("mouseleave", function () {
    if (hoveredCell !== null) {
        setHoveredCell(null);
        drawBoard();
    }
});

// --- Shortcuts ---
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && gameOver && !aiIsThinking) {
        modalActionBtn.click();
    }
});

// --- Holographic Card Tilt ---
const holoCard = document.getElementById("holo-card");
if (holoCard) {
    holoCard.addEventListener("mousemove", (e) => {
        const rect = holoCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        holoCard.style.setProperty('--x', `${x}px`);
        holoCard.style.setProperty('--y', `${y}px`);
        holoCard.style.setProperty('--bg-x', `${(x / rect.width) * 100}%`);
        holoCard.style.setProperty('--bg-y', `${(y / rect.height) * 100}%`);
        holoCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    holoCard.addEventListener("mouseleave", () => {
        holoCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        holoCard.style.setProperty('--x', `50%`);
        holoCard.style.setProperty('--y', `50%`);
        holoCard.style.setProperty('--bg-x', '50%');
        holoCard.style.setProperty('--bg-y', '50%');
    });
}

// --- Settings Dialog ---
if (globalMuteBtn && audioSettingsPanel) {
    updateMuteButtonVisual();
    globalMuteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        audioSettingsPanel.classList.toggle("hidden");
        playButtonClickSound();
    });
    
    document.addEventListener("click", (e) => {
        if (!audioSettingsPanel.contains(e.target) && !globalMuteBtn.contains(e.target)) {
            audioSettingsPanel.classList.add("hidden");
        }
    });
}

if (bgmSlider) {
    bgmSlider.value = bgmVolume;
    if (bgmValText) bgmValText.textContent = Math.round(bgmVolume * 100) + "%";
    bgmSlider.addEventListener("input", (e) => {
        setBgmVolume(e.target.value);
        if (bgmValText) bgmValText.textContent = Math.round(e.target.value * 100) + "%";
    });
}

if (sfxSlider) {
    sfxSlider.value = sfxVolume;
    if (sfxValText) sfxValText.textContent = Math.round(sfxVolume * 100) + "%";
    sfxSlider.addEventListener("input", (e) => {
        setSfxVolume(e.target.value);
        if (sfxValText) sfxValText.textContent = Math.round(e.target.value * 100) + "%";
    });
}

function updateMuteAllBtnText() {
    if (muteAllBtn) {
        muteAllBtn.innerHTML = isMuted 
            ? `<i class="fa-solid fa-volume-high"></i> UNMUTE ALL`
            : `<i class="fa-solid fa-volume-xmark"></i> MUTE ALL`;
    }
}

if (muteAllBtn) {
    updateMuteAllBtnText();
    muteAllBtn.addEventListener("click", () => {
        toggleMute();
        updateMuteAllBtnText();
    });
}

// --- Autoplay BGM Trigger ---
initBGM();

function playBgmOnInteraction() {
    playBGM().then(() => {
        document.removeEventListener("click", playBgmOnInteraction, true);
        document.removeEventListener("keydown", playBgmOnInteraction, true);
        document.removeEventListener("mousedown", playBgmOnInteraction, true);
        document.removeEventListener("touchstart", playBgmOnInteraction, true);
    }).catch((err) => {
        console.log("Waiting for user gesture:", err);
    });
}

document.addEventListener("click", playBgmOnInteraction, true);
document.addEventListener("keydown", playBgmOnInteraction, true);
document.addEventListener("mousedown", playBgmOnInteraction, true);
document.addEventListener("touchstart", playBgmOnInteraction, true);

document.addEventListener("click", (e) => {
    const target = e.target.closest("button, .lobby-card, .lobby-tab-btn, .size-choice-btn, .symbol-choice-btn, .legend-item, .skill-item");
    if (target && target.id !== "global-mute-btn" && target.id !== "mute-all-btn") {
        playButtonClickSound();
    }
});

// --- Boot Routine ---
loadScoreboard();
drawBoard();
updateTurnDisplayUI();
updateHeartsDisplayUI();
