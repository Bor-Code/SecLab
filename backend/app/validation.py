from typing import Any


def strip_required_text(value: Any) -> Any:
    if not isinstance(value, str):
        return value

    stripped = value.strip()
    if not stripped:
        raise ValueError("Alan boş veya yalnızca boşluklardan oluşamaz")

    return stripped


def strip_optional_text(value: Any) -> Any:
    if value is None or not isinstance(value, str):
        return value

    stripped = value.strip()
    return stripped or None


def normalize_email(value: Any) -> Any:
    if not isinstance(value, str):
        return value

    normalized = value.strip().lower()
    local_part, separator, domain = normalized.partition("@")
    if (
        not separator
        or not local_part
        or not domain
        or "." not in domain
        or domain.startswith(".")
        or domain.endswith(".")
    ):
        raise ValueError("Geçerli bir e-posta adresi girin")

    return normalized
