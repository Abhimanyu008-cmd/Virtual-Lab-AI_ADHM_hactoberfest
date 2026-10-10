"""
VirtuLab AI - Ollama Async Client (Python Backend)
Communicates with locally running Ollama instance via HTTP requests.
"""

import httpx
from typing import Dict, Any, List
from ..config import settings

async def check_ollama_health() -> Dict[str, Any]:
    url = f"{settings.OLLAMA_ENDPOINT.rstrip('/')}/api/tags"
    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                return {
                    "is_connected": True,
                    "models": models,
                    "configured_model": settings.OLLAMA_MODEL
                }
            return {
                "is_connected": False,
                "error": f"Ollama returned HTTP status {res.status_code}"
            }
    except Exception as e:
        return {
            "is_connected": False,
            "error": f"Could not connect to Ollama at {settings.OLLAMA_ENDPOINT}. Is Ollama running? ({str(e)})"
        }

async def chat_with_mentor(messages: List[Dict[str, str]], context: Dict[str, Any]) -> str:
    url = f"{settings.OLLAMA_ENDPOINT.rstrip('/')}/api/chat"
    
    system_prompt = f"""You are Lab Mentor, an expert electrical engineering tutor in VirtuLab AI.
Context:
- Experiment: {context.get('experimentTitle', 'Basic Electrical Lab')}
- State: {context.get('readings', {}).get('status', 'VALID')}
- Voltage: {context.get('readings', {}).get('sourceVoltage', 0)} V
- Current: {context.get('readings', {}).get('totalCurrent', 0)} A
Explain concepts clearly using standard SI units. Never invent false circuit readings."""

    payload = {
        "model": settings.OLLAMA_MODEL,
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt},
            *messages
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data.get("message", {}).get("content", "").strip()
    except Exception as e:
        pass

    # Graceful fallback
    return f"Ollama ({settings.OLLAMA_MODEL}) is currently offline on your computer. To connect, run 'ollama run {settings.OLLAMA_MODEL}' in Windows PowerShell."
