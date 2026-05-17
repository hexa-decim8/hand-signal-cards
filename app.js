const cards = Array.isArray(window.flashCards) ? window.flashCards : [];

const modeSelect = document.getElementById("mode-select");
const resetBtn = document.getElementById("reset-btn");

const flashcard = document.getElementById("flashcard");
const promptLabel = document.getElementById("prompt-label");
const promptValue = document.getElementById("prompt-value");
const promptHint = document.getElementById("prompt-hint");

const answerLabel = document.getElementById("answer-label");
const answerValue = document.getElementById("answer-value");
const answerSummary = document.getElementById("answer-summary");
const ruleLink = document.getElementById("rule-link");
const signalIcon = document.getElementById("signal-icon");
const penaltyCode = document.getElementById("penalty-code");
const officialCue = document.getElementById("official-cue");
const officialImageLink = document.getElementById("official-image-link");

const prevBtn = document.getElementById("prev-btn");
const flipBtn = document.getElementById("flip-btn");
const correctBtn = document.getElementById("correct-btn");
const incorrectBtn = document.getElementById("incorrect-btn");
const nextBtn = document.getElementById("next-btn");
const statusLine = document.getElementById("status-line");

const statSeen = document.getElementById("stat-seen");
const statCorrect = document.getElementById("stat-correct");
const statAccuracy = document.getElementById("stat-accuracy");
const statRemaining = document.getElementById("stat-remaining");

const state = {
  deck: [],
  index: 0,
  flipped: false,
  mode: "random",
  results: [],
  zoomed: false
};

signalIcon.setAttribute("role", "button");
signalIcon.setAttribute("tabindex", "0");
signalIcon.setAttribute("aria-label", "Enlarge signal image");
signalIcon.setAttribute("aria-expanded", "false");

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(mode) {
  return shuffle(cards).map((card) => {
    const direction =
      mode === "random"
        ? Math.random() < 0.5
          ? "signal-to-penalty"
          : "penalty-to-signal"
        : mode;

    return { card, direction };
  });
}

function currentItem() {
  return state.deck[state.index] ?? null;
}

function getCounts() {
  const seen = state.results.filter((value) => value !== null).length;
  const correct = state.results.filter((value) => value === true).length;
  const remaining = Math.max(state.deck.length - seen, 0);
  const accuracy = seen > 0 ? Math.round((correct / seen) * 100) : 0;
  return { seen, correct, remaining, accuracy };
}

function renderStats() {
  const { seen, correct, remaining, accuracy } = getCounts();
  statSeen.textContent = String(seen);
  statCorrect.textContent = String(correct);
  statRemaining.textContent = String(remaining);
  statAccuracy.textContent = `${accuracy}%`;
}

function setImageZoom(zoomed) {
  state.zoomed = zoomed;
  signalIcon.classList.toggle("zoomed", zoomed);
  signalIcon.setAttribute("aria-expanded", String(zoomed));
}

function updateSignalImageResolution() {
  const naturalWidth = signalIcon.naturalWidth;
  if (!naturalWidth) {
    return;
  }

  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  const sharpCssWidth = Math.floor(naturalWidth / dpr);

  if (!sharpCssWidth) {
    return;
  }

  // Keep the image large, but avoid stretching beyond native pixel detail.
  const targetMaxWidth = Math.min(680, sharpCssWidth);
  signalIcon.style.setProperty("--signal-max-width", `${targetMaxWidth}px`);
}

function toggleImageZoom() {
  if (!currentItem() || !state.flipped) {
    return;
  }

  setImageZoom(!state.zoomed);
}

function renderCard() {
  if (state.deck.length === 0) {
    promptLabel.textContent = "No cards";
    promptValue.textContent = "No penalty cards are available.";
    promptHint.textContent = "Add entries to data/cards.js to start practicing.";
    answerLabel.textContent = "";
    answerValue.textContent = "";
    answerSummary.textContent = "";
    penaltyCode.textContent = "-";
    officialCue.textContent = "-";
    officialImageLink.href = "https://wftdaort.com/";
    officialImageLink.textContent = "Open source";
    ruleLink.href = "https://rules.wftda.com/";
    signalIcon.src = "";
    signalIcon.alt = "";
    setImageZoom(false);
    statusLine.textContent = "Deck is empty.";
    return;
  }

  const item = currentItem();
  if (!item) {
    return;
  }

  const { card, direction } = item;
  const promptIsSignal = direction === "signal-to-penalty";

  promptLabel.textContent = promptIsSignal ? "Prompt: Signal" : "Prompt: Penalty";
  promptValue.textContent = promptIsSignal ? card.signal : card.penalty;
  promptHint.textContent = promptIsSignal
    ? "Name the matching penalty."
    : "Name the matching referee hand signal.";

  answerLabel.textContent = promptIsSignal ? "Answer: Penalty" : "Answer: Signal";
  answerValue.textContent = promptIsSignal ? card.penalty : card.signal;
  answerSummary.textContent = card.summary;
  penaltyCode.textContent = card.penaltyCode ?? "-";
  officialCue.textContent = card.officialCue ?? "-";

  ruleLink.href = card.ruleRef;
  ruleLink.textContent = card.ruleRef.replace("https://rules.wftda.com/", "rules.wftda.com/");

  officialImageLink.href = card.officialSignalImage ?? "https://wftdaort.com/";
  officialImageLink.textContent = card.officialSignalImage
    ? card.officialSignalImage.replace("https://wftdaort.com/", "wftdaort.com/")
    : "Open source";

  signalIcon.src = card.icon;
  signalIcon.alt = `${card.signal} icon`;
  setImageZoom(false);

  const result = state.results[state.index];
  if (result === true) {
    statusLine.textContent = `Card ${state.index + 1}/${state.deck.length}: already marked correct.`;
  } else if (result === false) {
    statusLine.textContent = `Card ${state.index + 1}/${state.deck.length}: already marked missed.`;
  } else {
    statusLine.textContent = `Card ${state.index + 1}/${state.deck.length}`;
  }

  syncControls();
}

function syncControls() {
  const answered = state.results[state.index] !== null;
  const hasCard = Boolean(currentItem());

  prevBtn.disabled = state.index === 0;
  nextBtn.disabled = !hasCard || state.index >= state.deck.length - 1;
  flipBtn.disabled = !hasCard;
  correctBtn.disabled = !hasCard || !state.flipped || answered;
  incorrectBtn.disabled = !hasCard || !state.flipped || answered;

  flashcard.dataset.flipped = String(state.flipped);
  document.getElementById("card-back").setAttribute("aria-hidden", String(!state.flipped));
}

function flipCard() {
  if (!currentItem()) {
    return;
  }

  if (state.flipped) {
    setImageZoom(false);
  }

  state.flipped = !state.flipped;
  syncControls();
}

function goTo(delta) {
  const nextIndex = state.index + delta;
  if (nextIndex < 0 || nextIndex > state.deck.length - 1) {
    return;
  }

  state.index = nextIndex;
  state.flipped = false;
  renderCard();
}

function mark(value) {
  if (!currentItem()) {
    return;
  }

  if (state.results[state.index] !== null) {
    statusLine.textContent = "This card already has a score.";
    return;
  }

  state.results[state.index] = value;
  renderStats();

  const allAnswered = state.results.every((result) => result !== null);
  if (allAnswered) {
    const { accuracy } = getCounts();
    statusLine.textContent = `Round complete. Final accuracy: ${accuracy}%. Press New Round to continue.`;
    syncControls();
    return;
  }

  if (state.index < state.deck.length - 1) {
    goTo(1);
  } else {
    statusLine.textContent = "Scored. Review remaining unanswered cards with Previous.";
    syncControls();
  }
}

function newRound() {
  state.mode = modeSelect.value;
  state.deck = buildDeck(state.mode);
  state.results = new Array(state.deck.length).fill(null);
  state.index = 0;
  state.flipped = false;
  renderStats();
  renderCard();
}

signalIcon.addEventListener("error", () => {
  setImageZoom(false);
  signalIcon.src = "assets/signals/fallback.svg";
  signalIcon.alt = "Fallback referee signal icon";
});

signalIcon.addEventListener("load", updateSignalImageResolution);

signalIcon.addEventListener("click", toggleImageZoom);
signalIcon.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    toggleImageZoom();
  }
});

modeSelect.addEventListener("change", newRound);
resetBtn.addEventListener("click", newRound);
flipBtn.addEventListener("click", flipCard);
prevBtn.addEventListener("click", () => goTo(-1));
nextBtn.addEventListener("click", () => goTo(1));
correctBtn.addEventListener("click", () => mark(true));
incorrectBtn.addEventListener("click", () => mark(false));

document.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
    return;
  }

  if (event.key === "Escape" && state.zoomed) {
    setImageZoom(false);
    return;
  }

  if (event.target === signalIcon && (event.key === " " || event.key === "Enter")) {
    return;
  }

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    flipCard();
    return;
  }

  if (event.key === "ArrowRight") {
    goTo(1);
    return;
  }

  if (event.key === "ArrowLeft") {
    goTo(-1);
    return;
  }

  if (event.key.toLowerCase() === "c") {
    mark(true);
    return;
  }

  if (event.key.toLowerCase() === "x") {
    mark(false);
    return;
  }

  if (event.key.toLowerCase() === "r") {
    newRound();
  }
});

newRound();
