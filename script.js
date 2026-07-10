  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const resultsDiv = document.getElementById('results');
  const statusEl = document.getElementById('status');
  const emptyState = document.getElementById('emptyState');
  const overlay = document.getElementById('overlay');
  const themeToggle = document.getElementById('themeToggle');
  const themeKnob = document.getElementById('themeKnob');

  // ---------- Theme ----------
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');

  themeToggle.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  function setTheme(mode){
    document.body.setAttribute('data-theme', mode);
    themeKnob.innerHTML = mode === 'dark' ? '&#9789;' : '&#9728;';
  }

  // ---------- Search ----------
  searchBtn.addEventListener('click', () => searchRecipe(searchInput.value));
  searchInput.addEventListener('keydown', e => { if(e.key === 'Enter') searchRecipe(searchInput.value); });

  document.querySelectorAll('.chip[data-query]').forEach(chip => {
    chip.addEventListener('click', () => {
      searchInput.value = chip.dataset.query;
      searchRecipe(chip.dataset.query);
    });
  });

  document.getElementById('surpriseChip').addEventListener('click', fetchRandom);

  async function searchRecipe(query){
    query = (query || '').trim();
    if(!query) return;
    showLoading(true);
    try{
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
      const data = await response.json();
      renderResults(data.meals);
    }catch(err){
      renderResults(null, true);
    }finally{
      showLoading(false);
    }
  }

  async function fetchRandom(){
    showLoading(true);
    try{
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await response.json();
      renderResults(data.meals);
    }catch(err){
      renderResults(null, true);
    }finally{
      showLoading(false);
    }
  }

  function showLoading(isLoading){
    statusEl.classList.toggle('show', isLoading);
    searchBtn.disabled = isLoading;
    if(isLoading) emptyState.classList.remove('show');
  }

  function renderResults(meals, failed){
    resultsDiv.innerHTML = '';
    if(failed){
      emptyState.classList.add('show');
      emptyState.querySelector('.empty-title').textContent = 'Couldn\u2019t reach the recipe database';
      emptyState.querySelector('.empty-sub').textContent = 'Check your connection and try searching again.';
      return;
    }
    if(!meals){
      emptyState.classList.add('show');
      emptyState.querySelector('.empty-title').textContent = 'No recipes found';
      emptyState.querySelector('.empty-sub').textContent = 'Try a different dish name or ingredient — or tap “Surprise me.”';
      return;
    }
    emptyState.classList.remove('show');
    meals.forEach(meal => resultsDiv.appendChild(buildCard(meal)));
  }

  function buildCard(meal){
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.innerHTML = `
      <div class="thumb-wrap">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
        <span class="category-tag">${meal.strCategory || 'Recipe'}</span>
      </div>
      <div class="card-body">
        <h2>${meal.strMeal}</h2>
        <div class="card-meta">
          ${meal.strArea ? `<span class="meta-pill">${meal.strArea}</span>` : ''}
        </div>
        <p class="excerpt">${(meal.strInstructions || '').slice(0, 140)}…</p>
        <span class="view-link">View full recipe &#8594;</span>
      </div>
    `;
    const open = () => openModal(meal);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } });
    return card;
  }

  // ---------- Modal ----------
  function openModal(meal){
    document.getElementById('modalImg').src = meal.strMealThumb;
    document.getElementById('modalImg').alt = meal.strMeal;
    document.getElementById('modalTitle').textContent = meal.strMeal;

    const metaEl = document.getElementById('modalMeta');
    metaEl.innerHTML = '';
    [meal.strCategory, meal.strArea].filter(Boolean).forEach(m => {
      const pill = document.createElement('span');
      pill.className = 'meta-pill';
      pill.textContent = m;
      metaEl.appendChild(pill);
    });

    const ingredientsEl = document.getElementById('modalIngredients');
    ingredientsEl.innerHTML = '';
    for(let i = 1; i <= 20; i++){
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if(ing && ing.trim()){
        const li = document.createElement('li');
        li.textContent = `${measure ? measure.trim() + ' ' : ''}${ing.trim()}`;
        ingredientsEl.appendChild(li);
      }
    }

    document.getElementById('modalInstructions').textContent = meal.strInstructions || 'No instructions available.';
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  document.getElementById('modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });
