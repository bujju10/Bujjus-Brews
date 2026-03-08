const API_KEY = "AIzaSyDAEvOygDRjBKem_l2QVLUTLA4aDgdsAe4"; 

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

async function generateAI() {
    const ingredients = document.getElementById('ai-ingredients').value;
    const output = document.getElementById('ai-output');
    if(!ingredients) return alert("Enter ingredients!");
    const prompt = `Create a recipe for these ingredients: ${ingredients}. Format with Title, Ingredients, and Steps.`;
    output.innerText = await fetchFromAI(prompt, 'btn-generate', 'Synthesize');
}

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

