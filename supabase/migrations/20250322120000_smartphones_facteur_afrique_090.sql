-- Passage du facteur Afrique par défaut de 0,6 à 0,90 (PRT = médiane EUR × facteur × EUR→FCFA)
-- À exécuter si la migration initiale avait déjà été appliquée avec DEFAULT 0,6.

ALTER TABLE public.smartphones
  ALTER COLUMN facteur_afrique SET DEFAULT 0.9000;

UPDATE public.smartphones
SET facteur_afrique = 0.9000
WHERE facteur_afrique = 0.6000;
