from fastapi import Header, HTTPException

from core.config import get_settings


def verify_api_key(x_api_key: str = Header(...)) -> str:
    if x_api_key != get_settings().internal_api_key:
        raise HTTPException(status_code=401, detail="Credenciais internas inválidas.")

    return x_api_key
