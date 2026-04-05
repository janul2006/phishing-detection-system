import math
import re
from collections import Counter
from ipaddress import ip_address
from urllib.parse import parse_qsl, urlparse


SUSPICIOUS_KEYWORDS = ("login", "verify", "secure", "account", "update", "signin", "password")
SUSPICIOUS_TLDS = (".tk", ".ml", ".ga", ".cf")
SHORTENING_SERVICES = (
    "bit.ly",
    "tinyurl.com",
    "goo.gl",
    "t.co",
    "is.gd",
    "buff.ly",
    "ow.ly",
    "rb.gy",
    "cutt.ly",
    "tiny.cc",
)
SPECIAL_CHARACTERS = "@%-_"


def _safe_ratio(numerator: float, denominator: float) -> float:
    return numerator / denominator if denominator else 0.0


def _shannon_entropy(text: str) -> float:
    if not text:
        return 0.0

    probabilities = [count / len(text) for count in Counter(text).values()]
    return -sum(probability * math.log2(probability) for probability in probabilities)


def _is_ip_address(hostname: str) -> int:
    if not hostname:
        return 0

    host_without_port = hostname.split(":", 1)[0]
    try:
        ip_address(host_without_port)
        return 1
    except ValueError:
        return 0


def _subdomain_count(hostname: str, has_ip_host: int) -> int:
    if not hostname or has_ip_host:
        return 0

    host_without_port = hostname.split(":", 1)[0]
    parts = [part for part in host_without_port.split(".") if part]
    if len(parts) <= 2:
        return 0

    return len(parts) - 2


def extract_features(url: str) -> dict:
    parsed = urlparse(url)
    hostname = parsed.netloc.lower()
    path = parsed.path or ""
    query = parsed.query or ""
    path_segments = [segment for segment in path.split("/") if segment]
    words = [word for word in re.split(r"[^a-z0-9]+", url.lower()) if word]
    host_words = [word for word in re.split(r"[^a-z0-9]+", hostname) if word]
    path_words = [word for word in re.split(r"[^a-z0-9]+", path.lower()) if word]

    has_ip_host = _is_ip_address(hostname)
    query_pairs = parse_qsl(query, keep_blank_values=True)
    url_length = len(url)
    hostname_length = len(hostname)
    digit_count = sum(character.isdigit() for character in url)
    unique_chars = len(set(url))

    features = {
        "length_url": url_length,
        "length_hostname": hostname_length,
        "length_path": len(path),
        "length_query": len(query),
        "nb_dots": url.count("."),
        "nb_slash": url.count("/"),
        "nb_hyphens": url.count("-"),
        "nb_underscore": url.count("_"),
        "nb_at": url.count("@"),
        "nb_percent": url.count("%"),
        "nb_qm": url.count("?"),
        "nb_ampersand": url.count("&"),
        "nb_eq": url.count("="),
        "nb_colon": url.count(":"),
        "subdomain_count": _subdomain_count(hostname, has_ip_host),
        "path_depth": len(path_segments),
        "query_param_count": len(query_pairs),
        "uses_https": int(parsed.scheme == "https"),
        "has_ip_address": has_ip_host,
        "suspicious_tld": int(any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS)),
        "prefix_suffix": int("-" in hostname.split(":", 1)[0]),
        "punycode": int("xn--" in hostname),
        "has_port": int(":" in hostname),
        "has_double_slash_in_path": int("//" in path),
        "has_shortener": int(any(service in hostname for service in SHORTENING_SERVICES)),
        "has_file_extension_in_path": int("." in path_segments[-1]) if path_segments else 0,
        "digit_count": digit_count,
        "digit_ratio": _safe_ratio(digit_count, url_length),
        "unique_char_ratio": _safe_ratio(unique_chars, url_length),
        "url_entropy": _shannon_entropy(url),
        "hostname_entropy": _shannon_entropy(hostname),
        "contains_www": int("www" in hostname),
        "contains_http_token_in_path": int("http" in path.lower()),
        "contains_encoded_chars": int("%" in url),
        "contains_javascript_token": int("javascript" in url.lower()),
        "contains_hex_pattern": int(bool(re.search(r"%[0-9a-f]{2}", url.lower()))),
        "max_consecutive_digits": max((len(match.group(0)) for match in re.finditer(r"\d+", url)), default=0),
        "max_consecutive_letters": max((len(match.group(0)) for match in re.finditer(r"[a-z]+", url.lower())), default=0),
        "raw_token_count": len(words),
        "host_token_count": len(host_words),
        "path_token_count": len(path_words),
        "keyword_count": sum(keyword in url.lower() for keyword in SUSPICIOUS_KEYWORDS),
        "has_keyword_login": int("login" in url.lower()),
        "has_keyword_verify": int("verify" in url.lower()),
        "has_keyword_secure": int("secure" in url.lower()),
        "has_keyword_account": int("account" in url.lower()),
        "has_keyword_update": int("update" in url.lower()),
    }

    for character in SPECIAL_CHARACTERS:
        features[f"count_char_{ord(character)}"] = url.count(character)

    if words:
        word_lengths = [len(word) for word in words]
        features["shortest_word_len"] = min(word_lengths)
        features["longest_word_len"] = max(word_lengths)
        features["avg_word_len"] = sum(word_lengths) / len(word_lengths)
    else:
        features["shortest_word_len"] = 0
        features["longest_word_len"] = 0
        features["avg_word_len"] = 0.0

    if host_words:
        host_word_lengths = [len(word) for word in host_words]
        features["avg_host_word_len"] = sum(host_word_lengths) / len(host_word_lengths)
    else:
        features["avg_host_word_len"] = 0.0

    if path_words:
        path_word_lengths = [len(word) for word in path_words]
        features["avg_path_word_len"] = sum(path_word_lengths) / len(path_word_lengths)
    else:
        features["avg_path_word_len"] = 0.0

    return features

