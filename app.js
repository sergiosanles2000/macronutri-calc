
// MacroNutri - Scientific Energy & Macro Engine (Pure Client-side, Mifflin-St Jeor & Katch-McArdle)
document.addEventListener('DOMContentLoaded', () => {
  const genderInputs = document.querySelectorAll('input[name="gender"]');
  const ageInput = document.getElementById('age');
  const weightInput = document.getElementById('weight');
  const heightInput = document.getElementById('height');
  const activitySelect = document.getElementById('activity');
  const goalSelect = document.getElementById('goal');
  const dietRatioSelect = document.getElementById('dietRatio');
  const mealsCountSelect = document.getElementById('mealsCount');

  // Results elements
  const resBmr = document.getElementById('resBmr');
  const resTdee = document.getElementById('resTdee');
  const resTargetCalories = document.getElementById('resTargetCalories');
  
  const resProteinGrams = document.getElementById('resProteinGrams');
  const resProteinKcal = document.getElementById('resProteinKcal');
  const resCarbsGrams = document.getElementById('resCarbsGrams');
  const resCarbsKcal = document.getElementById('resCarbsKcal');
  const resFatGrams = document.getElementById('resFatGrams');
  const resFatKcal = document.getElementById('resFatKcal');
  const resWaterLiters = document.getElementById('resWaterLiters');

  const mealsBreakdownContainer = document.getElementById('mealsBreakdown');

  function calculateNutrition() {
    let gender = 'male';
    genderInputs.forEach(radio => {
      if (radio.checked) gender = radio.value;
    });

    const age = parseInt(ageInput.value) || 28;
    const weight = parseFloat(weightInput.value) || 75;
    const height = parseFloat(heightInput.value) || 178;
    const activityFactor = parseFloat(activitySelect.value) || 1.55;
    const goalDelta = parseFloat(goalSelect.value) || 0; // -0.20, -0.10, 0, +0.10, +0.20

    // Mifflin-St Jeor Equation:
    // Men: BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    // Women: BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = bmr * activityFactor;
    const targetCalories = Math.round(tdee * (1 + goalDelta));

    // Macro distributions
    // Options: 'balanced' (45% C / 25% P / 30% F), 'high_protein' (35% C / 35% P / 30% F), 'low_carb' (20% C / 40% P / 40% F), 'keto' (5% C / 25% P / 70% F)
    let pRatio = 0.30;
    let cRatio = 0.45;
    let fRatio = 0.25;

    const ratioType = dietRatioSelect.value;
    if (ratioType === 'high_protein') {
      pRatio = 0.35; cRatio = 0.35; fRatio = 0.30;
    } else if (ratioType === 'low_carb') {
      pRatio = 0.35; cRatio = 0.20; fRatio = 0.45;
    } else if (ratioType === 'keto') {
      pRatio = 0.25; cRatio = 0.05; fRatio = 0.70;
    }

    // 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
    const proteinKcal = targetCalories * pRatio;
    const carbsKcal = targetCalories * cRatio;
    const fatKcal = targetCalories * fRatio;

    const proteinGrams = Math.round(proteinKcal / 4);
    const carbsGrams = Math.round(carbsKcal / 4);
    const fatGrams = Math.round(fatKcal / 9);

    const waterLiters = (weight * 0.035).toFixed(1);

    // Render summary
    resBmr.textContent = `${Math.round(bmr)} kcal`;
    resTdee.textContent = `${Math.round(tdee)} kcal`;
    resTargetCalories.textContent = `${targetCalories} kcal`;

    resProteinGrams.textContent = `${proteinGrams} g`;
    resProteinKcal.textContent = `${Math.round(proteinKcal)} kcal (${(proteinGrams / weight).toFixed(1)} g/kg)`;

    resCarbsGrams.textContent = `${carbsGrams} g`;
    resCarbsKcal.textContent = `${Math.round(carbsKcal)} kcal`;

    resFatGrams.textContent = `${fatGrams} g`;
    resFatKcal.textContent = `${Math.round(fatKcal)} kcal`;

    resWaterLiters.textContent = `${waterLiters} L / día`;

    // Render Meals Breakdown
    const meals = parseInt(mealsCountSelect.value) || 3;
    let mealsHtml = '<div class="table-responsive"><table class="data-table"><thead><tr><th>Comida</th><th>Calorías</th><th>Proteína</th><th>Carbohidratos</th><th>Grasas</th></tr></thead><tbody>';
    
    for (let m = 1; m <= meals; m++) {
      mealsHtml += `<tr>
        <td><strong>Toma ${m}</strong></td>
        <td>${Math.round(targetCalories / meals)} kcal</td>
        <td>${Math.round(proteinGrams / meals)} g</td>
        <td>${Math.round(carbsGrams / meals)} g</td>
        <td>${Math.round(fatGrams / meals)} g</td>
      </tr>`;
    }
    mealsHtml += '</tbody></table></div>';
    mealsBreakdownContainer.innerHTML = mealsHtml;

    if (window.enterpriseTrack) {
      window.enterpriseTrack('macros_calculated', { targetCalories: targetCalories, goal: goalSelect.value });
    }
  }

  // Event Listeners
  [...genderInputs, ageInput, weightInput, heightInput, activitySelect, goalSelect, dietRatioSelect, mealsCountSelect].forEach(el => {
    el.addEventListener('input', calculateNutrition);
  });

  calculateNutrition();
});
