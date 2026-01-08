-- Fix Chinese characters appearing in English field for 腐 (tofu)
UPDATE words
SET english = 'rotten / tofu (part 2)'
WHERE hanzi = '腐' AND english LIKE '%豆腐%';
