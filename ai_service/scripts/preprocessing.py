import re
from pathlib import Path

import pandas as pd


VALID_URL_PATTERN = re.compile(r"^https?://", re.IGNORECASE)
URL_COLUMN_CANDIDATES = ("url", "URL")
LABEL_COLUMN_CANDIDATES = ("label", "Label")
LABEL_MAPPING = {
    "0": 0,
    "1": 1,
    "legitimate": 0,
    "benign": 0,
    "safe": 0,
    "phishing": 1,
    "malicious": 1,
    "unsafe": 1,
}


def find_dataset_path() -> Path:
    candidates = (
        Path(__file__).resolve().parents[1] / "data" / "Finali.csv",
        Path(__file__).resolve().parents[1] / "data" / "PhiUSIIL_Phishing_URL_Dataset.csv",
    )
    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise FileNotFoundError("No dataset file found in ai_service/data.")


def _find_column(columns: pd.Index, candidates: tuple[str, ...]) -> str:
    for candidate in candidates:
        if candidate in columns:
            return candidate
    raise KeyError(f"Expected one of columns {candidates}, found {list(columns)}")


def normalize_url(url: str) -> str:
    if url is None:
        return ""
    return str(url).strip().lower()


def normalize_label(value) -> int | None:
    if pd.isna(value):
        return None

    if isinstance(value, (int, float)) and value in (0, 1):
        return int(value)

    normalized = str(value).strip().lower()
    return LABEL_MAPPING.get(normalized)


def clean_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    url_column = _find_column(df.columns, URL_COLUMN_CANDIDATES)
    label_column = _find_column(df.columns, LABEL_COLUMN_CANDIDATES)

    cleaned = df[[url_column, label_column]].copy()
    cleaned.columns = ["url", "label"]

    initial_rows = len(cleaned)
    cleaned["url"] = cleaned["url"].apply(normalize_url)
    cleaned["label"] = cleaned["label"].apply(normalize_label)

    cleaned = cleaned.dropna(subset=["url", "label"])
    cleaned = cleaned[cleaned["url"] != ""]
    cleaned = cleaned[cleaned["url"].str.match(VALID_URL_PATTERN, na=False)]
    cleaned["label"] = cleaned["label"].astype(int)
    cleaned = cleaned.drop_duplicates(subset=["url"]).reset_index(drop=True)

    class_counts = cleaned["label"].value_counts().sort_index().to_dict()
    if set(class_counts) != {0, 1}:
        raise ValueError(f"Both classes must be present after cleaning. Found {class_counts}")

    minority_ratio = min(class_counts.values()) / max(class_counts.values())
    stats = {
        "initial_rows": initial_rows,
        "cleaned_rows": len(cleaned),
        "dropped_rows": initial_rows - len(cleaned),
        "duplicate_urls_removed": int(df[url_column].astype(str).str.strip().str.lower().duplicated().sum()),
        "class_counts": class_counts,
        "minority_majority_ratio": minority_ratio,
        "is_reasonably_balanced": minority_ratio >= 0.5,
    }
    return cleaned, stats
