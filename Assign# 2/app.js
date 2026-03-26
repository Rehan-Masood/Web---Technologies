function quizNovaApp() {
  return {
    isDark: true,
    soundEnabled: true,
    sidebarOpen: false,
    fabMenuOpen: false,
    showLeaderboard: false,
    showToast: false,
    toastMessage: "",
    toastType: "success",

    appState: "dashboard",
    selectedCategory: "All",
    difficulty: "Medium",

    timeRemaining: 30,
    timerInterval: null,
    currentQuestionIndex: 0,
    selectedAnswerIndex: null,
    showFeedback: false,
    feedbackIsCorrect: false,

    userProfile: {
      totalQuizzes: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      bestScore: 0,
      averageScore: 0,
      streak: 0,
      lastPlayDate: null,
      totalXP: 0,
      level: 1,
      quizHistory: [],
      achievements: []
    },

    currentQuiz: {
      questions: [],
      answers: [],
      score: 0,
      category: "All",
      difficulty: "Medium",
      startTime: null,
      isDaily: false
    },

    topScores: [
      { name: "Sophia Chen", score: 98, quizzes: 156, streak: 21, level: 15 },
      { name: "James Rodriguez", score: 96, quizzes: 143, streak: 18, level: 14 },
      { name: "Emma Wilson", score: 94, quizzes: 128, streak: 15, level: 13 },
      { name: "Liam Murphy", score: 91, quizzes: 112, streak: 12, level: 12 },
      { name: "Olivia Davis", score: 89, quizzes: 98, streak: 9, level: 11 }
    ],

    achievementsCatalog: [
      { id: "first_quiz", name: "First Step", description: "Complete your first quiz", icon: "🎯" },
      { id: "perfect_score", name: "Perfect Score", description: "Score 100% in a quiz", icon: "⭐" },
      { id: "streak_5", name: "On Fire", description: "Reach a 5 day streak", icon: "🔥" },
      { id: "quiz_10", name: "Quiz Addict", description: "Complete 10 quizzes", icon: "📚" },
      { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: "🚀" },
      { id: "avg_90", name: "Great Student", description: "Maintain 90% average", icon: "🎓" }
    ],

    allQuestions: [
      {
        question: "What does <strong>API</strong> stand for?",
        options: [
          "Application Programming Interface",
          "Advanced Protocol Integration",
          "Application Process Interaction",
          "Automated Programming Index"
        ],
        correct: 0,
        category: "Tech",
        difficulty: "Easy",
        explanation: "API stands for Application Programming Interface."
      },
      {
        question: "Which of these is NOT a JavaScript framework?",
        options: ["React", "Vue", "Angular", "Laravel"],
        correct: 3,
        category: "Tech",
        difficulty: "Medium",
        explanation: "Laravel is a PHP framework, not a JavaScript framework."
      },
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
        correct: 1,
        category: "Science",
        difficulty: "Easy",
        explanation: "Mitochondria are responsible for producing cellular energy."
      },
      {
        question: "In economics, what does GDP measure?",
        options: [
          "Growing Debt Percentage",
          "Gross Domestic Product",
          "Global Development Programme",
          "Gross Distributed Profit"
        ],
        correct: 1,
        category: "Business",
        difficulty: "Medium",
        explanation: "GDP is the total monetary value of goods and services produced."
      },
      {
        question: "Which cloud provider is owned by Amazon?",
        options: ["Azure", "AWS", "Google Cloud", "Heroku"],
        correct: 1,
        category: "Tech",
        difficulty: "Easy",
        explanation: "AWS stands for Amazon Web Services."
      },
      {
        question: "What is the smallest unit of matter?",
        options: ["Atom", "Molecule", "Electron", "Neutron"],
        correct: 0,
        category: "Science",
        difficulty: "Hard",
        explanation: "An atom is the smallest unit of matter that retains chemical identity."
      },
      {
        question: "What year was the World Wide Web invented?",
        options: ["1989", "1995", "2000", "1991"],
        correct: 0,
        category: "Tech",
        difficulty: "Medium",
        explanation: "Tim Berners-Lee proposed the World Wide Web in 1989."
      },
      {
        question: "What is ROI in business?",
        options: [
          "Return on Investment",
          "Rate of Integration",
          "Revenue on Income",
          "Retail Operating Index"
        ],
        correct: 0,
        category: "Business",
        difficulty: "Easy",
        explanation: "ROI means Return on Investment."
      },
      {
        question: "What is photosynthesis?",
        options: [
          "Energy breakdown in cells",
          "Plant reproduction",
          "Process of converting light into chemical energy",
          "Water transport in plants"
        ],
        correct: 2,
        category: "Science",
        difficulty: "Easy",
        explanation: "Photosynthesis converts light energy into stored chemical energy."
      },
      {
        question: "What is machine learning?",
        options: [
          "Manual learning",
          "Systems that learn from data without explicit programming",
          "Teaching machines to code",
          "Only robotics"
        ],
        correct: 1,
        category: "Tech",
        difficulty: "Hard",
        explanation: "Machine learning allows systems to identify patterns from data."
      },
      {
        question: "In business, what is a startup runway?",
        options: [
          "Airport investment lane",
          "Time before a startup runs out of cash",
          "Launch marketing period",
          "Hiring pipeline"
        ],
        correct: 1,
        category: "Business",
        difficulty: "Hard",
        explanation: "Runway means how long a startup can operate before cash runs out."
      },
      {
        question: "What particle carries a negative electric charge?",
        options: ["Proton", "Neutron", "Electron", "Photon"],
        correct: 2,
        category: "Science",
        difficulty: "Medium",
        explanation: "Electrons are negatively charged."
      }
    ],

    initialize() {
      this.loadUserProfile();
      this.loadPreferences();
      this.applyTheme();

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.sidebarOpen = false;
          this.showLeaderboard = false;
          this.fabMenuOpen = false;
        }

        if (this.appState === "quizActive" && !this.showFeedback) {
          const map = { "1": 0, "2": 1, "3": 2, "4": 3 };
          if (map[e.key] !== undefined) {
            this.selectAnswer(map[e.key]);
          }
        }
      });
    },

    loadUserProfile() {
      const saved = localStorage.getItem("quizNova_profile");
      if (saved) {
        this.userProfile = JSON.parse(saved);
      }
    },

    saveUserProfile() {
      localStorage.setItem("quizNova_profile", JSON.stringify(this.userProfile));
    },

    loadPreferences() {
      const theme = localStorage.getItem("quizNova_theme");
      const sound = localStorage.getItem("quizNova_sound");
      const cat = localStorage.getItem("quizNova_category");
      const diff = localStorage.getItem("quizNova_difficulty");

      this.isDark = theme !== "light";
      this.soundEnabled = sound !== "off";
      if (cat) this.selectedCategory = cat;
      if (diff) this.difficulty = diff;
    },

    persistPreferences() {
      localStorage.setItem("quizNova_theme", this.isDark ? "dark" : "light");
      localStorage.setItem("quizNova_sound", this.soundEnabled ? "on" : "off");
      localStorage.setItem("quizNova_category", this.selectedCategory);
      localStorage.setItem("quizNova_difficulty", this.difficulty);
    },

    toggleTheme() {
      this.isDark = !this.isDark;
      this.applyTheme();
      this.persistPreferences();
    },

    applyTheme() {
      document.body.classList.toggle("light-mode", !this.isDark);
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      this.persistPreferences();
      this.showNotification(this.soundEnabled ? "Sound enabled." : "Sound disabled.", "info");
    },

    playBeep(type = "good") {
      if (!this.soundEnabled) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.value = type === "good" ? 720 : 240;
        gain.gain.value = 0.05;

        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch (_) {}
    },

    seededRandom(seed) {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    },

    startDailyChallenge() {
      const daySeed = Math.floor(new Date().setHours(0, 0, 0, 0) / 86400000);
      let pool = [...this.allQuestions];
      pool.sort((a, b) => this.seededRandom(daySeed + a.question.length) - this.seededRandom(daySeed + b.question.length));
      this.startPreparedQuiz(pool.slice(0, 5), "All", "Mixed", true);
    },

    startQuiz() {
      this.sidebarOpen = false;
      this.fabMenuOpen = false;
      this.persistPreferences();

      let filtered = [...this.allQuestions];

      if (this.selectedCategory !== "All") {
        filtered = filtered.filter(q => q.category === this.selectedCategory);
      }

      filtered = filtered.filter(q => q.difficulty === this.difficulty);

      if (filtered.length === 0) {
        this.showNotification("No questions found for selected filters.", "error");
        return;
      }

      filtered.sort(() => Math.random() - 0.5);
      this.startPreparedQuiz(filtered.slice(0, Math.min(5, filtered.length)), this.selectedCategory, this.difficulty, false);
    },

    startPreparedQuiz(questions, category, difficulty, isDaily) {
      this.currentQuiz = {
        questions,
        answers: [],
        score: 0,
        category,
        difficulty,
        startTime: new Date(),
        isDaily
      };

      this.currentQuestionIndex = 0;
      this.selectedAnswerIndex = null;
      this.showFeedback = false;
      this.feedbackIsCorrect = false;
      this.timeRemaining = 30;
      this.appState = "quizActive";
      this.startTimer();
    },

    startTimer() {
      this.stopTimer();
      this.timerInterval = setInterval(() => {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.stopTimer();
          if (!this.showFeedback) {
            this.showNotification("Time's up.", "info");
            this.skipQuestion();
          }
        }
      }, 1000);
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    selectAnswer(index) {
      if (this.selectedAnswerIndex !== null) return;

      const q = this.currentQuestion;
      this.selectedAnswerIndex = index;
      this.feedbackIsCorrect = index === q.correct;
      this.showFeedback = true;

      this.currentQuiz.answers.push({
        question: q.question.replace(/<[^>]+>/g, ""),
        options: q.options,
        selectedIndex: index,
        correctIndex: q.correct,
        correct: this.feedbackIsCorrect,
        explanation: q.explanation
      });

      if (this.feedbackIsCorrect) {
        this.currentQuiz.score++;
        this.playBeep("good");
        this.showNotification("Correct! 🎉", "success");
        if (typeof confetti !== "undefined") {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
      } else {
        this.playBeep("bad");
        this.showNotification("Incorrect answer.", "error");
      }

      this.stopTimer();
    },

    skipQuestion() {
      const q = this.currentQuestion;
      this.currentQuiz.answers.push({
        question: q.question.replace(/<[^>]+>/g, ""),
        options: q.options,
        selectedIndex: -1,
        correctIndex: q.correct,
        correct: false,
        explanation: q.explanation
      });
      this.nextQuestion();
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
        this.currentQuestionIndex++;
        this.selectedAnswerIndex = null;
        this.showFeedback = false;
        this.feedbackIsCorrect = false;
        this.timeRemaining = 30;
        this.startTimer();
      } else {
        this.finishQuiz();
      }
    },

    finishQuiz() {
      this.stopTimer();

      const percent = this.finalScore;
      this.userProfile.totalQuizzes += 1;
      this.userProfile.totalCorrect += this.currentQuiz.score;
      this.userProfile.totalIncorrect += (this.currentQuiz.questions.length - this.currentQuiz.score);
      this.userProfile.bestScore = Math.max(this.userProfile.bestScore, percent);

      const totalAnswers = this.userProfile.totalCorrect + this.userProfile.totalIncorrect;
      this.userProfile.averageScore = totalAnswers
        ? Math.round((this.userProfile.totalCorrect / totalAnswers) * 100)
        : 0;

      this.userProfile.streak = percent >= 80 ? this.userProfile.streak + 1 : 0;
      this.userProfile.totalXP += percent;
      this.userProfile.level = Math.floor(this.userProfile.totalXP / 500) + 1;
      this.userProfile.lastPlayDate = new Date().toISOString();

      this.userProfile.quizHistory.push({
        date: new Date().toISOString(),
        category: this.currentQuiz.category,
        difficulty: this.currentQuiz.difficulty,
        score: percent,
        isDaily: this.currentQuiz.isDaily
      });

      if (this.userProfile.quizHistory.length > 10) {
        this.userProfile.quizHistory = this.userProfile.quizHistory.slice(-10);
      }

      this.unlockAchievements(percent);
      this.saveUserProfile();
      this.appState = "quizResult";

      if (percent >= 90 && typeof confetti !== "undefined") {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.65 } });
      }
    },

    unlockAchievements(percent) {
      const achievements = this.userProfile.achievements;

      const unlock = (id) => {
        if (!achievements.includes(id)) {
          achievements.push(id);
          const item = this.achievementsCatalog.find(a => a.id === id);
          if (item) this.showNotification(`Achievement unlocked: ${item.name} ${item.icon}`, "success");
        }
      };

      if (this.userProfile.totalQuizzes >= 1) unlock("first_quiz");
      if (percent === 100) unlock("perfect_score");
      if (this.userProfile.streak >= 5) unlock("streak_5");
      if (this.userProfile.totalQuizzes >= 10) unlock("quiz_10");
      if (this.userProfile.level >= 5) unlock("level_5");
      if (this.userProfile.averageScore >= 90 && this.userProfile.totalQuizzes >= 3) unlock("avg_90");
    },

    restartQuiz() {
      this.stopTimer();
      this.appState = "dashboard";
      this.selectedAnswerIndex = null;
      this.showFeedback = false;
      this.feedbackIsCorrect = false;
    },

    resetProgress() {
      const yes = confirm("Reset all local progress?");
      if (!yes) return;

      this.userProfile = {
        totalQuizzes: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        bestScore: 0,
        averageScore: 0,
        streak: 0,
        lastPlayDate: null,
        totalXP: 0,
        level: 1,
        quizHistory: [],
        achievements: []
      };
      this.saveUserProfile();
      this.showNotification("Progress reset.", "info");
    },

    generatePDFReport() {
      try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        let y = 16;
        const left = 14;
        const maxWidth = 180;
        const total = this.currentQuiz.questions.length;
        const score = this.currentQuiz.score;
        const wrong = total - score;
        const percent = this.finalScore;
        const duration = this.currentQuiz.startTime
          ? Math.round((new Date() - new Date(this.currentQuiz.startTime)) / 1000)
          : 0;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text("QuizNova Elite - Quiz Report", left, y);
        y += 10;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(`Date: ${new Date().toLocaleString()}`, left, y); y += 6;
        pdf.text(`Category: ${this.currentQuiz.category}`, left, y); y += 6;
        pdf.text(`Difficulty: ${this.currentQuiz.difficulty}`, left, y); y += 6;
        pdf.text(`Total Questions: ${total}`, left, y); y += 6;
        pdf.text(`Correct: ${score}`, left, y); y += 6;
        pdf.text(`Wrong: ${wrong}`, left, y); y += 6;
        pdf.text(`Score: ${percent}%`, left, y); y += 6;
        pdf.text(`Time Taken: ${duration}s`, left, y); y += 10;

        pdf.setFont("helvetica", "bold");
        pdf.text("Detailed Review", left, y);
        y += 8;

        this.currentQuiz.answers.forEach((a, idx) => {
          if (y > 250) {
            pdf.addPage();
            y = 16;
          }

          pdf.setFont("helvetica", "bold");
          const qLines = pdf.splitTextToSize(`${idx + 1}. ${a.question}`, maxWidth);
          pdf.text(qLines, left, y);
          y += qLines.length * 5;

          pdf.setFont("helvetica", "normal");
          const selected = a.selectedIndex >= 0 ? a.options[a.selectedIndex] : "Not answered";
          const correct = a.options[a.correctIndex];

          pdf.text(`Your answer: ${selected}`, left + 4, y); y += 5;
          pdf.text(`Correct answer: ${correct}`, left + 4, y); y += 5;
          pdf.text(`Result: ${a.correct ? "Correct" : "Wrong"}`, left + 4, y); y += 5;

          const expl = pdf.splitTextToSize(`Explanation: ${a.explanation}`, maxWidth - 4);
          pdf.text(expl, left + 4, y);
          y += expl.length * 5 + 5;
        });

        pdf.setFontSize(8);
        pdf.text("Generated by QuizNova Elite", left, 288);

        const filename = `QuizNova_Result_${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`;
        pdf.save(filename);
        this.showNotification("PDF downloaded successfully.", "success");
      } catch (err) {
        console.error(err);
        this.showNotification("Failed to generate PDF.", "error");
      }
    },

    showNotification(message, type = "success") {
      this.toastMessage = message;
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 2600);
    },

    get currentQuestion() {
      return this.currentQuiz.questions[this.currentQuestionIndex] || null;
    },

    get progressPercentage() {
      if (!this.currentQuiz.questions.length) return 0;
      return Math.round(((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100);
    },

    get finalScore() {
      if (!this.currentQuiz.questions.length) return 0;
      return Math.round((this.currentQuiz.score / this.currentQuiz.questions.length) * 100);
    },

    get streakText() {
      if (this.userProfile.streak === 0) return "Start a streak!";
      if (this.userProfile.streak === 1) return "1 day";
      return `${this.userProfile.streak} days`;
    },

    get performanceMessage() {
      if (this.finalScore >= 90) return "🎉 Outstanding performance!";
      if (this.finalScore >= 70) return "👏 Great job!";
      return "💪 Keep practicing!";
    },

    get unlockedAchievements() {
      return this.achievementsCatalog.filter(a => this.userProfile.achievements.includes(a.id));
    }
  };
}