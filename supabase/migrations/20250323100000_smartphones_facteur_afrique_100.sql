-- PRT = médiane eBay (EUR) × facteur × EUR→FCFA — facteur par défaut **1** (parité directe).
-- À exécuter si la base existait avec 0,6 / 0,9.

ALTER TABLE public.smartphones
  ALTER COLUMN facteur_afrique SET DEFAULT 1.0000;

UPDATE public.smartphones
SET facteur_afrique = 1.0000
WHERE facteur_afrique IS NOT NULL AND facteur_afrique < 1;
