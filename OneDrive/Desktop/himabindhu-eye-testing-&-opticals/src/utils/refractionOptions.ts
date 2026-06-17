export const generateSphCylOptions = () => {
  const positives = [];
  const negatives = [];
  for (let i = 0.25; i <= 20.00; i += 0.25) {
    positives.push(`+${i.toFixed(2)}`);
    negatives.push(`-${i.toFixed(2)}`);
  }
  return { positives, negatives };
};

export const axisOptions = Array.from({length: 180}, (_, i) => String(i + 1));
export const distVisionOptions = ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60", "HM", "PL", "NPL"];
export const nearVisionOptions = ["N6", "N8", "N10", "N12", "N18", "N24", "N36", "J1", "J2", "J3", "J4", "J5", "J6"];
export const addOptions = Array.from({length: 14}, (_, i) => `+${(0.75 + i * 0.25).toFixed(2)}`);
