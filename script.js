const emojiMap = { "morango": "🍓", "cereja": "🍒", "maca": "🍎", "tomate": "🍅", "pimenta": "🌶️", "melancia": "🍉", "pessego": "🍑", "laranja": "🍊", "cenoura": "🥕", "manga": "🥭", "abacaxi": "🍍", "banana": "🍌", "milho": "🌽", "limao": "🍋", "melao": "🍈", "pera": "🍐", "ervilha": "🫛", "alface": "🥬", "pimentao": "🫑", "quiwi": "🥝", "abacate": "🥑", "azeitona": "🫒", "brocolis": "🥦", "pepino": "🥒", "mirtilo": "🫐", "uva": "🍇", "berinjela": "🍆", "batata": "🥔", "cogumelo": "🍄", "cebola": "🧅", "alho": "🧄", "feijao": "🫘", "castanha": "🌰", "amendoim": "🥜", "pao": "🍞", "croissant": "🥐", "baguete": "🥖", "bagel": "🥯", "waffle": "🧇", "panqueca": "🥞", "ovo": "🥚", "queijo": "🧀", "bacon": "🥓", "carne": "🥩", "frango": "🍗", "hamburguer": "🍔", "cachorro quente": "🌭", "sanduiche": "🥪", "pizza": "🍕", "taco": "🌮", "burrito": "🌯", "macarrao": "🍝", "sopa": "🥣", "arroz": "🍛", "sushi": "🍣", "camarao": "🍤", "peixe": "🐟", "bolo": "🎂", "chocolate": "🍫", "doce": "🍬", "biscoito": "🍪", "mel": "🍯", "pipoca": "🍿", "leite": "🥛", "cafe": "☕", "cerveja": "🍺", "vinho": "🍷", "detergente": "🧼", "sabao": "🧽", "papel": "🧻", "shampoo": "🧴", "escova": "🪥", "sabonete": "🧼", "coca": "🥤", "suco": "🧃" };

let items = JSON.parse(localStorage.getItem("items")) || [];
let favs = JSON.parse(localStorage.getItem("favs")) || [];
let priceHistory = JSON.parse(localStorage.getItem("priceHistory")) || {};
let priceIndex = null;

function getEmoji(name) { 
    if (!name) return "🛍️"; 
    const text = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); 
    return emojiMap[text] || "🛍️"; 
}

function add(name) { 
    const input = document.getElementById("input");
    const text = name || input.value; 
    if(!text) return; 
    items.push({name: text, icon: getEmoji(text), qty: 1, price: priceHistory[text.toLowerCase()] || 0, bought: false}); 
    save(); render(); input.value = ""; 
}

function render() { 
    const list = document.getElementById("list"); 
    list.innerHTML = "<h3>Sua Lista</h3>"; 
    items.forEach((i, idx) => { 
        list.innerHTML += `<div class="item ${i.bought ? 'done' : ''}"><div class="info"><div class="name"><span class="star" onclick="toggleFav('${i.name}')">${favs.includes(i.name) ? '★' : '☆'}</span>${i.icon} ${i.name}</div><div class="priceArea">R$ <input class="priceInput" type="number" value="${i.price.toFixed(2)}" onclick="openPrice(${idx})" readonly><span>x ${i.qty}</span></div></div><div class="controls"><button class="btn-small" onclick="changeQty(${idx}, -1)">-</button><button class="btn-small" onclick="changeQty(${idx}, 1)">+</button><button class="doneBtn" onclick="toggleDone(${idx})">✔</button><button class="del" onclick="remove(${idx})">X</button></div></div>`; 
    }); 
    renderFavs(); calc(); 
}

function renderFavs() { 
    const container = document.getElementById("favList"); 
    if (!container) return;
    container.innerHTML = ""; 
    favs.forEach(f => { container.innerHTML += `<div class="fav-chip" onclick="add('${f}')">${f}</div>`; }); 
}

function show(cat) { 
    const db = { Limpeza: ["Detergente", "Sabao", "Papel"], Frutas: ["Banana", "Maca", "Melao", "Uva"], Carnes: ["Peixe", "Frango", "Carne"], Padaria: ["Pao", "Bolo"], Bebidas: ["Coca", "Suco", "Cafe"], Higiene: ["Shampoo", "Sabonete", "Escova"] };
    const list = document.getElementById("list"); 
    list.innerHTML = `<h3>${cat}</h3>`; 
    db[cat].forEach(p => { list.innerHTML += `<div class="item" onclick="add('${p}')" style="cursor:pointer;">➕ ${getEmoji(p)} ${p}</div>`; }); 
}

function toggleFav(name) { favs.includes(name) ? favs = favs.filter(f => f !== name) : favs.push(name); save(); render(); }
function toggleDone(i) { items[i].bought = !items[i].bought; save(); render(); }
function remove(i) { items.splice(i, 1); save(); render(); }
function changeQty(i, delta) { items[i].qty = Math.max(1, items[i].qty + delta); save(); render(); }

function openPrice(i) { 
    priceIndex = i; 
    document.querySelector(".modalBox h3").innerHTML = "💰 Alterar Preço";
    document.getElementById("priceInput").value = items[i].price.toFixed(2); 
    document.getElementById("modal").style.display = "flex"; 
    setTimeout(() => { document.getElementById("priceInput").focus(); document.getElementById("priceInput").select(); }, 100);
}

function savePrice() { 
    const newPrice = parseFloat(document.getElementById("priceInput").value) || 0; 
    items[priceIndex].price = newPrice; 
    priceHistory[items[priceIndex].name.toLowerCase()] = newPrice; 
    document.getElementById("modal").style.display = "none"; 
    save(); render(); 
}

function calc() { 
    let t = items.reduce((sum, i) => i.bought ? sum : sum + (i.price * i.qty), 0); 
    const totalElement = document.getElementById("total");
    const budget = parseFloat(document.getElementById("budget").value) || 0;
    totalElement.innerText = t.toFixed(2); 
    
    if (budget > 0 && t > budget) {
        totalElement.style.color = "red";
    } else {
        totalElement.style.color = "#22c55e";
    }
}

function shareWhatsApp() { 
    let msg = "🛒 Minha Lista:\n"; 
    items.forEach(i => { 
        msg += `${i.icon} ${i.qty}x ${i.name} - R$ ${(i.price*i.qty).toFixed(2)}\n`; 
    }); 
    msg += `\nTotal: R$ ${document.getElementById('total').innerText}`; 
    
    // Forçamos o uso de intent para garantir que o Android abra o app do WhatsApp
    const url = "intent://send?text=" + encodeURIComponent(msg) + "#Intent;scheme=smsto;package=com.whatsapp;end";
    location.href = url; 
}

function save() { localStorage.setItem("items", JSON.stringify(items)); localStorage.setItem("favs", JSON.stringify(favs)); localStorage.setItem("priceHistory", JSON.stringify(priceHistory)); }
function clearAll() { items = []; save(); render(); }

render();
