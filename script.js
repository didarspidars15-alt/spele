const symbols = ["🍒", "🍋", "🍊", "🍇", "🍉", "⭐", "7", "🍏"];
const symbolWeights = {
  "🍒": 2,
  "🍋": 2,
  "🍊": 2,
  "🍇": 2,
  "🍉": 2,
  "⭐": 4,
  "7": 3,
  "🍏": 2,
};

let balance = 2500;
let stake = 25;
let freeSpins = 0;
let autoSpin = false;
let autoTimer = null;
let spinCount = 1;
let currentBonusMeter = 0;

const startGameButton = document.getElementById("startGameButton");
const gameShell = document.getElementById("gameShell");
const startScreen = document.getElementById("startScreen");
const atbilde = document.getElementById("atbilde");
const balanceEl = document.getElementById("balance");
const remainingMoneyEl = document.getElementById("remainingMoney");
const moneyEarnedEl = document.getElementById("moneyEarned");
const stakeEl = document.getElementById("stake");
const increaseStakeButton = document.getElementById("increaseStake");
const decreaseStakeButton = document.getElementById("decreaseStake");
const spinButton = document.getElementById("spinButton");
const autoButton = document.getElementById("autoButton");
const stopButton = document.getElementById("stopButton");
const historyList = document.getElementById("historyList");
const freeSpinCount = document.getElementById("freeSpinCount");
const freeSpinsBonus = document.getElementById("freeSpinsBonus");
const multiplierText = document.getElementById("multiplierText");
const bonusText = document.getElementById("bonusText");
const bonusMeter = document.getElementById("bonusMeter");
const winLineText = document.getElementById("winLineText");
const jackpotValue = document.getElementById("jackpotValue");

if (startGameButton && gameShell && startScreen) {
  startGameButton.addEventListener("click", () => {
    if (atbilde) {
      atbilde.textContent = "Spēle sākta!";
    }
    startScreen.hidden = true;
    gameShell.hidden = false;
  });
}

function updateUI() {
  balanceEl.textContent = balance.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  }).replace("$", "");

  remainingMoneyEl.textContent = "$" + balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function updateStake(newStake) {
  stake = Math.max(1, Math.min(newStake, 500));
  stakeEl.value = stake;
}

function updateHistory(type, win) {
  const row = document.createElement("div");
  row.className = "history-row";

  const line = document.createElement("span");
  line.className = "history-line";
  line.textContent = "Spin " + String(spinCount).padStart(3, "0");

  const amount = document.createElement("span");
  amount.className = type === "win" ? "history-win" : "history-lose";
  amount.textContent = (type === "win" ? "+" : "-") + Math.abs(win);

  row.appendChild(line);
  row.appendChild(amount);
  historyList.prepend(row);

  while (historyList.children.length > 6) {
    historyList.removeChild(historyList.lastElementChild);
  }
}

function generateBoard() {
  const board = [
    ["🍒", "🍋", "🍊", "🍇", "🍏"],
    ["🍇", "🍒", "🍉", "⭐", "7"],
    ["🍏", "⭐", "🍋", "🍊", "🍒"],
  ];

  return board;
}

function spin() {
  if (freeSpins > 0) {
    freeSpins -= 1;
    freeSpinCount.textContent = freeSpins;
    freeSpinsBonus.textContent = freeSpins;
  } else {
    if (balance < stake) {
      bonusText.textContent = "LOW BALANCE";
      return;
    }
    balance -= stake;
  }

  const board = generateBoard();
  const flatBoard = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      flatBoard.push(randomSymbol);
    }
  }

  const slotDisplay = [
    [flatBoard[0], flatBoard[1], flatBoard[2], flatBoard[3], flatBoard[4]],
    [flatBoard[5], flatBoard[6], flatBoard[7], flatBoard[8], flatBoard[9]],
    [flatBoard[10], flatBoard[11], flatBoard[12], flatBoard[13], flatBoard[14]],
  ];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const slotId = "slot-" + row + col;
      const symbol = slotDisplay[row][col];
      document.getElementById(slotId).textContent = symbol;
    }
  }

  evaluateSpin(slotDisplay);
  updateUI();
}

function evaluateSpin(board) {
  let win = 0;
  let winSymbol = "";

  const counts = {};

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const val = board[row][col];
      counts[val] = (counts[val] || 0) + 1;
    }
  }

  for (const item in counts) {
    if (counts[item] >= 3) {
      winSymbol = item;
      win = Math.round(stake * symbolWeights[item] * (counts[item] / 3));
    }
  }

  if (win <= 0) {
    const jackpotChance = Math.random() < 0.08;
    if (jackpotChance) {
      win = Math.round(stake * 50);
      winSymbol = "JACKPOT";
      bonusText.textContent = "JACKPOT";
    } else if (Math.random() < 0.14) {
      freeSpins += 3;
      freeSpinCount.textContent = freeSpins;
      freeSpinsBonus.textContent = freeSpins;
      bonusText.textContent = "FREE SPIN";
    } else {
      bonusText.textContent = "READY";
    }
  } else {
    balance += win;
    moneyEarnedEl.textContent = "+$" + win.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    bonusText.textContent = "WIN" + " " + winSymbol;
    currentBonusMeter = Math.min(100, currentBonusMeter + 12);
    bonusMeter.style.width = currentBonusMeter + "%";
    winLineText.textContent = "PAYLINE 01";
  }

  if (win <= 0 && !freeSpins) {
    moneyEarnedEl.textContent = "+$0.00";
  }

  if (win > 0) {
    balance += win;
    moneyEarnedEl.textContent = "+$" + win.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    updateHistory("win", win);
  } else {
    moneyEarnedEl.textContent = "+$0.00";
    updateHistory("lose", stake);
  }

  if (win > 0) {
    const allWinCells = Array.from(document.querySelectorAll(".slot-cell"));
    allWinCells.forEach((cell) => cell.classList.remove("win"));

    const winCells = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 5; j++) {
        if (board[i][j] === winSymbol || board[i][j] === "⭐" || board[i][j] === "7") {
          winCells.push(document.getElementById("slot-" + i + j));
        }
      }
    }

    winCells.forEach((cell) => cell.parentElement.classList.add("win"));
  }

  spinCount += 1;
}

spinButton.addEventListener("click", () => {
  spin();
});

autoButton.addEventListener("click", () => {
  if (autoSpin) {
    clearInterval(autoTimer);
    autoSpin = false;
    autoButton.classList.remove("active");
    autoButton.querySelector(".button-text").textContent = "AUTO SPIN";
  } else {
    autoSpin = true;
    autoButton.classList.add("active");
    autoButton.querySelector(".button-text").textContent = "STOP AUTO";
    autoTimer = setInterval(spin, 800);
  }
});

stopButton.addEventListener("click", () => {
  if (autoSpin) {
    clearInterval(autoTimer);
    autoSpin = false;
    autoButton.classList.remove("active");
    autoButton.querySelector(".button-text").textContent = "AUTO SPIN";
    bonusText.textContent = "STOPPED";
  }
});

increaseStakeButton.addEventListener("click", () => {
  updateStake(stake + 5);
});

decreaseStakeButton.addEventListener("click", () => {
  updateStake(stake - 5);
});

stakeEl.addEventListener("change", () => {
  updateStake(Number(stakeEl.value));
});

document.querySelectorAll(".preset-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    updateStake(Number(chip.dataset.stake));
  });
});

updateUI();

function animateStars() {
  const cells = Array.from(document.querySelectorAll(".slot-cell"));
  cells.forEach((cell, index) => {
    cell.style.animation = "pulse 1.3s ease " + (index * 0.05) + "s infinite alternate";
  });
}

animateStars();