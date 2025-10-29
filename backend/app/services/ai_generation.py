from typing import List, Dict, Any
import json
import httpx
from .validation import validate_mcq_list
from ..core.config import get_settings

PROMPT_TEMPLATE = (
    "You are an exam question generator. Create {n} multiple-choice questions on the topic: {topic} "
    "and syllabus: {syllabus}. For each question return strictly a JSON array item with keys: "
    "{\"stem\":string, \"options\":[""A"",""B"",""C"",""D""], \"correct\":int(0..3), \"explanation\":string(<=40 words), "
    "\"topic_tag\":string, \"difficulty\":\"easy|medium|hard\"}. Avoid ambiguous wording, avoid 'none of the above'."
)


def _build_messages(topic: str, syllabus: str, n: int, language: str | None) -> list[dict]:
    sys = "You generate concise, unambiguous MCQs as strict JSON only."
    user = PROMPT_TEMPLATE.format(n=n, topic=topic, syllabus=syllabus)
    if language and language.lower() != "en":
        user += f" Generate the questions in {language}."
    return [
        {"role": "system", "content": sys},
        {"role": "user", "content": user},
    ]


async def generate_mcqs_async(
    topic: str,
    syllabus: str,
    n: int = 5,
    language: str | None = None,
    model: str = "gpt-4o-mini",
) -> List[Dict[str, Any]]:
    settings = get_settings()
    if not settings.openai_api_key:
        # No key configured; return empty for now
        return []

    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": _build_messages(topic, syllabus, n, language),
        "temperature": 0.4,
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        # Try parse as object or array
        try:
            parsed = json.loads(content)
            # Some models wrap under a key; accept both {items:[...] } or [...]
            if isinstance(parsed, dict) and "items" in parsed:
                items = parsed["items"]
            else:
                items = parsed if isinstance(parsed, list) else []
        except Exception:
            items = []

    ok, errors = validate_mcq_list(items)
    if not ok:
        # filter out invalid items instead of failing hard
        valid: List[Dict[str, Any]] = []
        for it in items:
            if isinstance(it, dict):
                subset = {k: it.get(k) for k in ("stem", "options", "correct", "explanation", "topic_tag", "difficulty")}
                vo, ve = validate_mcq_list([subset])
                if vo:
                    valid.append(subset)
        items = valid
    return items


def generate_mcqs(
    topic: str,
    syllabus: str,
    n: int = 5,
    language: str | None = None,
    model: str = "gpt-4o-mini",
) -> List[Dict[str, Any]]:
    # synchronous adapter
    import anyio

    return anyio.run(generate_mcqs_async, topic, syllabus, n, language, model)
