

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-button");
    const clickButton = document.getElementById("click-button");
    const restartButton = document.getElementById("restart-button");

    const objectEl = document.getElementById("object");
    const gameArea = document.getElementById("game-area");
    const helperContainer = document.getElementById("helper-container");
    const timerEl = document.getElementById("timer");
    const clickCountEl = document.getElementById("click-count");
    const bestScoreTextEl = document.getElementById("best-score-text");
    const statusTextEl = document.getElementById("status-text");
    const recordMessageEl = document.getElementById("record-message");
    const goodMessageEl = document.getElementById("good-message");
    const recordBreakMessageEl = document.getElementById("record-break-message");
    const gameOverMessageEl = document.getElementById("gameover-message");

    // 스크롤 방지
    document.body.addEventListener(
        "touchmove",
        (e) => {
            e.preventDefault();
        },
        { passive: false }
    );

    const BEST_RECORD_SECONDS = 180;
    const BEST_SCORE_LABEL = "3분(180초)";

    const SKINS = [
        "object-skin-1",
        "object-skin-2",
        "object-skin-3",
        "object-skin-4",
        "object-skin-5",
        "object-skin-6",
        "object-skin-7",
        "object-skin-8",
        "object-skin-9",
        "object-skin-10"
    ];
    let currentSkinIndex = 0;

    // 네모박스 안 배경 (더 컬러풀)
    const AREA_BACKGROUNDS = [
        "radial-gradient(circle at top, #4f69ff 0%, #28337a 50%, #171b3c 100%)",
        "radial-gradient(circle at top, #ffccf1 0%, #ff9ad5 35%, #ffb88c 70%, #ffe7b8 100%)",
        "radial-gradient(circle at top, #ffe6a7 0%, #ffb347 35%, #ff6a88 70%, #ffc3a0 100%)",
        "radial-gradient(circle at top, #c3f5ff 0%, #7fd3ff 35%, #a18cd1 70%, #fbc2eb 100%)",
        "radial-gradient(circle at top, #ffecd2 0%, #fcb69f 35%, #ff9a9e 70%, #fecfef 100%)",
        "radial-gradient(circle at top, #c9ffbf 0%, #ffafbd 35%, #74ebd5 70%, #acb6e5 100%)",
        "radial-gradient(circle at top, #f6d365 0%, #fda085 35%, #f093fb 70%, #f5576c 100%)",
        "radial-gradient(circle at top, #a1c4fd 0%, #c2e9fb 35%, #fbc2eb 70%, #a6c0fe 100%)",
        "radial-gradient(circle at top, #ff9a9e 0%, #fecfef 35%, #f6d365 70%, #fda085 100%)",
        "radial-gradient(circle at top, #d4fc79 0%, #96e6a1 35%, #84fab0 70%, #8fd3f4 100%)"
    ];

    // 바깥(body) 배경 – 같은 계열이지만 훨씬 은은하게
    const BODY_BACKGROUNDS = [
        "radial-gradient(circle at top, #c2d7ff 0%, #a9c6ff 40%, #8ed8ff 75%, #c8f3ff 100%)",
        "radial-gradient(circle at top, #ffd9f5 0%, #f8c4ec 40%, #ffc9b5 75%, #ffe8d0 100%)",
        "radial-gradient(circle at top, #ffecc1 0%, #ffd1a1 40%, #ffc1b8 75%, #ffe1d0 100%)",
        "radial-gradient(circle at top, #cbefff 0%, #b9deff 40%, #c8c5f4 75%, #f1d5f6 100%)",
        "radial-gradient(circle at top, #ffe9d7 0%, #ffd3c0 40%, #ffc6c6 75%, #ffe3ee 100%)",
        "radial-gradient(circle at top, #d6ffd0 0%, #c7f5e0 40%, #c3e9f4 75%, #ddf4ff 100%)",
        "radial-gradient(circle at top, #ffe4c7 0%, #ffd4c3 40%, #f7c3e8 75%, #ffd4e1 100%)",
        "radial-gradient(circle at top, #d2e2ff 0%, #c7dcff 40%, #e4d3f5 75%, #f3ddff 100%)",
        "radial-gradient(circle at top, #ffd8dc 0%, #ffd8e4 40%, #ffe5c8 75%, #ffe9d6 100%)",
        "radial-gradient(circle at top, #ddffd0 0%, #cbf3d2 40%, #c8f2e3 75%, #d9f5ff 100%)"
    ];

    function updateAreaBackgroundBySkin(index) {
        gameArea.style.background = AREA_BACKGROUNDS[index];
    }

    function updateBodyBackgroundBySkin(index) {
        document.body.style.background = BODY_BACKGROUNDS[index];
    }

    const HELPER_MESSAGES = [
        { emoji: "🐤", text: "계속 클릭해!" },
        { emoji: "🐹", text: "잘하고 있어!" },
        { emoji: "🐻", text: "최고야!" },
        { emoji: "🐰", text: "지금처럼 계속해!" },
        { emoji: "🐦", text: "집중 집중!" },
        { emoji: "🐧", text: "거의 다 왔어!" },
        { emoji: "🦭", text: "버텨버텨!" },
        { emoji: "🐠", text: "안 떨어지게!" },
        { emoji: "🐶", text: "클릭! 클릭!" },
        { emoji: "🐒", text: "좋은 리듬이야!" }
    ];

    let gameState = "ready";
    let elapsedSeconds = 0;
    let timerInterval = null;
    let physicsInterval = null;
    let encouragementInterval = null;
    let helperInterval = null;

    let clickCount = 0;

    let posYPercent = 40;
    let velocity = 0;

    const maxPosPercent = 88;
    const baseGravity = 0.05;
    const gravityStep = 0.02;
    const jumpImpulse = 1.4;

    let recordBroken = false;

    /* ---------- 공 스킨 ---------- */

    function applySkin(index) {
        SKINS.forEach((s) => objectEl.classList.remove(s));
        objectEl.classList.add(SKINS[index]);

        updateAreaBackgroundBySkin(index);  // 네모박스 안
        updateBodyBackgroundBySkin(index);  // 바깥 배경(은은하게)
    }

    function showGoodMessage() {
        goodMessageEl.classList.add("show");
        setTimeout(() => {
            goodMessageEl.classList.remove("show");
        }, 700);
    }

    function changeObjectSkin() {
        currentSkinIndex = (currentSkinIndex + 1) % SKINS.length;
        applySkin(currentSkinIndex);
        showGoodMessage();
    }

    /* ---------- 타이머 / 위치 / 배경 ---------- */

    function updateTimerDisplay() {
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds).padStart(2, "0");
        timerEl.textContent = `${mm}:${ss}`;
    }

    function getCurrentGravity() {
        let level = Math.floor(elapsedSeconds / 60);
        if (level > 2) level = 2;
        return baseGravity + gravityStep * level;
    }

    function renderObjectPosition() {
        objectEl.style.top = posYPercent + "%";
    }

    // 높이에 따라 네모 박스 전체 밝기만 살짝 조정
    function updateBackgroundByHeight() {
        if (posYPercent > 75) {
            gameArea.style.filter = "brightness(0.9) saturate(1.05)";
        } else if (posYPercent < 30) {
            gameArea.style.filter = "brightness(1.05)";
        } else {
            gameArea.style.filter = "none";
        }
    }

    function clearAllIntervals() {
        if (timerInterval) clearInterval(timerInterval);
        if (physicsInterval) clearInterval(physicsInterval);
        if (encouragementInterval) clearInterval(encouragementInterval);
        if (helperInterval) clearInterval(helperInterval);

        timerInterval = null;
        physicsInterval = null;
        encouragementInterval = null;
        helperInterval = null;
    }

    /* ---------- 반짝이 파티클 ---------- */

    function createSparkles() {
        const gameRect = gameArea.getBoundingClientRect();
        const objRect = objectEl.getBoundingClientRect();

        const centerX = objRect.left - gameRect.left + objRect.width / 2;
        const centerY = objRect.top - gameRect.top + objRect.height / 2;

        for (let i = 0; i < 6; i++) {
            const sp = document.createElement("div");
            sp.classList.add("sparkle");

            const offsetX = (Math.random() - 0.5) * 24;
            const offsetY = (Math.random() - 0.5) * 8;

            sp.style.left = centerX + offsetX + "px";
            sp.style.top = centerY + offsetY + "px";

            const duration = 0.5 + Math.random() * 0.4;
            sp.style.animationDuration = duration + "s";

            gameArea.appendChild(sp);

            setTimeout(() => {
                sp.remove();
            }, duration * 1000 + 120);
        }
    }

    /* ---------- 이모지 말풍선 ---------- */

    function spawnHelperBubble() {
        if (gameState !== "running") return;

        const data = HELPER_MESSAGES[Math.floor(Math.random() * HELPER_MESSAGES.length)];

        const wrapper = document.createElement("div");
        wrapper.classList.add("helper-speech");

        const emojiSpan = document.createElement("span");
        emojiSpan.classList.add("helper-emoji");
        emojiSpan.textContent = data.emoji;

        const bubbleSpan = document.createElement("span");
        bubbleSpan.classList.add("helper-bubble");
        bubbleSpan.textContent = data.text;

        wrapper.appendChild(emojiSpan);   // 🐥
        wrapper.appendChild(bubbleSpan);  // 💬

        const minTop = 30;
        const maxTop = 55;
        const topPercent = minTop + Math.random() * (maxTop - minTop);
        wrapper.style.top = topPercent + "%";

        helperContainer.appendChild(wrapper);

        setTimeout(() => {
            wrapper.remove();
        }, 6500);
    }

    /* ---------- 게임 흐름 ---------- */

    function resetGame() {
        gameState = "ready";

        elapsedSeconds = 0;
        clickCount = 0;
        recordBroken = false;
        posYPercent = 40;
        velocity = 0;
        currentSkinIndex = 0;

        clearAllIntervals();
        updateTimerDisplay();

        clickCountEl.textContent = clickCount;
        statusTextEl.textContent = "";
        recordMessageEl.textContent = "";

        renderObjectPosition();
        applySkin(currentSkinIndex);

        goodMessageEl.classList.remove("show");
        recordBreakMessageEl.classList.remove("show");
        gameOverMessageEl.classList.remove("show");
        gameOverMessageEl.textContent = "";
        gameArea.style.filter = "none";

        helperContainer.innerHTML = "";

        bestScoreTextEl.textContent = BEST_SCORE_LABEL;
        bestScoreTextEl.classList.remove("blink");
        bestScoreTextEl.style.color = "";

        clickButton.disabled = true;
        restartButton.classList.add("hidden");
        startButton.disabled = false;
    }

    function startGameRunning() {
        gameState = "running";
        startButton.disabled = true;
        clickButton.disabled = false;

        statusTextEl.textContent = "시작! 떨어지지 않게 잘 버텨봐요 ✊";

        // 타이머
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            updateTimerDisplay();
            checkRecordBreak();

            // 15초마다 공 스킨 변경 + GOOD!
            if (elapsedSeconds > 0 && elapsedSeconds % 15 === 0) {
                changeObjectSkin();
            }
        }, 1000);

        // 물리
        physicsInterval = setInterval(() => {
            const gravity = getCurrentGravity();

            velocity += gravity;
            posYPercent += velocity;

            if (posYPercent < 0) {
                posYPercent = 0;
                velocity = 0;
            }

            if (posYPercent >= maxPosPercent) {
                posYPercent = maxPosPercent;
                renderObjectPosition();
                updateBackgroundByHeight();
                gameOver();
                return;
            }

            renderObjectPosition();
            updateBackgroundByHeight();
        }, 16);

        // 상태 문구
        encouragementInterval = setInterval(() => {
            if (gameState !== "running") return;

            if (posYPercent > 75) {
                statusTextEl.textContent = "위험해요! 더 많이 클릭하세요!!";
            } else if (posYPercent < 30) {
                statusTextEl.textContent = "잘하고 있어요! 안정적인 높이 👍";
            } else {
                statusTextEl.textContent = "좋은 균형이에요. 계속 유지해봐요!";
            }
        }, 800);

        // 이모지 말풍선 – 12초마다 한 번
        helperInterval = setInterval(() => {
            spawnHelperBubble();
        }, 12000);
    }

    function checkRecordBreak() {
        if (!recordBroken && elapsedSeconds >= BEST_RECORD_SECONDS) {
            recordBroken = true;

            bestScoreTextEl.textContent = "현재 기록중...";
            bestScoreTextEl.classList.add("blink");

            recordBreakMessageEl.classList.add("show");
            setTimeout(() => {
                recordBreakMessageEl.classList.remove("show");
            }, 2000);
        }
    }

    function gameOver() {
        if (gameState === "over") return;
        gameState = "over";

        clearAllIntervals();
        clickButton.disabled = true;
        restartButton.classList.remove("hidden");

        statusTextEl.textContent = "";

        const text = `GAME OVER\n기록: ${elapsedSeconds}초 / 클릭: ${clickCount}번`;
        gameOverMessageEl.textContent = text;
        gameOverMessageEl.classList.add("show");
    }

    function handleClick() {
        if (gameState !== "running") return;

        velocity -= jumpImpulse;
        clickCount++;
        clickCountEl.textContent = clickCount;

        objectEl.style.transform = "translateX(-50%) translateY(-3px)";
        setTimeout(() => {
            objectEl.style.transform = "translateX(-50%)";
        }, 120);

        createSparkles();
    }

    /* ---------- 이벤트 ---------- */

    startButton.addEventListener("click", () => {
        resetGame();
        startGameRunning();
    });

    clickButton.addEventListener("click", handleClick);

    restartButton.addEventListener("click", () => {

        resetGame();
        startGameRunning();
    });

    // 최초 초기화
    resetGame();
});
