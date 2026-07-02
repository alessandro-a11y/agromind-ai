import numpy as np
from sklearn.ensemble import RandomForestRegressor
import pickle
import os
from models.prediction import PredictionRequest

# Mapeamentos
SOIL_MAP = {"argiloso": 0, "arenoso": 1, "siltoso": 2, "humoso": 3, "calcário": 4}
CULTURE_MAP = {"soja": 0, "milho": 1, "cana": 2, "algodão": 3, "trigo": 4, "feijão": 5}
RISK_MAP = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}

MODEL_PATH = "model.pkl"

def _generate_synthetic_data():
    """Gera dados sintéticos realistas para treinar o modelo."""
    np.random.seed(42)
    n = 2000

    area = np.random.uniform(1, 500, n)
    ph = np.random.uniform(4.5, 7.5, n)
    precip = np.random.uniform(300, 2000, n)
    temp = np.random.uniform(15, 35, n)
    solo = np.random.randint(0, 5, n)
    cultura = np.random.randint(0, 6, n)
    risco = np.random.randint(0, 4, n)

    # Produtividade base por cultura (ton/ha)
    base = np.array([3.5, 6.0, 80.0, 4.5, 3.0, 2.5])
    prod_base = base[cultura]

    # Fatores de ajuste
    ph_factor = 1 - np.abs(ph - 6.0) * 0.1
    precip_factor = np.clip(precip / 1200, 0.5, 1.2)
    temp_factor = 1 - np.abs(temp - 25) * 0.02
    risk_factor = 1 - risco * 0.15
    noise = np.random.normal(1.0, 0.05, n)

    produtividade = prod_base * ph_factor * precip_factor * temp_factor * risk_factor * noise
    produtividade = np.clip(produtividade, 0.1, None)

    X = np.column_stack([area, solo, ph, cultura, precip, temp, risco])
    return X, produtividade

def _train_model() -> RandomForestRegressor:
    X, y = _generate_synthetic_data()
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X, y)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    return model

def _load_model() -> RandomForestRegressor:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return _train_model()

_model = _load_model()

def predict(req: PredictionRequest) -> tuple[float, float, list[str]]:
    solo = SOIL_MAP.get(req.tipo_solo.lower(), 0)
    cultura = CULTURE_MAP.get(req.cultura.lower(), 0)
    risco = RISK_MAP.get(req.risco_nivel, 0)

    X = np.array([[req.area, solo, req.ph, cultura,
                   req.precipitacao_mm, req.temperatura_media, risco]])

    pred = _model.predict(X)[0]

    # Confiança baseada nos estimadores
    preds = np.array([est.predict(X)[0] for est in _model.estimators_])
    std = np.std(preds)
    confianca = float(np.clip(1 - (std / (pred + 1e-9)), 0.5, 0.99))

    recomendacoes = []
    if req.ph < 5.5:
        recomendacoes.append("Aplicar calcário para correção do pH do solo")
    if req.ph > 7.0:
        recomendacoes.append("Solo alcalino — considerar enxofre elementar")
    if req.precipitacao_mm < 500:
        recomendacoes.append("Precipitação baixa — avaliar irrigação suplementar")
    if req.risco_nivel in ("High", "Critical"):
        recomendacoes.append("Risco elevado — priorizar controle de pragas e doenças")
    if not recomendacoes:
        recomendacoes.append("Condições favoráveis — manter manejo atual")

    return round(float(pred), 2), round(confianca, 2), recomendacoes
