// --- PASTE YOUR NEW API KEY HERE ---
const API_KEY = "AIzaSyA5zBDh3CUBPAESP3ez2EjOiK0RM27N7XY"; 

// --- INITIALIZATION ---
window.onload = () => {
    const savedUser = localStorage.getItem('bujjuUser');
    if (savedUser) {
        const userStatus = document.getElementById('user-status');
        const displayUsername = document.getElementById('display-username');
        if (userStatus) userStatus.innerText = `✅ ID Active: ${savedUser}`;
        if (displayUsername) displayUsername.innerText = savedUser;
    }
    renderHistory();
    renderFeed();
};

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- USER AUTHENTICATION ---
function saveUser() {
    const user = document.getElementById('user-name-input').value;
    if (!user) return alert("Please enter a username!");
    localStorage.setItem('bujjuUser', user);
    location.reload(); 
}

function resetUser() {
    if (confirm("Are you sure you want to reset your User ID? This will log you out.")) {
        localStorage.removeItem('bujjuUser');
        location.reload();
    }
}

// --- CORE AI COMMUNICATION ---
// --- CORE AI COMMUNICATION ---
// --- CORE AI COMMUNICATION ---
async function fetchFromAI(prompt, buttonId, originalBtnText) {
    const btn = document.getElementById(buttonId);
    btn.innerText = "Processing..."; 
    btn.disabled = true;

    try {
        // UPDATED ENDPOINT: Using gemini-1.5-flash which is the current standard
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await response.json();
        btn.innerText = originalBtnText; 
        btn.disabled = false;
        
        if(data.error) {
            console.error("Full API Error:", data.error);
            return `API Error: ${data.error.message}`;
        }
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Fetch Error:", error);
        btn.innerText = originalBtnText; 
        btn.disabled = false;
        return "Error: Connection lost or API key invalid.";
    }
}
// --- 1. AI RECIPE SYNTHESIS ---
async function generateAI() {
    const ingredients = document.getElementById('ai-ingredients').value;
    const output = document.getElementById('ai-output');
    if(!ingredients) return alert("Please enter some ingredients!");
    
    const prompt = `Act as a realistic master chef. Create a practical, delicious recipe using primarily these ingredients: ${ingredients}. Format the response clearly with a Title, Ingredients list, and Step-by-Step Instructions. Keep instructions grounded in reality.`;
    output.innerText = "Synthesizing recipe...";
    
    const result = await fetchFromAI(prompt, 'btn-generate', 'Synthesize');
    output.innerText = result;

    // Save to History
    let recipeHistory = JSON.parse(localStorage.getItem('bujjuHistory')) || [];
    recipeHistory.unshift({ ingredients: ingredients, recipe: result, date: new Date().toLocaleString() });
    localStorage.setItem('bujjuHistory', JSON.stringify(recipeHistory));
    renderHistory();

    // Reveal extra action buttons
    document.getElementById('btn-download').style.display = 'inline-flex';
    document.getElementById('btn-shop').style.display = 'inline-flex';
}

// --- 2. EXTRACTION & DOWNLOAD TOOLS ---
function downloadCurrentRecipe() {
    const content = document.getElementById('ai-output').innerText;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bujjus_Brews_Log_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function extractShoppingList() {
    const recipeText = document.getElementById('ai-output').innerText;
    const listDisplay = document.getElementById('shopping-list-display');
    const listContainer = document.getElementById('shopping-items');
    
    let ingredientsPart = recipeText;
    const lowerText = recipeText.toLowerCase();
    if (lowerText.includes("ingredients:") && lowerText.includes("instructions:")) {
        ingredientsPart = recipeText.substring(lowerText.indexOf("ingredients:") + 12, lowerText.indexOf("instructions:"));
    }

    const items = ingredientsPart.split('\n').filter(line => line.trim().length > 3);
    listContainer.innerHTML = '';
    
    items.forEach(item => {
        const li = document.createElement('li');
        li.style.padding = "8px 0";
        li.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        li.innerHTML = `<input type="checkbox" style="width: auto; margin-right: 10px;"> ${item.trim().replace(/^[-*•]/, '')}`;
        listContainer.appendChild(li);
    });

    listDisplay.style.display = 'block';
}

// --- 3. SYNTHESIS HISTORY ---
function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    let recipeHistory = JSON.parse(localStorage.getItem('bujjuHistory')) || [];
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
        `;
        historyList.appendChild(div);
    });
}

// --- 4. ALGORITHMIC SCALER ---
async function scaleRecipe() {
    const name = document.getElementById('recipe-name').value;
    const base = document.getElementById('base-servings').value;
    const baseIng = document.getElementById('base-ingredients').value;
    const target = document.getElementById('target-servings').value;
    const output = document.getElementById('scale-output');

    if(!name || !base || !baseIng || !target) return alert("Please fill out all fields!");

    const prompt = `Act as a precise culinary mathematician. I have a practical recipe called "${name}". The original recipe makes ${base} servings and uses these ingredients: ${baseIng}. I need to scale this to make ${target} servings. Calculate the new realistic ingredient amounts. Return ONLY the new list of ingredients and their exact scaled measurements.`;
    output.innerText = "Executing scaling algorithms...";
    output.innerText = await fetchFromAI(prompt, 'btn-scale', 'Execute Scaling');
}

// --- 5. COMMUNITY BROADCAST ---
let defaultPosts = [{
    title: "Classic Grape Wine Test", 
    author: "Bujju",
    desc: "My first batch! Fermenting nicely right now. Scaled up to 5 liters perfectly using the AI scaler.",
    date: new Date().toLocaleDateString()
}];

function postDish() {
    let posts = JSON.parse(localStorage.getItem('bujjuFeed')) || defaultPosts;
    const username = localStorage.getItem('bujjuUser') || "Guest";
    const title = document.getElementById('post-title').value;
    const desc = document.getElementById('post-desc').value;

    if(!title || !desc) return alert("Please fill out all transmission fields!");

    posts.unshift({ title, author: username, desc, date: new Date().toLocaleDateString() }); 
    localStorage.setItem('bujjuFeed', JSON.stringify(posts));
    
    document.getElementById('post-title').value = '';
    document.getElementById('post-desc').value = '';
    renderFeed();
}

function renderFeed() {
    const feed = document.getElementById('feed');
    if (!feed) return;
    
    let posts = JSON.parse(localStorage.getItem('bujjuFeed')) || defaultPosts;
    feed.innerHTML = ''; 
    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'feed-item';
        div.innerHTML = `<h3>${post.title}</h3><p><small>User_ID: <strong>${post.author}</strong> | Timestamp: ${post.date}</small></p><p>${post.desc}</p>`;
        feed.appendChild(div);
    });
}
