export async function generateLunch(answers) {
  const [menuRes, scoringRes] = await Promise.all([
    fetch('boosty_menu.json'),
    fetch('boosty_quiz_scoring_template_filled.json')
  ]);

  const menuData = await menuRes.json();
  const scoringData = await scoringRes.json();
  const items = menuData.items;

  // Build user category score profile
  const userScores = {};

  const applyScores = (questionKey, answerValue) => {
    const mapping = scoringData[questionKey]?.[answerValue];
    if (!mapping) return;
    for (const [category, value] of Object.entries(mapping)) {
      userScores[category] = (userScores[category] || 0) + value;
    }
  };

  for (const [key, value] of Object.entries(answers)) {
    if (Array.isArray(value)) continue;
    applyScores(key, value);
  }

  // Filtering function
  const filterItems = (typeKey) => {
    return items.filter(item => {
      if (typeKey === 'main' && !['wrap', 'sandwich', 'salad'].includes(item.type)) return false;
      if (typeKey === 'drink' && item.type !== 'drink') return false;
      if (typeKey === 'sweet' && item.type !== 'sweet') return false;
      if (answers.mealType && answers.mealType !== 'any' && typeKey === 'main' && item.type !== answers.mealType) return false;
      if (answers.diet === 'vegetarian' && item.diet !== 'vegetarian') return false;
      if (answers.allergens && answers.allergens[0] !== 'none') {
        if (item.allergens.some(a => answers.allergens.includes(a))) return false;
      }
      return true;
    });
  };

  // Ingredient preference scoring
  const ingredientScore = (item, favs) => {
    if (!item.ingredients || !favs) return 0;
    return favs.filter(f => item.ingredients.toLowerCase().includes(f.toLowerCase())).length;
  };

  // Final scorer
  const getBestItem = (categoryType) => {
    const filtered = filterItems(categoryType);
    const favs = answers.favoriteIngredients || [];

    const scored = filtered.map(item => {
      const base = Object.entries(userScores).reduce((sum, [cat, val]) => {
        return sum + (item.categories?.[cat] || 0) * val;
      }, 0);
      const ingredientBonus = ingredientScore(item, favs);
      return { item, total: base + ingredientBonus };
    });

    return scored.sort((a, b) => b.total - a.total)[0]?.item || null;
  };

  return {
    main: getBestItem('main'),
    drink: getBestItem('drink'),
    sweet: answers.wantsTreat === 'yes' ? getBestItem('sweet') : null
  };
}