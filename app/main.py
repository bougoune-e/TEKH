from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict
import os
import json
import urllib.request

# Load .env manually to avoid extra dependencies
SUPABASE_URL = None
SUPABASE_KEY = None

def load_env_manually():
    global SUPABASE_URL, SUPABASE_KEY
    env_path = "/home/kizerbo/TEKH/.env"
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip()
                    os.environ[key] = val
    SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

load_env_manually()

app = FastAPI(
    title="TEKH+ Core API",
    description="Engine for phone estimation and swap gap calculation aligned with the audited TEKH+ Charte de Pricing",
    version="2.1.0"
)

# Constants aligned with src/core/api/pricing.ts
C_MARCHE = 0.85
C_SECURITE = 0.85
VRT_FLOOR_RATIO = 0.05
DOWNGRADE_ABSORPTION_CAP_FCFA = 15_000

CLASS_INDEX = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5}

# Helper to round down to the nearest thousand FCFA
def arrondir_prix(montant: float) -> int:
    import math
    return int(math.floor(montant / 1000.0) * 1000)

# Models
class BonusInput(BaseModel):
    boiteEtAccessoiresComplets: Optional[bool] = False
    compatible5g: Optional[bool] = False
    debloqueTousOperateurs: Optional[bool] = False
    factureAchatOriginale: Optional[bool] = False

class DiagnosticsInput(BaseModel):
    ecran: Optional[str] = None  # parfait | raye | casse
    chassis: Optional[str] = None  # intact | abime
    batterie: Optional[str] = None  # gte90 | gte80_89 | gte70_79 | gte60_69 | lt60 | unknown
    bonus: Optional[BonusInput] = Field(default_factory=BonusInput)

    # Legacy mappings
    screenState: Optional[str] = None
    batteryState: Optional[str] = None
    aestheticState: Optional[str] = None

class EstimationRequest(BaseModel):
    prt: float = Field(..., description="Prix de Référence TEKH (in FCFA)")
    brand: str
    release_year: Optional[int] = None
    model: Optional[str] = None
    diagnostics: DiagnosticsInput

class SwapGapRequest(BaseModel):
    vrt_utilisateur: float = Field(..., description="VRT de l'utilisateur (in FCFA)")
    prt_cible: float = Field(..., description="PRT du téléphone ciblé (in FCFA)")
    class_utilisateur: str = Field("B", description="Classe d'équivalence de l'utilisateur (A-F)")
    class_cible: str = Field("B", description="Classe d'équivalence du téléphone cible (A-F)")

# Helper normalization functions
def normalize_ecran(diag: DiagnosticsInput) -> str:
    if diag.ecran:
        return diag.ecran.lower()
    s = (diag.screenState or "").lower()
    if s in ["intact", "parfait", "ecran_parfait"]:
        return "parfait"
    if s in ["scratched", "raye", "ecran_raye"]:
        return "raye"
    return "casse"

def normalize_chassis(diag: DiagnosticsInput) -> str:
    if diag.chassis:
        return diag.chassis.lower()
    a = (diag.aestheticState or "").lower()
    if a in ["very_good", "intact", "chassis_intact"]:
        return "intact"
    return "abime"

def normalize_batterie(diag: DiagnosticsInput) -> str:
    if diag.batterie:
        return diag.batterie.lower()
    b = (diag.batteryState or "").lower()
    if b == "gte90":
        return "gte90"
    if b in ["good", "gte80_89"]:
        return "gte80_89"
    if b in ["low", "gte70_79"]:
        return "gte70_79"
    if b in ["replace", "gte60_69"]:
        return "gte60_69"
    if b == "lt60":
        return "lt60"
    return "unknown"

def get_coeff_etat_ecran(ecran: str) -> float:
    if ecran == "parfait":
        return 0.95
    if ecran == "raye":
        return 0.75
    if ecran == "casse":
        return 0.22
    return 0.85

def get_coeff_batterie(b: str) -> float:
    if b == "gte90":
        return 1.0
    if b == "gte80_89":
        return 0.92
    if b == "gte70_79":
        return 0.8
    if b == "gte60_69":
        return 0.68
    return 0.5

def calculate_bonus_multiplier(bonus: Optional[BonusInput]) -> float:
    if not bonus:
        return 0.0
    p = 0.0
    if bonus.boiteEtAccessoiresComplets:
        p += 0.03
    if bonus.compatible5g:
        p += 0.02
    if bonus.debloqueTousOperateurs:
        p += 0.015
    if bonus.factureAchatOriginale:
        p += 0.01
    return min(0.075, p)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "TEKH+ Core API",
        "description": "Dynamic pricing and swap calculation engine"
    }

@app.post("/api/v1/pricing/estimate")
def estimate_phone_value(req: EstimationRequest):
    try:
        prt = req.prt
        if prt <= 0:
            return {"vrt": 0, "reason": "PRT must be positive"}

        ecran = normalize_ecran(req.diagnostics)
        chassis = normalize_chassis(req.diagnostics)
        batterie = normalize_batterie(req.diagnostics)

        c_etat = get_coeff_etat_ecran(ecran)
        c_batt = get_coeff_batterie(batterie)

        # PRT already reflects brand/age depreciation (avoid double depreciation, Audit April 2026)
        vrt_before_chassis_and_bonus = prt * (c_etat * c_batt * C_MARCHE * C_SECURITE)

        vrt = vrt_before_chassis_and_bonus
        if chassis == "abime":
            vrt *= 0.85

        bonus_pct = calculate_bonus_multiplier(req.diagnostics.bonus)
        vrt = vrt * (1 + bonus_pct)

        # Minimum floor limit check
        if vrt < prt * VRT_FLOOR_RATIO:
            return {
                "vrt": 0,
                "refusal_reason": f"VRT ({arrondir_prix(vrt)} FCFA) below minimum floor ratio ({VRT_FLOOR_RATIO * 100}% of PRT)"
            }

        final_vrt = arrondir_prix(vrt)
        return {
            "vrt": final_vrt,
            "normalized_diagnostics": {
                "ecran": ecran,
                "chassis": chassis,
                "batterie": batterie
            },
            "coefficients": {
                "c_etat": c_etat,
                "c_batt": c_batt,
                "c_chassis": 0.85 if chassis == "abime" else 1.0,
                "bonus_percentage": bonus_pct
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/pricing/swap-gap")
def calculate_swap_gap(req: SwapGapRequest):
    try:
        vrt_user = req.vrt_utilisateur
        prt_target = req.prt_cible
        cu = req.class_utilisateur.upper()
        cc = req.class_cible.upper()

        if vrt_user <= 0:
            return {
                "gap": 0,
                "blocked": True,
                "reason": "Reprise refusée : VRT inférieure au plancher minimal (5 % du PRT).",
                "amount_to_pay": 0,
                "tekh_points_credited": 0,
                "downgrade_absorbed": False,
                "is_upgrade": False
            }

        if cu == "F":
            return {
                "gap": 0,
                "blocked": True,
                "reason": "Échange bloqué : aucun échange autorisé pour un appareil de classe F.",
                "amount_to_pay": 0,
                "tekh_points_credited": 0,
                "downgrade_absorbed": False,
                "is_upgrade": False
            }

        if cu not in CLASS_INDEX or cc not in CLASS_INDEX:
            raise HTTPException(status_code=400, detail="Invalid equivalence class. Must be A, B, C, D, E, or F.")

        if abs(CLASS_INDEX[cu] - CLASS_INDEX[cc]) > 2:
            return {
                "gap": 0,
                "blocked": True,
                "reason": "Échange non autorisé : l'écart de classe dépasse 2 niveaux.",
                "amount_to_pay": 0,
                "tekh_points_credited": 0,
                "downgrade_absorbed": False,
                "is_upgrade": False
            }

        gap = prt_target - vrt_user
        excess = vrt_user - prt_target

        if gap >= 0:
            amount_to_pay = arrondir_prix(gap)
            return {
                "gap": gap,
                "blocked": False,
                "amount_to_pay": amount_to_pay,
                "tekh_points_credited": 0,
                "downgrade_absorbed": False,
                "is_upgrade": True,
                "formatted": f"{amount_to_pay:,} XOF"
            }
        else:
            if excess <= DOWNGRADE_ABSORPTION_CAP_FCFA:
                return {
                    "gap": gap,
                    "blocked": False,
                    "amount_to_pay": 0,
                    "tekh_points_credited": 0,
                    "downgrade_absorbed": True,
                    "is_upgrade": False,
                    "formatted": "0 FCFA (différence absorbée par TEKH+)"
                }
            else:
                tekh_points_credited = arrondir_prix(excess)
                return {
                    "gap": gap,
                    "blocked": False,
                    "amount_to_pay": 0,
                    "tekh_points_credited": tekh_points_credited,
                    "downgrade_absorbed": False,
                    "is_upgrade": False,
                    "formatted": f"{tekh_points_credited:,} TekhPoints"
                }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ImageResponse(BaseModel):
    model_name: str
    official_image_url: str
    fallback_image_url: str

@app.get("/api/v1/catalog/image/{brand}/{model_slug}", response_model=ImageResponse)
def get_smartphone_image(brand: str, model_slug: str):
    """
    Génère dynamiquement l'URL de l'image stockée sur le CDN officiel du constructeur ou récupérée depuis Supabase.
    """
    brand_lower = brand.lower().strip()
    model_slug_lower = model_slug.lower().strip()
    
    # 1. Tenter de récupérer l'image_url depuis Supabase
    db_image_url = None
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            req_url = f"{SUPABASE_URL}/rest/v1/models?select=image_url&or=(gsmarena_slug.eq.{model_slug_lower},name.ilike.{model_slug_lower})&limit=1"
            req = urllib.request.Request(
                req_url,
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}"
                }
            )
            with urllib.request.urlopen(req, timeout=3.0) as res:
                data = json.loads(res.read().decode("utf-8"))
                if data and data[0].get("image_url"):
                    db_image_url = data[0]["image_url"]
        except Exception:
            pass
            
    if db_image_url:
        official_url = db_image_url
        fallback_url = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000"
    else:
        # 2. Logique pour Apple (CDN officiel)
        if "apple" in brand_lower:
            official_url = f"https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/{model_slug_lower}?wid=1000&hei=1000&fmt=jpeg"
            fallback_url = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000"
            
        # 3. Logique pour Samsung
        elif "samsung" in brand_lower:
            official_url = f"https://images.samsung.com/is/image/samsung/{model_slug_lower}"
            fallback_url = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000"
            
        # 4. Tout autre constructeur (Google, Xiaomi, etc.) ou fallback générique
        else:
            official_url = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000"
            fallback_url = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000"

    model_name = model_slug.replace("-", " ").replace("_", " ").title()

    return {
        "model_name": model_name,
        "official_image_url": official_url,
        "fallback_image_url": fallback_url
    }

