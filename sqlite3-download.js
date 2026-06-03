const questions = [
  {
    q: "SQLite3 stores an entire database in which type of structure?",
    options: ["A dedicated server process", "A single file on disk", "Multiple files spread across directories", "A network socket connection"],
    answer: 1,
    explain: "SQLite stores the entire database — tables, indexes, triggers, and views — in a single ordinary disk file. This is one of its defining features (serverless, single-file)."
  },
  {
    q: "Which dot-command lists all tables in the currently open SQLite database?",
    options: [".show", ".list", ".tables", ".schema"],
    answer: 2,
    explain: ".tables lists all the tables in the current database. .schema (without arguments) shows the CREATE statements for all objects, not just a list of table names."
  },
  {
    q: "What happens if you run `sqlite3 newdb.db` and newdb.db does not already exist?",
    options: ["SQLite throws an error", "SQLite creates the file automatically", "SQLite opens an in-memory database instead", "SQLite prompts you to confirm creation"],
    answer: 1,
    explain: "When you specify a filename that doesn't exist, SQLite creates it automatically the moment you make a change to the database. If you quit without writing any data, the file is not saved."
  },
  {
    q: "Which SQL command would you use to add a new column called `phone TEXT` to an existing `users` table?",
    options: ["ADD COLUMN users phone TEXT;", "ALTER TABLE users ADD COLUMN phone TEXT;", "UPDATE TABLE users ADD phone TEXT;", "MODIFY TABLE users INSERT COLUMN phone TEXT;"],
    answer: 1,
    explain: "The correct syntax is ALTER TABLE tablename ADD COLUMN columnname datatype;. SQLite's ALTER TABLE support is limited — you can add columns and rename the table, but you cannot drop columns directly."
  },
  {
    q: "What does the SQL wildcard `%` represent in a LIKE clause?",
    options: ["Exactly one character", "Any single digit", "Zero or more characters of any kind", "A literal percent symbol only"],
    answer: 2,
    explain: "In a LIKE clause, % matches zero or more characters of any type. For example, 'G%' matches 'Gordon', 'Go', or 'G' alone. The underscore _ matches exactly one character."
  },
  {
    q: "You want to permanently remove the entire `orders` table, including its structure and all data. Which command does this?",
    options: ["DELETE FROM orders;", "REMOVE TABLE orders;", "TRUNCATE TABLE orders;", "DROP TABLE orders;"],
    answer: 3,
    explain: "DROP TABLE removes the table structure and all of its data permanently. DELETE FROM orders; removes all rows but leaves the table structure intact. SQLite does not support TRUNCATE."
  },
  {
    q: "Which of these is NOT a valid SQLite column type affinity?",
    options: ["TEXT", "BLOB", "BOOLEAN", "REAL"],
    answer: 2,
    explain: "SQLite's five storage classes are NULL, INTEGER, REAL, TEXT, and BLOB. There is no native BOOLEAN type — SQLite stores booleans as integers (0 for false, 1 for true). It will accept BOOLEAN as a column type declaration but stores values as integers."
  },
  {
    q: "What is the purpose of the `.headers on` dot-command?",
    options: ["Enables foreign key constraints", "Shows column names above query results", "Displays the database file headers", "Turns on syntax highlighting"],
    answer: 1,
    explain: "By default, SQLite's shell outputs query results without column names. Running .headers on makes the shell print column names as a header row above your query results, which is much easier to read."
  },
  {
    q: "Which keyword prevents duplicate values in a column when defining a table?",
    options: ["PRIMARY", "DISTINCT", "UNIQUE", "NOT NULL"],
    answer: 2,
    explain: "The UNIQUE constraint ensures no two rows can have the same value in that column (or combination of columns). NOT NULL prevents empty values but allows duplicates. PRIMARY KEY is both UNIQUE and NOT NULL, but it's a special constraint for the row identifier."
  },
  {
    q: "If you run `UPDATE users SET age = 99;` with no WHERE clause, what happens?",
    options: ["SQLite throws an error requiring a WHERE clause", "Only the first row is updated", "Every row in the users table has its age set to 99", "Only rows where age is NULL are updated"],
    answer: 2,
    explain: "Without a WHERE clause, an UPDATE statement affects every single row in the table. This is a common and dangerous mistake — always double-check that your UPDATE has a WHERE clause when you only intend to update specific rows."
  }
];

let answered = {};
let score = 0;

function buildQuiz() {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';
  answered = {};
  score = 0;
  updateProgress();
  document.getElementById('submit-btn').style.display = 'none';
  document.getElementById('quiz-results').classList.remove('show');
  document.getElementById('quiz-status').textContent = '';
  document.getElementById('score-badge').textContent = 'Score: 0 / 0';

  questions.forEach((q, qi) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = 'qcard-' + qi;

    const letters = ['A','B','C','D'];
    const opts = q.options.map((opt, oi) => `
      <button class="option-btn" id="opt-${qi}-${oi}" data-qi="${qi}" data-oi="${oi}">
        <span class="option-letter">${letters[oi]}</span>
        ${opt}
      </button>
    `).join('');

    card.innerHTML = `
      <div class="question-header">
        <div class="q-num">${qi + 1}</div>
        <div class="q-text">${q.q}</div>
      </div>
      <div class="options-list">${opts}</div>
      <div class="explanation" id="exp-${qi}"><strong>Explanation:</strong> ${q.explain}</div>
    `;
    container.appendChild(card);
  });
}

function selectAnswer(qi, oi) {
  if (answered[qi] !== undefined) return;
  answered[qi] = oi;
  const q = questions[qi];
  const card = document.getElementById('qcard-' + qi);
  const isCorrect = oi === q.answer;

  if (isCorrect) {
    score++;
    card.classList.add('correct');
  } else {
    card.classList.add('incorrect');
  }

  for (let i = 0; i < q.options.length; i++) {
    const btn = document.getElementById(`opt-${qi}-${i}`);
    btn.disabled = true;
    if (i === q.answer && !isCorrect) btn.classList.add('reveal');
    else if (i === oi) btn.classList.add(isCorrect ? 'correct' : 'incorrect');
  }

  document.getElementById('exp-' + qi).classList.add('show');
  updateProgress();

  const total = Object.keys(answered).length;
  if (total === questions.length) {
    document.getElementById('submit-btn').style.display = 'inline-block';
    document.getElementById('quiz-status').textContent = 'All questions answered — submit to see your final results!';
  }
}

function updateProgress() {
  const total = Object.keys(answered).length;
  const correct = score;
  document.getElementById('progress-label').textContent = `${total} / ${questions.length} answered`;
  document.getElementById('progress-fill').style.width = ((total / questions.length) * 100) + '%';
  if (total > 0) {
    document.getElementById('score-badge').textContent = `Score: ${correct} / ${total}`;
  }
}

function submitQuiz() {
  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  document.getElementById('results-score').textContent = score + '/' + total;
  document.getElementById('res-correct').textContent = score;
  document.getElementById('res-incorrect').textContent = total - score;
  document.getElementById('res-pct').textContent = pct + '%';

  let label, sub;
  if (pct === 100) { label = '🏆 Perfect Score!'; sub = 'Outstanding! You have a solid command of SQLite3.'; }
  else if (pct >= 80) { label = '🎉 Excellent Work!'; sub = 'Great job — just a couple of things to review.'; }
  else if (pct >= 60) { label = '👍 Good Effort!'; sub = 'You know the basics. Review the explanations above to reinforce the rest.'; }
  else { label = '📚 Keep Studying!'; sub = 'Head back to the Installation and Basics tabs to review — then try again.'; }

  document.getElementById('results-label').textContent = label;
  document.getElementById('results-sub').textContent = sub;
  document.getElementById('quiz-results').classList.add('show');
  document.getElementById('submit-btn').style.display = 'none';
  document.getElementById('quiz-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetQuiz() {
  buildQuiz();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchTab(tab, sidebarItem, tabBtn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));

  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('tab-btn-' + tab).classList.add('active');

  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const map = { install: 0, basics: 1, quiz: 2 };
  if (sidebarItems[map[tab]]) sidebarItems[map[tab]].classList.add('active');
}

function switchOS(val) {
  document.querySelectorAll('.os-panel').forEach(el => el.classList.remove('active'));
  document.getElementById('panel-' + val).classList.add('active');
}

function scrollToLevel(level, btn) {
  document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const anchor = document.getElementById('level-' + level);
  if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyCode(btn) {
  const block = btn.parentElement.querySelector('code');
  const text = block.innerText;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', function () {

  buildQuiz();

  // Tab switching — sidebar items
  document.querySelectorAll('.sidebar-item[data-tab]').forEach(function (item) {
    item.addEventListener('click', function () { switchTab(this.dataset.tab, this); });
  });

  // Tab switching — top tab buttons
  document.querySelectorAll('.tab-btn[id^="tab-btn-"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(this.id.replace('tab-btn-', ''), null, this);
    });
  });

  // OS selector
  const osSelect = document.getElementById('osSelect');
  if (osSelect) osSelect.addEventListener('change', function () { switchOS(this.value); });

  // Level scroll buttons
  document.querySelectorAll('.level-btn[data-level]').forEach(function (btn) {
    btn.addEventListener('click', function () { scrollToLevel(this.dataset.level, this); });
  });

  // Submit / reset quiz buttons
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) submitBtn.addEventListener('click', submitQuiz);
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', resetQuiz);

  // Delegated handlers for dynamically created elements
  document.addEventListener('click', function (e) {
    // Copy buttons
    if (e.target.classList.contains('copy-btn')) { copyCode(e.target); return; }

    // Quiz option buttons
    const opt = e.target.closest('.option-btn[data-qi]');
    if (opt) { selectAnswer(parseInt(opt.dataset.qi), parseInt(opt.dataset.oi)); return; }

    // Retake Quiz button (rendered inside quiz-results)
    if (e.target.classList.contains('btn-primary') && e.target.textContent.trim() === 'Retake Quiz') {
      resetQuiz();
    }
  });

});
