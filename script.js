import { generateLunch } from './match.js';
const quizContainer = document.getElementById("quiz-container");

const questions = [
  {
    key: "hungerLevel",
    text: "How hungry are you?",
    options: [
      { emoji: "🐭", label: "Just a little hungry", value: "light" },
      { emoji: "🍽", label: "Normal lunch hungry", value: "medium" },
      { emoji: "🐘", label: "Starving, feed me now", value: "high" }
    ]
  },
  {
    key: "mood",
    text: "What are you in the mood for?",
    options: [
      { emoji: "🥗", label: "Fresh & energizing", value: "fresh_energizing" },
      { emoji: "😌", label: "Warm & cozy", value: "warm_cozy" },
      { emoji: "⚡", label: "Quick & easy", value: "quick_easy" },
      { emoji: "🧘‍♀️", label: "Light & focused", value: "light_focused" }
    ]
  },
  {
    key: "favoriteIngredients",
    text: "Pick your 3 favorite ingredients",
    multi: true,
    options: [
      { label: "Chicken", value: "chicken" },
      { label: "Cheese", value: "cheese" },
      { label: "Beef", value: "beef" },
      { label: "Ham", value: "ham" },
      { label: "Eggs", value: "eggs" },
      { label: "Tomatoes", value: "tomatoes" },
      { label: "Cucumber", value: "cucumber" },
      { label: "Tuna", value: "tuna" },
      { label: "Bacon", value: "bacon" },
      { label: "Onions", value: "onions" },
      { label: "Filet mignon", value: "filet mignon" },
      { label: "Pickles", value: "pickles" },
      { label: "Capers", value: "capers" }
    ]
  },
  {
    key: "mealType",
    text: "What kind of meal do you prefer?",
    options: [
      { emoji: "🌯", label: "Wrap", value: "wrap" },
      { emoji: "🥪", label: "Sandwich", value: "sandwich" },
      { emoji: "🥗", label: "Salad", value: "salad" },
      { emoji: "🤷‍♂️", label: "No preference", value: "any" }
    ]
  },
  {
    key: "breadType",
    text: "Which bread do you prefer?",
    options: [
      { emoji: "🍞", label: "White", value: "white" },
      { emoji: "🌾", label: "Brown", value: "brown" },
      { emoji: "🍞🌑", label: "Dark Brown", value: "dark brown" },
      { emoji: "🥖", label: "Sourdough", value: "sourdough" },
      { emoji: "🎲", label: "Surprise me!", value: "any" }
    ],
    dependsOn: { key: "mealType", value: "sandwich" }
  },
  {
    key: "diet",
    text: "Do you follow a specific diet?",
    options: [
      { emoji: "🥦", label: "Vegetarian", value: "vegetarian" },
      { emoji: "🍗", label: "No preference", value: "regular" }
    ]
  },
  {
    key: "allergens",
    text: "Any ingredients you want to avoid?",
    options: [
      { emoji: "🥚", label: "Eggs", value: "eggs" },
      { emoji: "🥜", label: "Nuts", value: "nuts" },
      { emoji: "🧀", label: "Dairy", value: "dairy" },
      { emoji: "🌾", label: "Gluten", value: "gluten" },
      { emoji: "❌", label: "None", value: "none" }
    ],
    multi: true
  },
  {
    key: "drinkCategory",
    text: "What do you feel like drinking today?",
    options: [
      { emoji: "🧃", label: "Fresh & healthy", value: "fruit" },
      { emoji: "☕", label: "Warm & comforting", value: "hot" },
      { emoji: "💧", label: "Just hydrating", value: "hydrating" },
      { emoji: "🍵", label: "Guilty Pleasure", value: "comfort" }
    ]
  },
  {
    key: "energyBoost",
    text: "Need an energy boost?",
    options: [
      { emoji: "💥", label: "Yes, caffeine please!", value: "caffeine" },
      { emoji: "🔋", label: "A light boost is enough", value: "refreshing" },
      { emoji: "❌", label: "No thanks", value: "none" }
    ]
  },
  {
    key: "treatVibe",
    text: "Pick your treat vibe:",
    dependsOn: { key: "wantsTreat", value: "yes" },
    options: [
      { emoji: "🍫", label: "Cozy & sweet", value: "comfort" },
      { emoji: "🍏", label: "Clean & healthy", value: "healthy" },
      { emoji: "🍌", label: "Quick & energizing", value: "natural" }
    ]
  }
];

let currentQuestion = 0;
let quizAnswers = {};

function isLastQuestion() {
  for (let i = currentQuestion + 1; i < questions.length; i++) {
    const next = questions[i];
    if (!next.dependsOn || quizAnswers[next.dependsOn.key] === next.dependsOn.value) return false;
  }
  return true;
}

function renderQuestion() {
  const q = questions[currentQuestion];
  // Skip this question if it has dependsOn and the dependency is not met
  if (q.dependsOn && quizAnswers[q.dependsOn.key] !== q.dependsOn.value) {
    currentQuestion++;
    renderQuestion();
    return;
  }
  // Determine if this is the last visible question
  const isLast = (() => {
    for (let i = currentQuestion + 1; i < questions.length; i++) {
      const next = questions[i];
      if (next.dependsOn && quizAnswers[next.dependsOn.key] !== next.dependsOn.value) continue;
      return false;
    }
    return true;
  })();

  let optionsHTML = q.options.map(option => {
    let selected = "";
    if (q.multi && Array.isArray(quizAnswers[q.key]) && quizAnswers[q.key].includes(option.value)) {
      selected = "selected";
    } else if (!q.multi && quizAnswers[q.key] === option.value) {
      selected = "selected";
    }
    return `<button type="button" class="option-btn${selected ? " selected" : ""}" data-value="${option.value}" onclick="handleAnswer('${q.key}', '${option.value}', this)">
              ${option.emoji ? option.emoji + " " : ""}${option.label}
            </button>`;
  }).join("");

  quizContainer.innerHTML = `
    <div class="logo-container"><img src="assets/BoostyLogo.png" alt="Boosty Logo" class="boosty-logo" /></div>
    <div class="question-card">
      <h2 class="quiz-title">${q.text}</h2>
      <div class="options">${optionsHTML}</div>
      ${currentQuestion > 0 ? `<button class="back-btn" onclick="goBack()">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24" fill="none">
    <path d="M18 2L4 12L18 22" stroke="#F18802" stroke-width="4" stroke-linecap="round"/>
  </svg>
  Back
</button>` : ""}
      ${
        q.multi
          ? `<button class="next-btn" id="confirm-btn" onclick="goToNextQuestion()" ${
              Array.isArray(quizAnswers[q.key]) && (
                (q.key === "favoriteIngredients" && quizAnswers[q.key].length === 3) ||
                (q.key !== "favoriteIngredients" && quizAnswers[q.key].length > 0)
              ) ? '' : 'style="display:none;"'
            }>Confirm</button>`
          : isLast && !q.multi
          ? `<button class="next-btn" id="confirm-btn" onclick="submitQuiz()" style="display:none;">Create My Boosty Lunch</button>`
          : ""
      }
    </div>
  `;
}

window.handleAnswer = function(key, value, el) {
  const q = questions[currentQuestion];

  if (q.multi || key === "energyBoost") {
    if (key === "energyBoost") {
      const alreadySelected = quizAnswers[key] && quizAnswers[key][0] === value;
      if (alreadySelected) {
        quizAnswers[key] = [];
        el.classList.remove("selected");
      } else {
        quizAnswers[key] = [value];
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
          btn.classList.toggle("selected", btn.getAttribute('data-value') === value);
        });
      }
    } else if (key === "allergens") {
      quizAnswers[key] = quizAnswers[key] || [];
      if (value === "none") {
        quizAnswers[key] = ["none"];
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(btn => btn.classList.remove("selected"));
        el.classList.add("selected");
      } else {
        quizAnswers[key] = quizAnswers[key].filter(v => v !== "none");
        const idx = quizAnswers[key].indexOf(value);
        if (idx > -1) {
          quizAnswers[key].splice(idx, 1);
          el.classList.remove("selected");
        } else {
          quizAnswers[key].push(value);
          el.classList.add("selected");
        }

        const container = el.closest('.options');
        if (container) {
          const noneBtn = container.querySelector('[data-value="none"]');
          if (noneBtn) noneBtn.classList.remove("selected");
        }
      }
    } else {
      quizAnswers[key] = quizAnswers[key] || [];
      // Limit favoriteIngredients to 3
      const idx = quizAnswers[key].indexOf(value);
      if (idx > -1) {
        quizAnswers[key].splice(idx, 1);
        el.classList.remove("selected");
      } else if (key !== "favoriteIngredients" || quizAnswers[key].length < 3) {
        quizAnswers[key].push(value);
        el.classList.add("selected");
      }
      // After selecting the 3rd favorite ingredient, scroll to confirm button
      if (key === "favoriteIngredients" && quizAnswers[key].length === 3) {
        setTimeout(() => {
          const confirmBtn = document.getElementById('confirm-btn');
          if (confirmBtn) {
            confirmBtn.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 150);
      }
    }
    // Show/hide confirm button for multi-select and energyBoost
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
      if (
        (key === "favoriteIngredients" && quizAnswers[key].length === 3) ||
        (key === "energyBoost" && quizAnswers[key].length > 0) ||
        (key !== "favoriteIngredients" && key !== "energyBoost" && quizAnswers[key].length > 0)
      ) {
        confirmBtn.style.display = 'block';
      } else {
        confirmBtn.style.display = 'none';
      }
    }
  } else {
    if (!q.multi) {
      quizAnswers[key] = value;
      document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.toggle("selected", btn.getAttribute('data-value') === value);
      });

      let nextIndex = currentQuestion + 1;
      while (nextIndex < questions.length) {
        const next = questions[nextIndex];
        if (!next.dependsOn || quizAnswers[next.dependsOn.key] === next.dependsOn.value) break;
        nextIndex++;
      }

      currentQuestion = nextIndex;
      renderQuestion();

      // Show confirm button if it's the last question and an option was selected
      const confirmBtn = document.getElementById('confirm-btn');
      // if (confirmBtn && isLastQuestion()) {
      //   confirmBtn.style.display = 'block';
      // }
    }
  }
}

window.goBack = function() {
  let prevIndex = currentQuestion - 1;
  while (prevIndex >= 0) {
    const prev = questions[prevIndex];
    if (!prev.dependsOn || quizAnswers[prev.dependsOn.key] === quizAnswers[prev.dependsOn.key]) break;
    prevIndex--;
  }
  if (prevIndex >= 0) {
    currentQuestion = prevIndex;
    renderQuestion();
  }
};

window.goToNextQuestion = function() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    renderQuestion();
  }
};

window.submitQuiz = async function() {
  console.log("Final Answers:", quizAnswers);
  quizContainer.innerHTML = `
    <div class="logo-container"><img src="assets/BoostyLogo.png" alt="Boosty Logo" class="boosty-logo" /></div>
    <p>Creating your perfect Boosty lunch… 🥗</p>
  `;

  try {
    const result = await generateLunch(quizAnswers);
    quizContainer.innerHTML = `
      <div class="logo-container"><img src="assets/BoostyLogo.png" alt="Boosty Logo" class="boosty-logo" /></div>
      <div class="result-screen">
        <h1 class="result-title">Here is your<br>Boosty<br>Lunch</h1>
        <div class="result-section">
          <p class="result-label">MAIN ${
            result.main?.type === "wrap" ? "🌯" :
            result.main?.type === "salad" ? "🥗" :
            result.main?.type === "sandwich" ? "🥪" : ""
          }</p>
          <p class="result-value">
            ${result.main ? `${quizAnswers.hungerLevel === "light" ? "Small" : quizAnswers.hungerLevel === "medium" ? "Medium" : "Large"} ${result.main.name}${quizAnswers.breadType && quizAnswers.breadType !== "any" ? " on " + quizAnswers.breadType + " bread" : ""}` : "No match found 😢"}
          </p>
        </div>
        <div class="result-section">
          <p class="result-label">DRINK ${
            result.drink?.type === "coffee" ? "☕️" : "🧃"
          }</p>
          <p class="result-value">${result.drink ? result.drink.name : "No match found 😢"}</p>
        </div>
        ${result.sweet ? `
        <div class="result-section">
          <p class="result-label">SWEET</p>
          <p class="result-value">${result.sweet.name}</p>
        </div>` : ""}
        <p class="result-subtitle">Show this lunch to one of our workers and get 5% off of your order</p>
        <button class="next-btn" onclick="location.reload()">🔁 Try Again</button>
      </div>
    `;
  } catch (error) {
    quizContainer.innerHTML = `
      <div class="logo-container"><img src="assets/BoostyLogo.png" alt="Boosty Logo" class="boosty-logo" /></div>
      <p>Oops! Something went wrong. Please try again.</p>
    `;
    console.error(error);
  }
}


window.addEventListener("load", () => {
  renderQuestion();
});

// Add startQuiz function for welcome screen
window.startQuiz = function () {
  const welcomeScreen = document.querySelector('.welcome-screen');
  const quizContainer = document.getElementById('quiz-container');
  if (welcomeScreen) welcomeScreen.style.display = 'none';
  if (quizContainer) quizContainer.style.display = 'block';
  renderQuestion();
};