const API_KEY = "YOUR_NEW_API_KEY_HERE"; 

window.onload = () => {
    const savedUser = localStorage.getItem('bujjuUser');
    if (savedUser) {
        document.getElementById('user-status').innerText = `✅ ID Active: ${savedUser}`;
        document.getElementById('display-username').innerText = savedUser;
    }
    renderHistory();
    renderFeed();
};

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- AUTH ---
function saveUser() {
    const user = document.getElementById('user-name-input').value;
    if (!user) return alert("Enter a username!");
    localStorage.setItem('bujjuUser', user);
    location.reload();
}

function resetUser() {
    if(confirm("Reset User ID?")) { localStorage.removeItem('bujjuUser'); location.reload(); }
}

// --- AI CORE ---
async function fetchFromAI(prompt, btnId, originalText) {
    const btn = document.getElementById(btnId);
    btn.innerText = "Processing..."; btn.disabled = true;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        btn.innerText = originalText; btn.disabled = false;
        return data.candidates[0].content.parts[0].text;
    } catch (e) { 
        btn.innerText = originalText; btn.disabled = false;
        return "System Error: Key leaked or connection failed.";
    }
}

async function generateAI() {
    const ing = document.getElementById('ai-ingredients').value;
    const output = document.getElementById('ai-output');
    if(!ing) return alert("Input ingredients!");
    const prompt = `Create a recipe for: ${ing}. Format with Title, Ingredients, and Steps.`;
    const res = await fetchFromAI(prompt, 'btn-generate', 'Synthesize');
    output.innerText = res;
    
    // Save to History
    let hist = JSON.parse(localStorage.getItem('bujjuHistory')) || [];
    hist.unshift({ recipe: res, date: new Date().toLocaleString() });
    localStorage.setItem('bujjuHistory', JSON.stringify(hist));
    
    document.getElementById('btn-download').style.display = 'inline-flex';
    document.getElementById('btn-shop').style.display = 'inline-flex';
    renderHistory();
}

// --- UTILITIES ---
function downloadCurrentRecipe() {
    const blob = new Blob([document.getElementById('ai-output').innerText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Recipe_Log_${Date.now()}.txt`;
    a.click();
}

function extractShoppingList() {
    const text = document.getElementById('ai-output').innerText;
    const items = text.split('\n').filter(l => l.includes('-') || l.includes('*'));
    const list = document.getElementById('shopping-items');
    list.innerHTML = items.map(i => `<li><input type="checkbox"> ${i}</li>`).join('');
    document.getElementById('shopping-list-display').style.display = 'block';
}

function renderHistory() {
    const list = document.getElementById('history-list');
    const hist = JSON.parse(localStorage.getItem('bujjuHistory')) || [];
    list.innerHTML = hist.map(h => `<div class="glass-card"><strong>${h.date}</strong><p>${h.recipe.substring(0,100)}...</p></div>`).join('');
}
