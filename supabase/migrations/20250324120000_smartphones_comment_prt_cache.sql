-- Clarification : PRT servi par l’app = colonnes en base (cache), pas appel eBay temps réel.
COMMENT ON TABLE public.smartphones IS 'Référentiel modèles TEKH+ ; prt_fcfa / prix_ebay_eur = cache persistant alimenté par scripts (eBay), refresh périodique.';
