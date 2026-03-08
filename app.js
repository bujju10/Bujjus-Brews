// Load the app and check for a saved API key
window.onload = () => {
    const savedKey = localStorage.getItem('bujjuApiKey');
    if (savedKey) {
        document.getElementById('api-key').value = savedKey;
        document.getElementById('key-status').innerText = "✅ Saved";
    }
    renderFeed();
};

// Handle navigating between the four pages
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Securely save the API key to the browser
function saveApiKey() {
    const key = document.getElementById('api-key').value;
    localStorage.setItem('bujjuApiKey', key);
    document.getElementById('key-status').innerText = "✅ Saved";
}

// Helper function to talk to Gemini AI
async function fetchFromAI(prompt, buttonId, originalBtnText) {
    const apiKey = localStorage.getItem('bujjuApiKey');
    if (!apiKey) return alert("Please save your new Gemini API key on the Home page first!");

    const btn = document.getElementById(buttonId);
    btn.innerText = "Thinking..."; 
    btn.disabled = true;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        btn.innerText = originalBtnText; 
        btn.disabled = false;
        
        if(data.error) {
            return `API Error: ${data.error.message}`;
        }
        
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error(error);
        btn.innerText = originalBtnText; 
        btn.disabled = false;
        return "Error connecting to AI. Please check your API key.";
    }
}

// Feature 1: AI Recipe Generator
async function generateAI() {
    const ingredients = document.getElementById('ai-ingredients').value;
    const output = document.getElementById('ai-output');
    if(!ingredients) return alert("Please enter some ingredients!");
    
    const prompt = `Act as a master chef. Create a simple, delicious recipe using primarily these ingredients: ${ingredients}. Format the response clearly with a Title, Ingredients list, and Step-by-Step Instructions.`;
    output.innerText = "Generating recipe...";
    output.innerText = await fetchFromAI(prompt, 'btn-generate', 'Generate Recipe');
}

// Feature 2: Store & Scale Measurements
async function scaleRecipe() {
    const name = document.getElementById('recipe-name').value;
    const base = document.getElementById('base-servings').value;
    const baseIng = document.getElementById('base-ingredients').value;
    const target = document.getElementById('target-servings').value;
    const output = document.getElementById('scale-output');

    if(!name || !base || !baseIng || !target) return alert("Please fill out all fields!");

    const prompt = `Act as a precise culinary mathematician. I have a recipe called "${name}". The original recipe makes ${base} servings and uses these ingredients: ${baseIng}. I need to scale this to make ${target} servings. Calculate the new ingredient amounts. Return ONLY the new list of ingredients and their exact scaled measurements.`;
    output.innerText = "Scaling ingredients...";
    output.innerText = await fetchFromAI(prompt, 'btn-scale', 'Scale with AI');
}

// Feature 3: Post Dishes (Community Feed stored locally)
let defaultPosts = [{
    title: "Classic Grape Wine", 
    author: "Bujju",
    desc: "My first batch! Fermenting nicely right now. Scaled up to 5 liters perfectly using the AI scaler.",
    date: new Date().toLocaleDateString()
}];

let posts = JSON.parse(localStorage.getItem('bujjuFeed')) || defaultPosts;

function postDish() {
    const title = document.getElementById('post-title').value;
    const author = document.getElementById('post-author').value;
    const desc = document.getElementById('post-desc').value;

    if(!title || !author || !desc) return alert("Please fill out all fields!");

    posts.unshift({ title, author, desc, date: new Date().toLocaleDateString() }); 
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
        div.innerHTML = `<h3>${post.title}</h3><p><small>By <strong>${post.author}</strong> on ${post.date}</small></p><p>${post.desc}</p>`;
        feed.appendChild(div);
    });
}
