# Charte Officielle de Pricing TEHK+ (v1.0)

Cette charte définit les règles strictes de calcul pour le rachat et l'échange (Swap) d'appareils électroniques sur la plateforme TEHK+.

## 1. Principes Fondamentaux
- **PRT (Prix de Référence Tehk+)** : Prix médian du marché local et international. Stable et non négociable.
- **VRT (Valeur de Reprise Tehk+)** : Valeur finale attribuée au téléphone de l'utilisateur.
- **Transparence** : Les coefficients sont fixes et appliqués mathématiquement.

## 2. Formule de calcul (VRT)
La valeur de reprise est calculée par une opération unique pour éviter le cumul de décotes :

$$VRT = PRT \times (C_{marque} \times C_{age} \times C_{état} \times C_{marché} \times C_{sécurité})$$

### A. Coefficient MARQUE ($C_{marque}$)
| Marque | Coefficient |
| :--- | :--- |
| Apple (iPhone) | 0.90 |
| Samsung | 0.85 |
| Huawei | 0.80 |
| Honor | 0.78 |
| Motorola | 0.75 |
| Tecno | 0.70 |
| Infinix | 0.68 |
| Itel | 0.60 |
| Autres | 0.65 |

### B. Coefficient ANCIENNETÉ ($C_{age}$)
| Âge de l'appareil | Coefficient |
| :--- | :--- |
| < 1 an | 0.95 |
| 1 – 2 ans | 0.85 |
| 2 – 3 ans | 0.75 |
| 3 – 4 ans | 0.65 |
| > 4 ans | 0.50 |

### C. Coefficient ÉTAT PHYSIQUE ($C_{état}$)
| État Déclaré | Description | Coefficient |
| :--- | :--- | :--- |
| **Excellent** | État neuf, aucune rayure | 0.95 |
| **Bon** | Micro-rayures invisibles écran allumé | 0.85 |
| **Moyen** | Traces d'usure visibles | 0.70 |
| **Mauvais** | Chocs légers ou rayures profondes | 0.45 |
| **Critique** | Écran cassé ou FaceID HS | 0.25 |

### D. Coefficients de Structure
- **Ajustement Marché ($C_{marché}$)** : **0.90** (Risque de revente et volatilité locale).
- **Marge de Sécurité ($C_{sécurité}$)** : **0.85** (Frais logistiques, stockage et garantie).

---

## 3. Calcul de la Soulte (Swap Gap)
Le montant à payer par l'utilisateur lors d'un échange est :

$$Soulte = PRT_{cible} - VRT_{utilisateur}$$

---

## 4. Garde-fous et Restrictions (Sécurité)
Pour garantir la viabilité économique de TEHK+, deux règles de blocage automatique sont appliquées :

1. **Règle du Downgrade Critique** : Si $VRT > 1.4 \times PRT_{cible}$, l'échange est bloqué. TEHK+ ne peut pas racheter un téléphone beaucoup plus cher que celui qu'elle vend (limitation de sortie de trésorerie).
2. **Cohérence de Gamme** : Aucun échange n'est autorisé entre un appareil de **Classe F** (Bas de gamme / Obsolète) et un appareil de **Classe A** (Premium / Récent).

---

*Version 1.0 - Applicable au 01 Février 2026*
