
const subtopics = {
    "Mathematics": [
        "Number Sense",
        "Algebra",
        "Geometry",
        "Statistics and Probability"
    ]
};

let currentQuestions = questions;
let currentQuestionIndex = 0;
let selectedAnswer = null;
let score = 0;
let answerChecked = false;
let progress = JSON.parse(
    localStorage.getItem("letReviewerProgress")
) || {};
let currentBatchTopic = null;
let currentBatchNumber = null;
let currentQuizTopic = null;
// SHUFFLE QUESTIONS AND ANSWER CHOICES

function shuffleQuestions(sourceQuestions) {

    const shuffled = sourceQuestions.map(function(question) {

        const correctChoice = question.choices[question.answer];

        const choices = [...question.choices];

        // Shuffle answer choices
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        return {
            ...question,
            choices: choices,
            answer: choices.indexOf(correctChoice)
        };

    });

    // Shuffle question order
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}
let mistakes = JSON.parse(
    localStorage.getItem("letReviewerMistakes")
) || [];
// UPDATE DASHBOARD STATISTICS


function updateDashboard() {

    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalBatches = 0;
    let historyHTML = "";

    Object.keys(progress).forEach(function(topic) {

        Object.keys(progress[topic]).forEach(function(batch) {

            const result = progress[topic][batch];

            if (!result.completed) return;

            // DASHBOARD STATISTICS
            totalQuestions += result.total;
            totalCorrect += result.score;
            totalBatches++;

            // ATTEMPT HISTORY
            const attempts = result.attempts || [];

            const records = attempts.length > 0
                ? attempts
                : [{
                    score: result.score,
                    total: result.total,
                    completedAt: result.completedAt
                }];

            let bestScore = Math.max(
                ...records.map(function(attempt) {
                    return attempt.score;
                })
            );

            const firstAttempt = records[0];
            const latestAttempt = records[records.length - 1];

            const improvement = Math.round(
                (latestAttempt.score / latestAttempt.total -
                 firstAttempt.score / firstAttempt.total) * 100
            );

            historyHTML += `
                <div class="card" style="margin-top: 15px;">

                    <h3>${topic} - Batch ${batch}</h3>

                    <p>Best Score: ${bestScore}/${result.total}</p>

                    <p>Latest Score:
                        ${latestAttempt.score}/${latestAttempt.total}
                    </p>

                    <p>Performance Improvement:
                        ${improvement > 0 ? "+" : ""}${improvement} percentage points
                    </p>

                    <h4>Attempt History</h4>
            `;

            records.forEach(function(attempt, index) {

                const date = attempt.completedAt
                    ? new Date(attempt.completedAt).toLocaleString()
                    : "Date unavailable";

                const accuracy = Math.round(
                    (attempt.score / attempt.total) * 100
                );

                historyHTML += `
                    <div style="
                        padding: 10px;
                        border-bottom: 1px solid #ddd;
                    ">
                        <strong>Attempt ${index + 1}</strong>
                        <p>Score: ${attempt.score}/${attempt.total}</p>
                        <p>Accuracy: ${accuracy}%</p>
                        <small>${date}</small>
                    </div>
                `;

            });

            historyHTML += `</div>`;

        });

    });

    const accuracy = totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    document.getElementById("dashboardQuestions").textContent =
        totalQuestions;

    document.getElementById("dashboardCorrect").textContent =
        totalCorrect;

    document.getElementById("dashboardAccuracy").textContent =
        accuracy + "%";

    document.getElementById("dashboardBatches").textContent =
        totalBatches;

    document.getElementById("reviewHistory").innerHTML =
        historyHTML || "<p>No review history yet. Start practicing!</p>";
const mistakeCountDisplay =
    document.getElementById("mistakeCount");

if (mistakeCountDisplay) {
    mistakeCountDisplay.textContent = mistakes.length;
}
}


// LOAD DASHBOARD WHEN THE PAGE OPENS
updateDashboard();

// SHOW GENERAL EDUCATION OR PROFESSIONAL EDUCATION

function showSubject(subject) {

    document.getElementById("homePage").style.display = "none";
    document.getElementById("topicPage").style.display = "block";
    document.getElementById("quizPage").style.display = "none";
    document.getElementById("batchPage").style.display = "none";
document.getElementById("mistakePage").style.display = "none";
    document.getElementById("subjectTitle").textContent = subject;

    let topics = [];

    if (subject === "General Education") {
        topics = [
            "English",
            "Mathematics",
            "Science",
            "Filipino",
            "Social Sciences",
            "Information and Communication Technology"
        ];
    } else {
        topics = [
            "The Teaching Profession",
            "Principles of Teaching",
            "Educational Technology",
            "Assessment of Learning",
            "Child and Adolescent Development",
            "Curriculum Development"
        ];
    }

    let topicHTML = "";

    topics.forEach(function(topic) {

        if (subtopics[topic]) {

            topicHTML += `
                <div class="card">
                    <h3>${topic}</h3>
                    <p>Explore the different topics under ${topic}.</p>
                    <button onclick="showSubtopics('${topic}')">
                        Explore Topics
                    </button>
                </div>
            `;

        } else {

            topicHTML += `
                <div class="card">
                    <h3>${topic}</h3>
                    <p>Practice and strengthen your knowledge.</p>
                    <button onclick="startQuiz('${topic}')">
                        Start Reviewing
                    </button>
                </div>
            `;

        }

    });

    document.getElementById("topicList").innerHTML = topicHTML;

}


// SHOW MATHEMATICS SUBTOPICS

function showSubtopics(subject) {

    document.getElementById("subjectTitle").textContent = subject;

    let subtopicHTML = "";

    subtopics[subject].forEach(function(topic) {

        subtopicHTML += `
            <div class="card">
                <h3>${topic}</h3>
                <p>50 questions · 10 batches</p>
                <button onclick="showBatches('${topic}')">
                    View Batches
                </button>
            </div>
        `;

    });

    document.getElementById("topicList").innerHTML = subtopicHTML;

}


// SHOW BATCHES



function showBatches(topic) {

    document.getElementById("topicPage").style.display = "none";
    document.getElementById("batchPage").style.display = "block";

    document.getElementById("batchTitle").textContent = topic;

    let batchHTML = "";
    let completedCount = 0;

let totalQuestionsAnswered = 0;
let totalCorrectAnswers = 0;

Object.values(progress).forEach(function(topicProgress) {

    Object.values(topicProgress).forEach(function(result) {

        if (result.completed) {
            totalQuestionsAnswered += result.total;
            totalCorrectAnswers += result.score;
        }

    });

});

const accuracy = totalQuestionsAnswered > 0
    ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
    : 0;

    for (let i = 1; i <= 10; i++) {

        const batchQuestions = batchData[topic]?.[i - 1];
        const result = progress[topic]?.[i];

        const isAvailable = Boolean(batchQuestions);
        const isCompleted = Boolean(result?.completed);

        if (isCompleted) {
            completedCount++;
        }

        let statusText = "Coming Soon";
        let buttonText = "Coming Soon";

        if (isCompleted) {
            statusText = `Score: ${result.score}/${result.total}`;
            buttonText = "Practice Again";
        } else if (isAvailable) {
            statusText = "Not yet completed";
            buttonText = "Start Batch";
        }

        batchHTML += `
            <div class="card">
                <h3>Batch ${i}</h3>
                <p>Questions ${(i - 1) * 5 + 1}–${i * 5}</p>
                <p>${statusText}</p>

                <button
                    onclick="startBatch('${topic}', ${i})"
                    ${isAvailable ? "" : "disabled"}
                >
                    ${buttonText}
                </button>
            </div>
        `;
    }

    const percentage = (completedCount / 10) * 100;

const performanceHTML = `
    <div class="card">
        <h3>My Performance Summary</h3>

        <p>Total Questions Answered: ${totalQuestionsAnswered}</p>

        <p>Correct Answers: ${totalCorrectAnswers}</p>

        <p>Overall Accuracy: ${accuracy}%</p>
    </div>
`;

    const progressHTML = `
        <div class="card">
            <h3>My Progress</h3>
            <p>${completedCount} out of 10 batches completed</p>

            <div style="
                background: #e5e7eb;
                height: 12px;
                border-radius: 20px;
                overflow: hidden;
            ">
                <div style="
                    background: #16a34a;
                    width: ${percentage}%;
                    height: 100%;
                    border-radius: 20px;
                "></div>
            </div>

            <p>${percentage}% Completed</p>
        </div>
    `;

    document.getElementById("batchList").innerHTML =
    performanceHTML + progressHTML + batchHTML;

}




// START A BATCH

function startBatch(topic, batchNumber) {

    currentQuestions = batchData[topic]?.[batchNumber - 1];

    if (!currentQuestions) {
        alert("This batch is not available yet!");
        return;
    }

    currentQuestionIndex = 0;
    score = 0;
currentBatchTopic = topic;
currentBatchNumber = batchNumber;
currentQuizTopic = topic;
    document.getElementById("batchPage").style.display = "none";
    document.getElementById("quizPage").style.display = "block";

    document.getElementById("quizCategory").textContent =
        topic.toUpperCase() + " - BATCH " + batchNumber;

    displayQuestion();

}


// START A REGULAR QUIZ

function startQuiz(topic) {

    currentQuestions = questions;
    currentQuestionIndex = 0;
    score = 0;
currentBatchTopic = null;
currentBatchNumber = null;
currentQuizTopic = topic;
    document.getElementById("topicPage").style.display = "none";
    document.getElementById("batchPage").style.display = "none";
    document.getElementById("quizPage").style.display = "block";

    document.getElementById("quizCategory").textContent =
        topic.toUpperCase();

    displayQuestion();

}


// BACK TO HOME
// START PRACTICING SAVED MISTAKES

function startMistakeQuiz() {

    if (mistakes.length === 0) {
        alert("You have no saved mistakes to practice!");
        return;
    }

    currentQuestions = mistakes.map(function(mistake) {
        return {
            question: mistake.question,
            choices: mistake.choices,
            answer: mistake.answer,
            explanation: mistake.explanation
        };
    });

    currentQuestionIndex = 0;
    score = 0;

    currentBatchTopic = null;
    currentBatchNumber = null;

    currentQuizTopic = "Mistake Review";

    document.getElementById("mistakePage").style.display = "none";
    document.getElementById("quizPage").style.display = "block";

    document.getElementById("quizCategory").textContent =
        "MISTAKE REVIEW";

    displayQuestion();

} 
// SHOW SAVED MISTAKES

function showMistakes() {

    document.getElementById("homePage").style.display = "none";
    document.getElementById("topicPage").style.display = "none";
    document.getElementById("batchPage").style.display = "none";
    document.getElementById("quizPage").style.display = "none";
    document.getElementById("mistakePage").style.display = "block";

    let mistakeHTML = "";

    mistakes.forEach(function(mistake, index) {

        mistakeHTML += `
            <div class="card" style="margin-top: 15px;">

                <h3>Mistake ${index + 1}</h3>

                <p><strong>Topic:</strong> ${mistake.topic}</p>

                <p><strong>Question:</strong> ${mistake.question}</p>

                <p><strong>Your Answer:</strong>
                    ${mistake.choices[mistake.selectedAnswer]}
                </p>

                <p><strong>Correct Answer:</strong>
                    ${mistake.choices[mistake.answer]}
                </p>

                <p><strong>Explanation:</strong>
                    ${mistake.explanation}
                </p>

                <small>
                    ${new Date(mistake.date).toLocaleString()}
                </small>

            </div>
        `;

    });

    document.getElementById("mistakeList").innerHTML =
        mistakeHTML || "<p>No mistakes saved yet. Great job!</p>";

}
function goHome() {

    document.getElementById("topicPage").style.display = "none";
    document.getElementById("homePage").style.display = "grid";
    document.getElementById("quizPage").style.display = "none";
    document.getElementById("batchPage").style.display = "none";

}


// BACK TO TOPICS

function goToTopics() {

    document.getElementById("quizPage").style.display = "none";
    document.getElementById("batchPage").style.display = "none";
    document.getElementById("topicPage").style.display = "block";

}


// DISPLAY QUESTION

function displayQuestion() {

    selectedAnswer = null;
    answerChecked = false;

    const question = currentQuestions[currentQuestionIndex];

    document.getElementById("questionNumber").textContent =
        `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;

    document.getElementById("questionText").textContent =
        question.question;

    document.getElementById("progressFill").style.width =
        ((currentQuestionIndex + 1) / currentQuestions.length * 100) + "%";

    document.getElementById("feedback").innerHTML = "";

    document.getElementById("checkButton").style.display = "inline-block";
    document.getElementById("nextButton").style.display = "none";
    document.getElementById("nextButton").textContent = "Next Question →";

    let choicesHTML = "";

    question.choices.forEach(function(choice, index) {

        choicesHTML += `
            <button class="choice" onclick="selectAnswer(${index})">
                ${String.fromCharCode(65 + index)}. ${choice}
            </button>
        `;

    });

    document.getElementById("choicesContainer").innerHTML = choicesHTML;

}


// SELECT ANSWER

function selectAnswer(index) {

    if (answerChecked) return;

    selectedAnswer = index;

    const buttons = document.querySelectorAll(".choice");

    buttons.forEach(function(button, i) {
        button.classList.toggle("selected", i === index);
    });

}


// CHECK ANSWER

function checkAnswer() {

    if (selectedAnswer === null) {
        alert("Please select an answer first!");
        return;
    }

    const question = currentQuestions[currentQuestionIndex];

    answerChecked = true;

    const buttons = document.querySelectorAll(".choice");

    buttons.forEach(function(button, index) {

        button.disabled = true;

        if (index === question.answer) {
            button.classList.add("correct");
        } else if (index === selectedAnswer) {
            button.classList.add("incorrect");
        }

    });

    const isCorrect = selectedAnswer === question.answer;

if (isCorrect) {
    score++;
} else {

    mistakes.push({
        topic: currentQuizTopic,
        question: question.question,
        choices: question.choices,
        answer: question.answer,
        explanation: question.explanation,
        selectedAnswer: selectedAnswer,
        date: new Date().toISOString()
    });

    localStorage.setItem(
        "letReviewerMistakes",
        JSON.stringify(mistakes)
    );

}

    document.getElementById("feedback").innerHTML = `
        <strong style="color: ${isCorrect ? '#16A34A' : '#DC2626'}">
            ${isCorrect ? 'Correct!' : 'Incorrect!'}
        </strong>
        <p><strong>Explanation:</strong> ${question.explanation}</p>
    `;

    document.getElementById("checkButton").style.display = "none";
    document.getElementById("nextButton").style.display = "inline-block";

    if (currentQuestionIndex === currentQuestions.length - 1) {
        document.getElementById("nextButton").textContent = "View Results";
    }

}


// NEXT QUESTION

function nextQuestion() {

    if (currentQuestionIndex < currentQuestions.length - 1) {

        currentQuestionIndex++;
        displayQuestion();

    } else {

        showResults();

    }

}


// SHOW RESULTS

function showResults() {
// SAVE COMPLETED BATCH

if (currentBatchTopic && currentBatchNumber) {

   
if (!progress[currentBatchTopic]) {
    progress[currentBatchTopic] = {};
}
const previousResult =
    progress[currentBatchTopic][currentBatchNumber];

const attempts = previousResult?.attempts || [];

attempts.push({
    score: score,
    total: currentQuestions.length,
    completedAt: new Date().toISOString()
});

progress[currentBatchTopic][currentBatchNumber] = {
    score: score,
    total: currentQuestions.length,
    completed: true,
    completedAt: new Date().toISOString(),
    attempts: attempts
};



    localStorage.setItem(
        "letReviewerProgress",
        JSON.stringify(progress)
    );
updateDashboard();
}
    document.getElementById("questionNumber").textContent = "Quiz Completed!";

    document.getElementById("questionText").textContent =
        `You scored ${score} out of ${currentQuestions.length}!`;

    document.getElementById("choicesContainer").innerHTML = "";

    document.getElementById("feedback").innerHTML = `
        <h3>Great effort!</h3>
        <p>You answered ${score} question(s) correctly.</p>
        <p>Keep practicing to improve your score!</p>
    `;

    document.getElementById("checkButton").style.display = "none";
    document.getElementById("nextButton").style.display = "none";

    // DISPLAY REVIEW HISTORY

    
    // DISPLAY REVIEW HISTORY

    
}
function goToBatches() {
    document.getElementById("quizPage").style.display = "none";
    document.getElementById("batchPage").style.display = "block";

    showBatches(currentBatchTopic);
}


// LEARNER REGISTRATION

const registrationKey = "letReviewerProfile";


function loadLearnerProfile() {

    const profile = JSON.parse(
        localStorage.getItem(registrationKey)
    );

    const registrationPage =
        document.getElementById("registrationPage");

    const welcomeSection =
        document.querySelector(".welcome");

    const homePage =
        document.getElementById("homePage");

    if (profile) {

        registrationPage.style.display = "none";
        welcomeSection.style.display = "block";
        homePage.style.display = "grid";

        welcomeSection.querySelector("h2").textContent =
            `Welcome, ${profile.name}!`;

        document.getElementById("profileDisplay").textContent =
            `Name: ${profile.name} | Exam Date: ${profile.examDate} | Daily Goal: ${profile.dailyGoal} hour(s)`;

    } else {

        registrationPage.style.display = "block";
        welcomeSection.style.display = "none";
        homePage.style.display = "none";

    }
}

// SAVE NEW LEARNER PROFILE

document.getElementById("registrationForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const profile = {
            name: document.getElementById("learnerName").value.trim(),
            examDate: document.getElementById("examDate").value,
            dailyGoal: document.getElementById("dailyGoal").value
        };

        localStorage.setItem(
            registrationKey,
            JSON.stringify(profile)
        );

        loadLearnerProfile();

initializeStudyTimer();

alert("Your profile has been created successfully!");

    });

// CHECK REGISTRATION WHEN REVIEWER OPENS

loadLearnerProfile();

// EDIT LEARNER PROFILE

function editProfile() {

    const profile = JSON.parse(
        localStorage.getItem(registrationKey)
    );

    if (!profile) return;

    document.getElementById("registrationPage").style.display = "block";
    document.getElementById("homePage").style.display = "none";
    document.querySelector(".welcome").style.display = "none";

    document.getElementById("learnerName").value = profile.name;
    document.getElementById("learnerName").readOnly = true;

    document.getElementById("examDate").value = profile.examDate;
    document.getElementById("dailyGoal").value = profile.dailyGoal;

}
// START OVER - RESET REVIEW PROGRESS

function startOver() {

    const confirmReset = confirm(
        "Are you sure you want to start over? This will erase all your review progress, scores, mistakes, and review history. Your profile will remain saved."
    );

    if (!confirmReset) return;

    // Clear review progress
    progress = {};

    localStorage.removeItem("letReviewerProgress");

    // Clear saved mistakes
    mistakes = [];

    localStorage.removeItem("letReviewerMistakes");

    // Reset dashboard
    updateDashboard();

    // Return to homepage
    goHome();

    alert("Your review journey has been reset. Your profile is still saved!");
}

// ===================================
// DAILY STUDY COUNTDOWN TIMER
// ===================================

const studyTimerKey = "letReviewerStudyTimer";
let studyTimerInterval = null;
let studyTimerState = null;

// GET LEARNER'S DAILY STUDY GOAL
function getStudyGoal() {
    const profile = JSON.parse(
        localStorage.getItem(registrationKey)
    );

    return profile ? Number(profile.dailyGoal) : 0;
}

// SAVE TIMER STATE
function saveStudyTimer() {
    localStorage.setItem(
        studyTimerKey,
        JSON.stringify(studyTimerState)
    );
}

// FORMAT TIME
function formatStudyTime(milliseconds) {
    const totalSeconds = Math.ceil(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0")
    ].join(":");
}

// UPDATE TIMER DISPLAY
function updateStudyTimerDisplay() {

    const timerDisplay = document.getElementById("studyTimer");
    const timerStatus = document.getElementById("timerStatus");

    if (!studyTimerState || !timerDisplay) return;

    let remaining = studyTimerState.remainingMs;

    if (studyTimerState.isRunning) {
        remaining = Math.max(
            0,
            studyTimerState.endTime - Date.now()
        );
    }

    timerDisplay.textContent = formatStudyTime(remaining);

    if (studyTimerState.completed) {
        timerStatus.textContent =
            "Congratulations! You completed your daily study goal!";
    } else if (studyTimerState.isRunning) {
        timerStatus.textContent = "Keep going! Your study session is in progress.";
    } else if (remaining === 0) {
        timerStatus.textContent = "Your timer has ended. Reset to start again.";
    } else {
        timerStatus.textContent = "Ready to continue your daily study goal.";
    }
}

// INITIALIZE TIMER
function initializeStudyTimer() {

    if (studyTimerInterval) {
        clearInterval(studyTimerInterval);
        studyTimerInterval = null;
    }

    const goalHours = getStudyGoal();

    if (!goalHours) return;

    const savedTimer = JSON.parse(
        localStorage.getItem(studyTimerKey)
    );

    if (savedTimer && savedTimer.goalHours === goalHours) {

        studyTimerState = savedTimer;

        if (studyTimerState.isRunning) {

            studyTimerState.remainingMs = Math.max(
                0,
                studyTimerState.endTime - Date.now()
            );

            if (studyTimerState.remainingMs === 0) {
                studyTimerState.isRunning = false;
                studyTimerState.completed = true;
            }
        }

    } else {

        studyTimerState = {
            goalHours: goalHours,
            remainingMs: goalHours * 60 * 60 * 1000,
            endTime: null,
            isRunning: false,
            completed: false
        };
    }

    saveStudyTimer();
    updateStudyTimerDisplay();

    if (studyTimerState.isRunning) {
        studyTimerInterval = setInterval(updateStudyTimer, 1000);
    }
}

// START TIMER
function startStudyTimer() {

    if (!studyTimerState) {
        initializeStudyTimer();
    }

    if (!studyTimerState || studyTimerState.completed) return;

    if (studyTimerState.isRunning) return;

    if (studyTimerState.remainingMs <= 0) return;

    studyTimerState.isRunning = true;

    studyTimerState.endTime =
        Date.now() + studyTimerState.remainingMs;

    saveStudyTimer();

    updateStudyTimerDisplay();

    studyTimerInterval = setInterval(updateStudyTimer, 1000);
}

// COUNTDOWN
function updateStudyTimer() {

    if (!studyTimerState || !studyTimerState.isRunning) return;

    studyTimerState.remainingMs = Math.max(
        0,
        studyTimerState.endTime - Date.now()
    );

    if (studyTimerState.remainingMs === 0) {

        studyTimerState.isRunning = false;
        studyTimerState.completed = true;

        clearInterval(studyTimerInterval);
        studyTimerInterval = null;

        alert("Congratulations! You completed your daily study goal!");
    }

    saveStudyTimer();
    updateStudyTimerDisplay();
}

// PAUSE TIMER
function pauseStudyTimer() {

    if (!studyTimerState || !studyTimerState.isRunning) return;

    studyTimerState.remainingMs = Math.max(
        0,
        studyTimerState.endTime - Date.now()
    );

    studyTimerState.isRunning = false;
    studyTimerState.endTime = null;

    clearInterval(studyTimerInterval);
    studyTimerInterval = null;

    saveStudyTimer();
    updateStudyTimerDisplay();
}

// RESET TIMER
function resetStudyTimer() {

    const confirmReset = confirm(
        "Reset your daily study timer to its original goal?"
    );

    if (!confirmReset) return;

    const goalHours = getStudyGoal();

    if (!goalHours) return;

    if (studyTimerInterval) {
        clearInterval(studyTimerInterval);
        studyTimerInterval = null;
    }

    studyTimerState = {
        goalHours: goalHours,
        remainingMs: goalHours * 60 * 60 * 1000,
        endTime: null,
        isRunning: false,
        completed: false
    };

    saveStudyTimer();
    updateStudyTimerDisplay();
}

// LOAD TIMER
initializeStudyTimer();