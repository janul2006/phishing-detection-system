import re
from urllib.parse import urlparse

def extract_features(url: str):
    parsed = urlparse(url)

    hostname = parsed.netloc
    path = parsed.path

    features = {}

    # Basic lengths
    features["length_url"] = len(url)
    features["length_hostname"] = len(hostname)

    # Special characters
    features["nb_dots"] = url.count(".")
    features["nb_hyphens"] = url.count("-")
    features["nb_at"] = url.count("@")
    features["nb_qm"] = url.count("?")
    features["nb_and"] = url.count("&")
    features["nb_or"] = url.count("|")
    features["nb_eq"] = url.count("=")
    features["nb_underscore"] = url.count("_")
    features["nb_tilde"] = url.count("~")
    features["nb_percent"] = url.count("%")
    features["nb_slash"] = url.count("/")
    features["nb_star"] = url.count("*")
    features["nb_colon"] = url.count(":")
    features["nb_comma"] = url.count(",")
    features["nb_semicolumn"] = url.count(";")
    features["nb_dollar"] = url.count("$")
    features["nb_space"] = url.count(" ")

    # Keywords
    features["nb_www"] = url.count("www")
    features["nb_com"] = url.count(".com")

    # Patterns
    features["nb_dslash"] = url.count("//") - 1
    features["http_in_path"] = int("http" in path)
    features["https_token"] = int("https" in url)

    # Digits
    digits = sum(c.isdigit() for c in url)
    features["ratio_digits_url"] = digits / len(url) if len(url) > 0 else 0

    digits_host = sum(c.isdigit() for c in hostname)
    features["ratio_digits_host"] = digits_host / len(hostname) if len(hostname) > 0 else 0

    # Domain checks
    features["punycode"] = int("xn--" in hostname)
    features["port"] = int(":" in hostname)
    features["tld_in_path"] = int("." in path)
    features["tld_in_subdomain"] = int(hostname.count(".") > 1)
    features["abnormal_subdomain"] = int(hostname.startswith("www.") is False)

    # Subdomains
    features["nb_subdomains"] = hostname.count(".")

    # Suspicious patterns
    features["prefix_suffix"] = int("-" in hostname)
    features["random_domain"] = int(len(re.findall(r"[a-z]{10,}", hostname)) > 0)
    features["shortening_service"] = int(any(x in url for x in ["bit.ly", "tinyurl", "goo.gl"]))
    features["path_extension"] = int("." in path.split("/")[-1])

    # Redirections (simple guess)
    features["nb_redirection"] = url.count("//") - 1
    features["nb_external_redirection"] = 0  # hard to detect without requests

    # Words
    words = re.split(r"\W+", url)
    words = [w for w in words if w]

    features["length_words_raw"] = len(words)
    features["char_repeat"] = int(any(url.count(c) > 5 for c in set(url)))

    if words:
        features["shortest_words_raw"] = min(len(w) for w in words)
        features["longest_words_raw"] = max(len(w) for w in words)
        features["avg_words_raw"] = sum(len(w) for w in words) / len(words)
    else:
        features["shortest_words_raw"] = 0
        features["longest_words_raw"] = 0
        features["avg_words_raw"] = 0

    # Host/path words
    host_words = re.split(r"\W+", hostname)
    path_words = re.split(r"\W+", path)

    host_words = [w for w in host_words if w]
    path_words = [w for w in path_words if w]

    features["shortest_word_host"] = min([len(w) for w in host_words], default=0)
    features["longest_word_host"] = max([len(w) for w in host_words], default=0)
    features["avg_word_host"] = sum(len(w) for w in host_words) / len(host_words) if host_words else 0

    features["shortest_word_path"] = min([len(w) for w in path_words], default=0)
    features["longest_word_path"] = max([len(w) for w in path_words], default=0)
    features["avg_word_path"] = sum(len(w) for w in path_words) / len(path_words) if path_words else 0

    # Phishing hints
    suspicious_words = ["login", "secure", "account", "bank", "verify", "update"]
    features["phish_hints"] = sum(word in url.lower() for word in suspicious_words)

    return features