const searchInput   = document.getElementById('searchInput');
const searchBtn     = document.getElementById('searchBtn');
const resultsDiv    = document.getElementById('results');
const statusEl      = document.getElementById('status');
const emptyState    = document.getElementById('emptyState');
const overlay       = document.getElementById('overlay');
const themeToggle   = document.getElementById('themeToggle');
const themeKnob     = document.getElementById('themeKnob');

const SPOONACULAR_API_KEY = 'c8f91f8574e840babad90886bd9548e8'; 

// -------------------------------------------------
//  ★  THEME
// -------------------------------------------------
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(prefersDark ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
  const cur = document.body.getAttribute('data-theme');
  setTheme(cur === 'dark' ? 'light' : 'dark');
});

function setTheme(mode){
  document.body.setAttribute('data-theme', mode);
  themeKnob.innerHTML = mode === 'dark' ? '&#9789;' : '&#9728;';
}

// -------------------------------------------------
//  ★  UTILITIES
// -------------------------------------------------
const stripHtml = (s) => s ? s.replace(/<[^>]*>/g, '').trim() : '';

/* Map Spoonacular's recipe object to the format used throughout the app */
function mapSpoonacularToMeal(recipe){
  const meal = {};

  // Core fields
  meal.strMeal       = recipe.title        || '';
  meal.strMealThumb  = recipe.image        || '';
  meal.strCategory   = (recipe.dishTypes && recipe.dishTypes[0]) || '';
  meal.strArea       = (recipe.cuisines && recipe.cuisines[0]) || '';

  // ----------- INSTRUCTIONS ----------
  let instructions = '';

  // 1️⃣  primary – ready‑made instructions string
  if (recipe.instructions && typeof recipe.instructions === 'string'){
    instructions = stripHtml(recipe.instructions);
  }
  // 2️⃣  secondary – structured “analyzedInstructions”
  else if (Array.isArray(recipe.analyzedInstructions)){
    const steps = [];
    for (const set of recipe.analyzedInstructions){
      if (Array.isArray(set.steps)){
        for (const step of set.steps){
          if (step.step) steps.push(stripHtml(step.step));
        }
      }
    }
    if (steps.length) instructions = steps.join('\n\n');
  }
  // 3️⃣  tertiary – any textual description fields
  else if (recipe.summary)      instructions = stripHtml(recipe.summary);
  else if (recipe.description)  instructions = stripHtml(recipe.description);
  else if (recipe.directions)   instructions = stripHtml(recipe.directions);
  else if (recipe.notes)        instructions = stripHtml(recipe.notes);

  // 4️⃣  Indian‑cuisine fallback when nothing was found
  const isIndian = (recipe.cuisines && recipe.cuisines.some(c=>c.toLowerCase()==='indian')) ||
                   /biryani|tikka|curry|naan|dal|paneer|masala/i.test(recipe.title||'');
  if (!instructions && isIndian){
    instructions = 'Traditional Indian recipe – detailed steps may be limited. Please refer to the full source for preparation instructions.';
  }

  meal.strInstructions = instructions || 'No instructions available.';

  // ----------- INGREDIENTS ----------
  for (let i=1;i<=20;i++){
    meal[`strIngredient${i}`] = '';
    meal[`strMeasure${i}`]    = '';
  }
  if (Array.isArray(recipe.extendedIngredients)){
    recipe.extendedIngredients.slice(0,20).forEach((ing,idx)=>{
      const n = idx+1;
      meal[`strIngredient${n}`] = ing.name || '';
      const amt = ing.amount!==null ? ing.amount : '';
      const unit = ing.unit ? ing.unit : '';
      meal[`strMeasure${n}`] = `${amt} ${unit}`.trim();
    });
  }

  return meal;
}

/* Map TheMealDB’s recipe object to the same internal shape */
function mapMealDBToMeal(meal){
  const result = {};
  result.strMeal       = meal.strMeal       || '';
  result.strMealThumb  = meal.strMealThumb  || '';
  result.strCategory   = meal.strCategory   || '';
  result.strArea       = meal.strArea       || '';
  result.strInstructions = stripHtml(meal.strInstructions || '');

  // Ingredients & measures are already numbered in TheMealDB
  for (let i=1;i<=20;i++){
    result[`strIngredient${i}`] = meal[`strIngredient${i}`] || '';
    result[`strMeasure${i}`]    = meal[`strMeasure${i}`]    || '';
  }
  return result;
}

/* -------------------------------------------------
   ★  FALLBACK TO THEMEALDB (search)
   ------------------------------------------------- */
async function fallbackMealDB(query){
  try{
    const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    const d = await r.json();
    if (d.meals) return d.meals.map(mapMealDBToMeal);
    return [];
  }catch(e){
    console.warn('TheMealDB fallback error (search):',e);
    return [];
  }
}

/* -------------------------------------------------
   ★  FALLBACK TO THEMEALDB (random)
   ------------------------------------------------- */
async function fallbackMealDBRandom(){
  try{
    const r = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const d = await r.json();
    if (d.meals) return d.meals.map(mapMealDBToMeal);
    return [];
  }catch(e){
    console.warn('TheMealDB fallback error (random):',e);
    return [];
  }
}

/* -------------------------------------------------
   ★  SEARCH RECIPE (primary = Spoonacular)
   ------------------------------------------------- */
async function searchRecipe(query){
  query = (query||'').trim();
  if (!query) return;
  showLoading(true);

  try{
    // ---- Spoonacular primary request ----
    const rsp = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}`+
      `&query=${encodeURIComponent(query)}&number=10&addRecipeInformation=true&fillIngredients=true`
    );
    const data = await rsp.json();
    console.log('Spoonacular search result →', data);

    // Transform results
    let meals = data.results ? data.results.map(mapSpoonacularToMeal) : [];

    // If we got *zero* meals, fall back immediately
    if (!meals.length){
      console.log('No Spoonacular results – falling back to TheMealDB');
      meals = await fallbackMealDB(query);
      renderResults(meals);
      return;
    }

    // Some Spoonacular entries may have empty instructions → fetch full info
    const enrichPromises = meals.map(async (meal, idx) => {
      const src = data.results[idx];
      if (!src.instructions){
        try{
          const infoRsp = await fetch(
            `https://api.spoonacular.com/recipes/${src.id}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=false`
          );
          const info = await infoRsp.json();
          return mapSpoonacularToMeal(info);
        }catch(e){
          console.warn('Detail fetch failed for', src.title, e);
          return meal;
        }
      }
      return meal;
    });

    meals = await Promise.all(enrichPromises);
    renderResults(meals);
  }catch(err){
    // Any network or API error → use TheMealDB as fallback
    console.error('Spoonacular error →', err);
    const meals = await fallbackMealDB(query);
    renderResults(meals);
  }finally{
    showLoading(false);
  }
}

/* -------------------------------------------------
   ★  RANDOM RECIPE (primary = Spoonacular)
   ------------------------------------------------- */
async function fetchRandom(){
  showLoading(true);
  try{
    const rsp = await fetch(
      `https://api.spoonacular.com/recipes/random?apiKey=${SPOONACULAR_API_KEY}&number=1`
    );
    const data = await rsp.json();
    let meals = data.recipes ? data.recipes.map(mapSpoonacularToMeal) : [];

    // If Spoonacular gave us an empty set (rare) → fallback
    if (!meals.length){
      console.log('Spoonacular random returned nothing → using TheMealDB');
      meals = await fallbackMealDBRandom();
    }

    renderResults(meals);
  }catch(err){
    console.error('Spoonacular random error →', err);
    const meals = await fallbackMealDBRandom();
    renderResults(meals);
  }finally{
    showLoading(false);
  }
}

/* -------------------------------------------------
   ★  UI HELPERS (unchanged)
   ------------------------------------------------- */
function showLoading(isLoading){
  statusEl.classList.toggle('show', isLoading);
  searchBtn.disabled = isLoading;
  if (isLoading) emptyState.classList.remove('show');
}

function renderResults(meals, failed){
  resultsDiv.innerHTML = '';
  if (failed){
    emptyState.classList.add('show');
    emptyState.querySelector('.empty-title').textContent = 'Couldn’t reach the recipe database';
    emptyState.querySelector('.empty-sub').textContent   = 'Check your connection and try again.';
    return;
  }
  if (!meals || meals.length===0){
    emptyState.classList.add('show');
    emptyState.querySelector('.empty-title').textContent = 'No recipes found';
    emptyState.querySelector('.empty-sub').textContent   = 'Try a different dish name or ingredient — or tap “Surprise me.”';
    return;
  }
  emptyState.classList.remove('show');
  meals.forEach(m=> resultsDiv.appendChild(buildCard(m)));
}

function buildCard(meal){
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.tabIndex = 0;
  card.setAttribute('role','button');
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
      <p class="excerpt">${(meal.strInstructions||'').slice(0,140)}…</p>
      <span class="view-link">View full recipe &#8594;</span>
    </div>`;
  const open =()=>openModal(meal);
  card.addEventListener('click',open);
  card.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' ') {e.preventDefault();open();}});
  return card;
}

/* -------------------------------------------------
   ★  MODAL
   ------------------------------------------------- */
function openModal(meal){
  document.getElementById('modalImg').src = meal.strMealThumb;
  document.getElementById('modalImg').alt = meal.strMeal;
  document.getElementById('modalTitle').textContent = meal.strMeal;

  const meta = document.getElementById('modalMeta');
  meta.innerHTML = '';
  [meal.strCategory, meal.strArea].filter(Boolean).forEach(t=>{
    const span=document.createElement('span');
    span.className='meta-pill';
    span.textContent=t;
    meta.appendChild(span);
  });

  const ingEl = document.getElementById('modalIngredients');
  ingEl.innerHTML = '';
  for(let i=1;i<=20;i++){
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()){
      const li=document.createElement('li');
      li.textContent = `${meas?meas.trim()+' ':''}${ing.trim()}`;
      ingEl.appendChild(li);
    }
  }

  document.getElementById('modalInstructions').textContent = meal.strInstructions || 'No instructions available.';
  overlay.classList.add('show');
  document.body.style.overflow='hidden';
}
function closeModal(){
  overlay.classList.remove('show');
  document.body.style.overflow='';
}

/* -------------------------------------------------
   ★  EVENT LISTENERS (unchanged)
   ------------------------------------------------- */
searchBtn.addEventListener('click',()=>searchRecipe(searchInput.value));
searchInput.addEventListener('keydown',e=>{ if(e.key==='Enter') searchRecipe(searchInput.value); });

document.querySelectorAll('.chip[data-query]').forEach(chip=>{
  chip.addEventListener('click',()=>{
    searchInput.value = chip.dataset.query;
    searchRecipe(chip.dataset.query);
  });
});
document.getElementById('surpriseChip').addEventListener('click',fetchRandom);

document.getElementById('modalClose').addEventListener('click',closeModal);
overlay.addEventListener('click',e=>{ if(e.target===overlay) closeModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
