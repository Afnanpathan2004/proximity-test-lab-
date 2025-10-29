from typing import List, Dict, Any, Tuple

REQUIRED_FIELDS = {"stem", "options", "correct", "explanation", "topic_tag", "difficulty"}


def validate_mcq_list(items: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
    errors: List[str] = []
    seen_stems = set()

    for i, q in enumerate(items):
        path = f"item[{i}]"
        missing = REQUIRED_FIELDS - set(q.keys())
        if missing:
            errors.append(f"{path}: missing fields {sorted(missing)}")
            continue

        # options length
        opts = q.get("options")
        if not isinstance(opts, list) or len(opts) != 4:
            errors.append(f"{path}: options must be a list of 4 strings")
        else:
            if not all(isinstance(x, str) and x.strip() for x in opts):
                errors.append(f"{path}: each option must be a non-empty string")

        # correct index
        correct = q.get("correct")
        if not isinstance(correct, int) or not (0 <= correct <= 3):
            errors.append(f"{path}: correct must be int in range 0..3")

        # explanation length
        expl = q.get("explanation", "")
        if not isinstance(expl, str) or len(expl) > 200:
            errors.append(f"{path}: explanation must be <= 200 chars")

        # duplicates
        stem = q.get("stem", "").strip()
        if not stem:
            errors.append(f"{path}: stem must be non-empty")
        else:
            if stem in seen_stems:
                errors.append(f"{path}: duplicate stem")
            seen_stems.add(stem)

        # difficulty
        if q.get("difficulty") not in {"easy", "medium", "hard"}:
            errors.append(f"{path}: difficulty must be easy|medium|hard")

    return (len(errors) == 0, errors)
