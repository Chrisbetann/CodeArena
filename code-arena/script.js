/*
Handles code execution by first checking if the user is logged in,
then sending the code to the Judge0 API for processing. It displays
the output or error after retrieving the result from the API.
*/


/*
Handles code execution — sends code to backend at http://localhost:3000
*/
async function executeCode() {
    const jwtToken = localStorage.getItem('token');
    if (!jwtToken) {
        alert("You must be logged in to run code.");
        window.location.href = 'login.html';
        return;
    }


    const code = document.getElementById("codeInput").value;
    const outputElement = document.getElementById("output");


    if (!code) {
        outputElement.innerText = "Error: No code entered!";
        return;
    }


    try {
        const response = await fetch("http://localhost:3000/api/questions", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });



        const data = await response.json();
        outputElement.innerText = data.output || "No output received.";
    } catch (error) {
        outputElement.innerText = `Execution failed: ${error.message}`;
    }
}


/*
Handles user login: sends email and password to the backend,
stores token and user info in localStorage, and redirects to the game screen.
*/
/*
async function loginUser() {
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;


   const response = await fetch("http://localhost:3000/api/auth/login", {
       method: "POST",
       headers: {
           "Content-Type": "application/json"
       },
       body: JSON.stringify({ email, password })
   });


   const data = await response.json();


   if (data.token) {
       localStorage.setItem('token', data.token);
       localStorage.setItem('user', JSON.stringify(data.user));
       window.location.href = 'game.html';
   } else if (data.error) {
       alert(data.error);
   }
}
*/


/*
Handles user registration: sends username, email, and password to the backend.
If successful, stores token + user info in localStorage and redirects to game.
*/
async function registerUser() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    });


    const data = await response.json();


    if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "game.html";
    } else if (data.error) {
        alert(data.error);
    }
}


/*
Handles logout functionality
*/
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}


/*
Loads questions from local questions.json
*/
let questions = [];
let currentQuestionIndex = 0;


/*
Loads questions from backend database
*/
async function loadQuestions() {
    checkLoginStatus();
    try {
        const response = await fetch("http://localhost:3000/api/questions", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });


        if (!response.ok) {
            throw new Error("Failed to fetch questions from backend.");
        }


        questions = await response.json();
        displayQuestion();
    } catch (error) {
        document.getElementById("question").innerText = "Failed to load questions.";
        console.error("Error loading questions from backend:", error);
    }
}




function displayQuestion() {
    if (questions.length === 0) {
        document.getElementById('question').innerText = "No questions available.";
        return;
    }
    const question = questions[currentQuestionIndex];
    document.getElementById('question').innerHTML = `
       <a href="${question.url}" target="_blank" style="color: gold; text-decoration: underline;">
           ${question.id}. ${question.title}
       </a>
   `;
}


function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    displayQuestion();
}


/*
Checks login status and updates welcome message with username
Only runs if on game.html to avoid blocking front page
*/
function checkLoginStatus() {
    const isGamePage = window.location.pathname.includes("game.html");
    if (!isGamePage) return;


    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));


    if (!token || !user) {
        window.location.href = "login.html";
    } else {
        const welcome = document.getElementById("welcomeMsg");
        const playerName = document.getElementById("playerName");


        if (welcome && user.username) {
            welcome.innerText = `Welcome back, ${user.username}!`;
        }


        if (playerName && user.username) {
            playerName.innerText = `🏹 ${user.username} the Bold`;
        }
    }
}


/*
Handles showing and hiding the leaderboard modal
*/
function showLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    if (modal) modal.style.display = 'flex';
}


function hideLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    if (modal) modal.style.display = 'none';
}


/*
Handles fake login (for testing without backend)
Only accepts a specific username and password
*/
function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    // ✅ Replace with your preferred fake credentials
    if (email === "yaire@example.com" && password === "12345") {
        const data = {
            token: "FAKE_TOKEN",
            user: {
                id: "12345",
                username: "yaire",
                email: email
            }
        };


        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "game.html";
    } else {
        alert("Invalid credentials. Try: yaire@example.com / 12345");
    }
}


/*
Runs once on game.html load — loads questions and activates buttons
*/
window.onload = () => {
    const isGamePage = window.location.pathname.includes("game.html");
    if (isGamePage) {
        loadQuestions();


        // ⚔️ Handle language button clicks (banner-style buttons)
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                const languageId = button.dataset.id;
                localStorage.setItem('selectedLanguageId', languageId);


                // Optional: highlight selected button
                langButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });


        // Optional: set preselected language
        const storedLang = localStorage.getItem('selectedLanguageId');
        if (storedLang && document.getElementById('language')) {
            document.getElementById('language').value = storedLang;
        }


        // ✅ Avatar changes based on selected difficulty
        const avatarImg = document.getElementById("avatarImg");
        const difficulty = localStorage.getItem("difficulty");
        if (avatarImg && difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
            avatarImg.src = `avatar_${difficulty}.png`;
        }


        /*
        Leaderboard modal open/close logic using safer event listeners
        */
        const leaderboardBtn = document.getElementById("leaderboardBtn");
        const leaderboardModal = document.getElementById("leaderboardModal");
        const closeBtn = document.getElementById("closeLeaderboard");


        if (leaderboardBtn && leaderboardModal && closeBtn) {
            leaderboardBtn.addEventListener("click", () => {
                leaderboardModal.style.display = "flex";
            });


            closeBtn.addEventListener("click", () => {
                leaderboardModal.style.display = "none";
            });


            window.addEventListener("click", (e) => {
                if (e.target === leaderboardModal) {
                    leaderboardModal.style.display = "none";
                }
            });
        }
    }
};



