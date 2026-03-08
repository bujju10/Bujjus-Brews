const API_KEY = "PASTE_YOUR_NEW_KEY_HERE"; 

window.onload = () => {
    const savedUser = localStorage.getItem('bujjuUser');
    if (savedUser) {
        document.getElementById('user-status').innerText = `✅ ID Active: ${savedUser}`;
        document.getElementById('display-username').innerText = savedUser;
    }
    renderFeed();
};

function saveUser() {
    const user = document.getElementById('user-name-input').value;
    if (!user) return alert("Please enter a username!");
    localStorage.setItem('bujjuUser', user);
    document.getElementById('user-status').innerText = `✅ ID Active: ${user}`;
    document.getElementById('display-username').innerText = user;
    alert(`Account initialized for ${user}!`);
}
function resetUser() {
    if (confirm("Are you sure you want to reset your User ID? This will log you out.")) {
        localStorage.removeItem('bujjuUser');
        document.getElementById('user-status').innerText = "ID Reset. Please re-initialize.";
        document.getElementById('display-username').innerText = "Guest";
        document.getElementById('user-name-input').value = "";
        alert("User ID has been cleared.");
    }
}
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- AI Logic ---
async function fetchFromAI(prompt, buttonId, originalBtnText) {
    const btn = document.getElementById(buttonId);
    btn.innerText = "Processing..."; btn.disabled = true;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        btn.innerText = originalBtnText; btn.disabled = false;
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        btn.innerText = originalBtnText; btn.disabled = false;
        return "Critical Error: Key may be leaked or connection lost.";
    }
}

// Add to the top of app.js
let recipeHistory = JSON.parse(localStorage.getItem('bujjuHistory')) || [];

// Update your generateAI function
async function generateAI() {
    const ingredients = document.getElementById('ai-ingredients').value;
    const output = document.getElementById('ai-output');
    if(!ingredients) return alert("Enter ingredients!");
    
    const prompt = `Create a recipe for these ingredients: ${ingredients}. Format with Title, Ingredients, and Steps.`;
    output.innerText = "Synthesizing...";
    
    const result = await fetchFromAI(prompt, 'btn-generate', 'Synthesize');
    output.innerText = result;

    // --- SAVE TO HISTORY ---
    const newEntry = {
        ingredients: ingredients,
        recipe: result,
        date: new Date().toLocaleString()
    };
    recipeHistory.unshift(newEntry);
    localStorage.setItem('bujjuHistory', JSON.stringify(recipeHistory));
    renderHistory();
}

// Function to display the history
function renderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (recipeHistory.length === 0) {
        historyList.innerHTML = '<p class="terminal-text">No synthesis history found.</p>';
        return;
    }

    recipeHistory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <h3 style="color: var(--accent-gold);">Log #${recipeHistory.length - index}</h3>
            <p><small>Ingredients: ${item.ingredients}</small></p>
            <div class="terminal-text" style="font-size: 0.9rem; margin-top: 10px;">${item.recipe.substring(0, 100)}...</div>
            <button class="btn-glow btn-gold" style="padding: 5px 10px; font-size: 0.7rem; margin-top: 10px;" onclick="viewHistoryItem(${index})">View Full Log</button>
        `;
        historyList.appendChild(div);
    });
}

function viewHistoryItem(index) {
    const item = recipeHistory[index];
    alert(`RECIPE LOG:\n\n${item.recipe}`);
}

// Ensure history renders on load
const originalOnload = window.onload;
window.onload = () => {
    originalOnload();
    renderHistory();
};

async function scaleRecipe() {
    const name = document.getElementById('recipe-name').value;
    const base = document.getElementById('base-servings').value;
    const baseIng = document.getElementById('base-ingredients').value;
    const target = document.getElementById('target-servings').value;
    const output = document.getElementById('scale-output');
    const prompt = `Scale recipe "${name}" from ${base} to ${target} servings. Ingredients: ${baseIng}. Return only scaled list.`;
    output.innerText = await fetchFromAI(prompt, 'btn-scale', 'Execute Scaling');
}

// --- Community Logic ---
let posts = JSON.parse(localStorage.getItem('bujjuFeed')) || [];

function postDish() {
    const username = localStorage.getItem('bujjuUser') || "Guest";
    const title = document.getElementById('post-title').value;
    const desc = document.getElementById('post-desc').value;

    if(!title || !desc) return alert("Fill out all fields!");

    posts.unshift({ title, author: username, desc, date: new Date().toLocaleDateString() }); 
    localStorage.setItem('bujjuFeed', JSON.stringify(posts));
    
    document.getElementById('post-title').value = '';
    document.getElementById('post-desc').value = '';
    renderFeed();
}

function renderFeed() {
    const feed = document.getElementById('feed');
    feed.innerHTML = ''; 
    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'feed-item';
        div.innerHTML = `<h3>${post.title}</h3><p><small>User_ID: <strong>${post.author}</strong> | Timestamp: ${post.date}</small></p><p>${post.desc}</p>`;
        feed.appendChild(div);
    });
}


