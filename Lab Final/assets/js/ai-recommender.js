// ============================================
// AI Food Recommender for Food Express
// Uses Groq API (Free - No Credit Card Needed)
// ============================================

const GROQ_API_KEY = 'YOUR_API_KEY_HERE';

const AI_MENU = [
  {name:'Chicken Biryani',cat:'Biryani',price:780,rating:4.8,desc:'Aromatic basmati rice with tender chicken and spices.'},
  {name:'Beef Biryani',cat:'Biryani',price:880,rating:4.7,desc:'Premium beef biryani cooked with aromatic herbs.'},
  {name:'Mutton Biryani',cat:'Biryani',price:980,rating:4.7,desc:'Slow cooked mutton with saffron rice.'},
  {name:'Sindhi Biryani',cat:'Biryani',price:760,rating:4.5,desc:'Spicy Sindhi-style rice layered with potatoes.'},
  {name:'Tikka Biryani',cat:'Biryani',price:820,rating:4.6,desc:'Smoky chicken tikka folded into masala rice.'},
  {name:'Veg Biryani',cat:'Biryani',price:620,rating:4.2,desc:'Garden vegetables and fragrant rice.'},
  {name:'Chicken Karahi',cat:'Karahi',price:780,rating:4.8,desc:'Classic karahi with fresh tomatoes and spices.'},
  {name:'Mutton Karahi',cat:'Karahi',price:980,rating:4.8,desc:'Rich mutton karahi with traditional spices.'},
  {name:'White Karahi',cat:'Karahi',price:920,rating:4.6,desc:'Creamy white karahi with green chilies.'},
  {name:'Boneless Handi',cat:'Karahi',price:850,rating:4.5,desc:'Boneless chicken in silky handi gravy.'},
  {name:'Peshawari Karahi',cat:'Karahi',price:1050,rating:4.7,desc:'Bold meat flavor with minimal spice.'},
  {name:'Paneer Karahi',cat:'Karahi',price:690,rating:4.3,desc:'Cottage cheese cubes in tomato masala.'},
  {name:'Chicken Tikka',cat:'BBQ',price:320,rating:4.6,desc:'Tender chicken tikka grilled over charcoal.'},
  {name:'Seekh Kebab',cat:'BBQ',price:290,rating:4.5,desc:'Juicy minced beef kebab with house spices.'},
  {name:'Malai Boti',cat:'BBQ',price:420,rating:4.7,desc:'Creamy marinated boneless chicken bites.'},
  {name:'Reshmi Kebab',cat:'BBQ',price:390,rating:4.5,desc:'Soft chicken kebab with mild spices.'},
  {name:'BBQ Platter',cat:'BBQ',price:1590,rating:4.9,desc:'Mix of tikka, kebab and boti.'},
  {name:'Fish Tikka',cat:'BBQ',price:680,rating:4.4,desc:'Spiced fish fillets grilled to order.'},
  {name:'Chicken Wings',cat:'BBQ',price:520,rating:4.5,desc:'Crispy wings with spicy sauce.'},
  {name:'Beef Burger',cat:'BBQ',price:650,rating:4.6,desc:'Juicy beef patty with cheese and vegetables.'},
  {name:'Chicken Burger',cat:'BBQ',price:480,rating:4.5,desc:'Grilled chicken burger with mayo.'},
  {name:'Margherita Pizza',cat:'Pizza',price:890,rating:4.5,desc:'Classic tomato mozzarella and basil.'},
  {name:'Chicken Fajita Pizza',cat:'Pizza',price:1150,rating:4.6,desc:'Fajita chicken peppers and mozzarella.'},
  {name:'Pepperoni Pizza',cat:'Pizza',price:1250,rating:4.7,desc:'Pepperoni cheese and tomato sauce.'},
  {name:'Cheese Lover Pizza',cat:'Pizza',price:990,rating:4.4,desc:'Extra mozzarella on hand-tossed crust.'},
  {name:'BBQ Ranch Pizza',cat:'Pizza',price:1290,rating:4.6,desc:'BBQ chicken ranch drizzle and onions.'},
  {name:'Garlic Bread',cat:'Pizza',price:360,rating:4.2,desc:'Toasted garlic bread with herbs.'},
  {name:'Pasta Alfredo',cat:'Pizza',price:750,rating:4.4,desc:'Creamy fettuccine pasta with parmesan.'},
  {name:'Fried Rice',cat:'Chinese',price:420,rating:4.4,desc:'Egg fried rice with vegetables and soy sauce.'},
  {name:'Chow Mein',cat:'Chinese',price:380,rating:4.3,desc:'Crispy noodles with stir-fried vegetables.'},
  {name:'Gulab Jamun',cat:'Desserts',price:180,rating:4.6,desc:'Warm gulab jamun in cardamom syrup.'},
  {name:'Kheer',cat:'Desserts',price:190,rating:4.4,desc:'Creamy traditional rice pudding.'},
  {name:'Chocolate Brownie',cat:'Desserts',price:360,rating:4.6,desc:'Dense brownie with chocolate sauce.'},
  {name:'Lava Cake',cat:'Desserts',price:480,rating:4.8,desc:'Molten chocolate cake served warm.'},
  {name:'Ras Malai',cat:'Desserts',price:280,rating:4.5,desc:'Soft milk dumplings with pistachio.'},
  {name:'Kulfi',cat:'Desserts',price:240,rating:4.3,desc:'Traditional frozen milk dessert.'},
  {name:'Mint Margarita',cat:'Drinks',price:250,rating:4.5,desc:'Fresh mint lemon and crushed ice.'},
  {name:'Mango Lassi',cat:'Drinks',price:280,rating:4.6,desc:'Thick yogurt drink with sweet mango.'},
  {name:'Soft Drink',cat:'Drinks',price:120,rating:4.2,desc:'Chilled carbonated beverage.'},
  {name:'Fresh Lime',cat:'Drinks',price:180,rating:4.3,desc:'Lemon soda with black salt.'},
  {name:'Cold Coffee',cat:'Drinks',price:320,rating:4.4,desc:'Creamy iced coffee with chocolate.'},
  {name:'Mineral Water',cat:'Drinks',price:90,rating:4.1,desc:'Chilled bottled water.'}
];

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  aiInitialize();
});

function aiInitialize() {

  // Mood chips click
  const moodsContainer = document.getElementById('ai-moods');
  if (moodsContainer) {
    moodsContainer.addEventListener('click', function (e) {
      const btn = e.target.closest('.ai-mc');
      if (!btn) return;
      document.querySelectorAll('.ai-mc').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const input = document.getElementById('ai-craving');
      if (input) input.value = 'I want ' + btn.dataset.m;
    });
  }

  // Budget slider label update
  const budgetSlider = document.getElementById('ai-bslider');
  if (budgetSlider) {
    budgetSlider.addEventListener('input', function () {
      const label = document.getElementById('ai-bshow');
      if (label) label.textContent = this.value;
    });
  }

  // Enter key triggers search
  const cravingInput = document.getElementById('ai-craving');
  if (cravingInput) {
    cravingInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') aiFind();
    });
  }

  // Auto show/hide float button based on current page
  aiCheckMenuPage();
  setInterval(aiCheckMenuPage, 500);
}

// ============================================
// SHOW / HIDE FLOAT BUTTON
// ============================================

function aiCheckMenuPage() {
  const floatBtn = document.getElementById('ai-float-wrap');
  if (!floatBtn) return;

  const params = new URLSearchParams(window.location.search);
  const currentPage = params.get('page') || 'home';

  floatBtn.style.display = (currentPage === 'menu') ? 'block' : 'none';
}

// ============================================
// OPEN / CLOSE PANEL
// ============================================

function aiOpen() {
  const panel = document.getElementById('ai-panel');
  if (panel) panel.style.display = 'block';
}

function aiClose() {
  const panel = document.getElementById('ai-panel');
  if (panel) panel.style.display = 'none';
}

// ============================================
// MAIN AI FIND FUNCTION - GROQ API
// ============================================

async function aiFind() {
  const cravingInput = document.getElementById('ai-craving');
  const budgetSlider = document.getElementById('ai-bslider');
  const categorySelect = document.getElementById('ai-cat');
  const resultsDiv = document.getElementById('ai-results');
  const findBtn = document.getElementById('ai-findbtn');

  if (!cravingInput || !budgetSlider || !resultsDiv || !findBtn) return;

  const craving = cravingInput.value.trim();
  const budget = parseInt(budgetSlider.value);
  const category = categorySelect ? categorySelect.value : '';

  // Validate craving input
  if (!craving) {
    cravingInput.focus();
    return;
  }

  // Disable button and show loading
  findBtn.disabled = true;
  resultsDiv.innerHTML =
    '<div style="color:#F39C12;font-size:12px;padding:12px 0;text-align:center">' +
    '✦ Finding best dishes for you...</div>';

  // Filter menu by budget and category
  let filtered = AI_MENU.filter(function (item) {
    return item.price <= budget;
  });

  if (category) {
    filtered = filtered.filter(function (item) {
      return item.cat === category;
    });
  }

  // Sort by rating highest first
  filtered.sort(function (a, b) {
    return b.rating - a.rating;
  });

  // No results after filtering
  if (!filtered.length) {
    resultsDiv.innerHTML =
      '<div style="color:#888;font-size:12px;padding:8px">' +
      'No dishes match your filters. Try increasing budget or selecting All categories.</div>';
    findBtn.disabled = false;
    return;
  }

  // Build menu list string for AI prompt
  const menuText = filtered.map(function (item) {
    return item.name + ' (' + item.cat + ', Rs ' + item.price +
      ', Rating ' + item.rating + '/5): ' + item.desc;
  }).join('\n');

  // Build AI prompt
  const prompt =
    'You are a food recommender for Food Express Pakistani restaurant. ' +
    'Customer craving: "' + craving + '". ' +
    'Max budget: Rs ' + budget + '. ' +
    (category ? 'Category filter: ' + category + '. ' : '') +
    'Menu items sorted by rating highest first:\n' + menuText +
    '\n\nPick exactly 3 best matching dishes prioritizing highest rated. ' +
    'Return ONLY a valid JSON array with no markdown, no extra text, no explanation:\n' +
    '[{"name":"exact dish name","reason":"one sentence why it matches the craving"},' +
    '{"name":"exact dish name","reason":"one sentence why it matches the craving"},' +
    '{"name":"exact dish name","reason":"one sentence why it matches the craving"}]';

  try {
    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error && errData.error.message ? errData.error.message : 'API request failed');
    }

    // Parse response
    const data = await response.json();
    let text = data.choices[0].message.content;

    // Clean any markdown code blocks from response
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse JSON
    const picks = JSON.parse(text);

    // Stars generator
    function starsHtml(rating) {
      return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    }

    // Build results HTML
    let html =
      '<div style="color:#555;font-size:10px;text-transform:uppercase;' +
      'letter-spacing:.06em;margin-bottom:8px">Top picks for you</div>';

    picks.forEach(function (pick, i) {
      // Match dish from menu
      const item =
        AI_MENU.find(function (m) {
          return m.name.toLowerCase() === pick.name.toLowerCase();
        }) ||
        AI_MENU.find(function (m) {
          return m.name.toLowerCase().includes(pick.name.toLowerCase().split(' ')[0]);
        });

      if (!item) return;

      html +=
        '<div class="ai-rcard ' + (i === 0 ? 'ai-best' : 'ai-other') + '">' +
        '<div class="ai-rnum ' + (i === 0 ? 'gold' : 'gray') + '">' +
        (i === 0 ? '★' : (i + 1)) +
        '</div>' +
        '<div style="flex:1">' +
        '<div class="ai-rname">' + item.name + '</div>' +
        '<div class="ai-rmeta">' +
        '<span class="ai-rcat">' + item.cat + '</span>' +
        '<span class="ai-rprice">Rs ' + item.price + '</span>' +
        '<span class="ai-rstars">' + starsHtml(item.rating) + ' ' + item.rating + '</span>' +
        '</div>' +
        '<div class="ai-rreason">' + pick.reason + '</div>' +
        '</div>' +
        '</div>';
    });

    // Show results or fallback
    if (html.includes('ai-rcard')) {
      resultsDiv.innerHTML = html;
    } else {
      resultsDiv.innerHTML =
        '<div style="color:#888;font-size:12px;padding:8px">' +
        'No matches found. Try a different craving or filters.</div>';
    }

  } catch (err) {
    console.error('AI Recommender Error:', err.message);
    resultsDiv.innerHTML =
      '<div style="color:#e74c3c;font-size:12px;padding:10px;' +
      'background:#2a0f0f;border-radius:8px;border:1px solid #5a1a1a">' +
      '❌ Could not get recommendations.<br>' +
      '<span style="color:#888;font-size:11px">Error: ' + err.message + '</span></div>';
  }

  // Re-enable button
  findBtn.disabled = false;
}