"use strict";

/*
 * Year 5 and 6 statutory spelling words.
 * The application randomly selects between 5 and 10 of these words.
 */
const WORDS = [
  "accommodate",
  "accompany",
  "according",
  "achieve",
  "aggressive",
  "amateur",
  "ancient",
  "apparent",
  "appreciate",
  "attached",
  "available",
  "average",
  "awkward",
  "bargain",
  "bruise",

  "category",
  "cemetery",
  "committee",
  "communicate",
  "community",
  "competition",
  "conscience",
  "conscious",
  "controversy",
  "convenience",
  "correspond",
  "criticise",
  "curiosity",
  "definite",
  "desperate",

  "determined",
  "develop",
  "dictionary",
  "disastrous",
  "embarrass",
  "environment",
  "equip",
  "equipped",
  "equipment",
  "especially",
  "exaggerate",
  "excellent",
  "existence",
  "explanation",
  "familiar",

  "foreign",
  "forty",
  "frequently",
  "government",
  "guarantee",
  "harass",
  "hindrance",
  "identity",
  "immediate",
  "immediately",
  "individual",
  "interfere",
  "interrupt",
  "language",
  "leisure",

  "lightning",
  "marvellous",
  "mischievous",
  "muscle",
  "necessary",
  "neighbour",
  "nuisance",
  "occupy",
  "occur",
  "opportunity",
  "parliament",
  "persuade",
  "physical",
  "prejudice",
  "privilege",

  "profession",
  "programme",
  "pronunciation",
  "queue",
  "recognise",
  "recommend",
  "relevant",
  "restaurant",
  "rhyme",
  "rhythm",
  "sacrifice",
  "secretary",
  "shoulder",
  "signature",
  "sincere",

  "sincerely",
  "soldier",
  "stomach",
  "sufficient",
  "suggest",
  "symbol",
  "system",
  "temperature",
  "thorough",
  "twelfth",
  "variety",
  "vegetable",
  "vehicle",
  "yacht"
];

/*
 * Quick helper for selecting HTML elements by ID.
 */
const el = (id) => document.getElementById(id);

/*
 * Page elements.
 */
const screens = [
  el("start-screen"),
  el("quiz-screen"),
  el("results-screen")
];

const countSlider = el("word-count");
const countOutput = el("word-count-output");

/*
 * Quiz state.
 */
let playerName = "Word Wizard";
let quizWords = [];
let currentIndex = 0;
let score = 0;
let wrongWords = [];
let answered = false;

/*
 * Display one screen at a time.
 */
function showScreen(target) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen === target);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/*
 * Shuffle an array using the Fisher-Yates algorithm.
 * A copy is made so the original word list is not changed.
 */
function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    );

    [copy[i], copy[randomIndex]] = [
      copy[randomIndex],
      copy[i]
    ];
  }

  return copy;
}

/*
 * Keep the test length between 5 and 10 words.
 */
function setCount(value) {
  const safeValue = Math.max(
    5,
    Math.min(10, Number(value))
  );

  countSlider.value = safeValue;
  countOutput.value = safeValue;
  countOutput.textContent = safeValue;
}

/*
 * Start a quiz using the supplied words.
 */
function beginQuiz(words) {
  quizWords = [...words];
  currentIndex = 0;
  score = 0;
  wrongWords = [];

  el("live-score").textContent = "0";

  el("quiz-greeting").textContent =
    `${playerName.toUpperCase()}'S CHALLENGE`;

  showScreen(el("quiz-screen"));
  loadWord();
}

/*
 * Prepare the screen for the current word.
 */
function loadWord() {
  answered = false;

  const questionNumber = currentIndex + 1;

  el("question-heading").textContent =
    `Word ${questionNumber}`;

  el("progress-text").textContent =
    `${questionNumber} of ${quizWords.length}`;

  el("progress-bar").style.width =
    `${(currentIndex / quizWords.length) * 100}%`;

  el("answer-input").value = "";
  el("answer-input").disabled = false;
  el("check-button").disabled = false;

  el("feedback").className = "feedback";
  el("feedback").textContent = "";

  el("next-button").classList.add("hidden");

  /*
   * A short delay gives the quiz screen time to appear
   * before speech begins.
   */
  window.setTimeout(() => {
    speakWord();
  }, 300);

  el("answer-input").focus();
}

/*
 * Read the current word aloud using the browser's
 * built-in speech synthesis feature.
 */
function speakWord() {
  if (!("speechSynthesis" in window)) {
    el("feedback").textContent =
      "Speech is not available in this browser. " +
      "Try Chrome, Edge, or Safari.";

    el("feedback").className = "feedback wrong";
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    quizWords[currentIndex]
  );

  utterance.lang = "en-GB";
  utterance.rate = 0.78;
  utterance.pitch = 1.05;

  utterance.onstart = () => {
    el("speak-button").classList.add("speaking");
  };

  utterance.onend = () => {
    el("speak-button").classList.remove("speaking");
  };

  utterance.onerror = () => {
    el("speak-button").classList.remove("speaking");
  };

  window.speechSynthesis.speak(utterance);
}

/*
 * Make answer checking case-insensitive and ignore
 * spaces accidentally typed before or after an answer.
 */
function normalise(value) {
  return value
    .trim()
    .toLocaleLowerCase("en-GB");
}

/*
 * Check the child's answer.
 */
function checkAnswer(event) {
  event.preventDefault();

  /*
   * Prevent the same question being scored twice.
   */
  if (answered) {
    return;
  }

  const answer = normalise(
    el("answer-input").value
  );

  if (!answer) {
    return;
  }

  answered = true;

  const correctWord = quizWords[currentIndex];
  const isCorrect = answer === correctWord;

  el("answer-input").disabled = true;
  el("check-button").disabled = true;

  if (isCorrect) {
    score += 1;

    el("live-score").textContent = score;

    el("feedback").textContent =
      "Correct! You earned a star! ⭐";

    el("feedback").className =
      "feedback correct";

    tinyCelebration();
  } else {
    wrongWords.push(correctWord);

    /*
     * The correct word comes from the fixed internal list,
     * not from user input.
     */
    el("feedback").innerHTML =
      `Good try! The spelling is ` +
      `<strong>${correctWord}</strong>.`;

    el("feedback").className =
      "feedback wrong";
  }

  el("progress-bar").style.width =
    `${((currentIndex + 1) / quizWords.length) * 100}%`;

  if (currentIndex === quizWords.length - 1) {
    el("next-button").textContent =
      "See my score →";
  } else {
    el("next-button").textContent =
      "Next word →";
  }

  el("next-button").classList.remove("hidden");
  el("next-button").focus();
}

/*
 * Move to the next question or show the results.
 */
function nextQuestion() {
  currentIndex += 1;

  if (currentIndex >= quizWords.length) {
    showResults();
  } else {
    loadWord();
  }
}

/*
 * Calculate the result and show the results screen.
 */
function showResults() {
  const total = quizWords.length;

  const percent = Math.round(
    (score / total) * 100
  );

  el("final-score").textContent = score;
  el("final-total").textContent = total;
  el("final-percent").textContent = `${percent}%`;

  if (percent === 100) {
    el("results-title").textContent =
      `Perfect score, ${playerName}!`;

    el("result-message").textContent =
      "Every word was correct. " +
      "You are a spelling superstar!";

    el("result-badge").textContent = "🌟";
  } else if (percent >= 70) {
    el("results-title").textContent =
      `Well done, ${playerName}!`;

    el("result-message").textContent =
      "A strong score! A little more practice " +
      "will make those tricky words stick.";

    el("result-badge").textContent = "🏆";
  } else {
    el("results-title").textContent =
      `Well done, ${playerName}!`;

    el("result-message").textContent =
      "You kept trying, and that is how spelling " +
      "skills grow. Let’s practise the tricky ones.";

    el("result-badge").textContent = "💪";
  }

  showWrongWords();
  showScreen(el("results-screen"));

  if (percent === 100) {
    celebrate(55);
  } else {
    celebrate(28);
  }
}

/*
 * Show the words the child needs to practise.
 */
function showWrongWords() {
  const wrongListWrap = el("wrong-list-wrap");
  const wrongList = el("wrong-list");

  wrongList.replaceChildren();

  if (wrongWords.length === 0) {
    wrongListWrap.classList.add("hidden");
    return;
  }

  wrongWords.forEach((word) => {
    const item = document.createElement("li");
    item.textContent = word;
    wrongList.appendChild(item);
  });

  wrongListWrap.classList.remove("hidden");
}

/*
 * Create a colourful confetti animation.
 */
function celebrate(amount) {
  const colours = [
    "#6c4cff",
    "#ff5ea8",
    "#ffd85a",
    "#17b890",
    "#4cc9f0"
  ];

  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("i");

    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background =
      colours[i % colours.length];

    piece.style.animationDelay =
      `${Math.random() * 0.7}s`;

    piece.style.transform =
      `rotate(${Math.random() * 180}deg)`;

    el("confetti").appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 3500);
  }
}

/*
 * A smaller celebration for each correct answer.
 */
function tinyCelebration() {
  celebrate(8);
}

/*
 * Update the word count when the slider moves.
 */
countSlider.addEventListener("input", (event) => {
  setCount(event.target.value);
});

/*
 * Update the word count using the plus and minus buttons.
 */
document
  .querySelectorAll(".count-button")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const change = Number(button.dataset.change);
      const currentValue = Number(countSlider.value);

      setCount(currentValue + change);
    });
  });

/*
 * Start a new randomly selected spelling test.
 */
el("start-form").addEventListener("submit", (event) => {
  event.preventDefault();

  /*
   * Use only the first part of the entered name.
   */
  const enteredName = el("child-name")
    .value
    .trim()
    .split(/\s+/)[0]
    .slice(0, 24);

  playerName = enteredName || "Word Wizard";

  const selectedWords = shuffle(WORDS).slice(
    0,
    Number(countSlider.value)
  );

  beginQuiz(selectedWords);
});

/*
 * Allow the child to hear the word again.
 */
el("speak-button").addEventListener(
  "click",
  speakWord
);

/*
 * Check an answer when the form is submitted.
 */
el("answer-form").addEventListener(
  "submit",
  checkAnswer
);

/*
 * Continue to the next word.
 */
el("next-button").addEventListener(
  "click",
  nextQuestion
);

/*
 * Repeat only the incorrectly answered words.
 */
el("retry-button").addEventListener("click", () => {
  const uniqueWrongWords = [
    ...new Set(wrongWords)
  ];

  beginQuiz(
    shuffle(uniqueWrongWords)
  );
});

/*
 * Return to the start screen for a completely new test.
 */
el("new-test-button").addEventListener(
  "click",
  () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    showScreen(el("start-screen"));
    el("child-name").focus();
  }
);

/*
 * Set the initial quiz length.
 */
setCount(7);