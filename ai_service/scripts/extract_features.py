import re
from urllib.parse import urlparse

def extract_features(url):
    return {
        "url_length": len(url),
        "dot_count": url.count('.'),
        "hyphen_count": url.count('-'),
        "has_at": int('@' in url),
        "has_ip": int(bool(re.search(r'(\d{1,3}\.){3}\d{1,3}', url))),
        "subdomain_count": max(urlparse(url).netloc.count('.') - 1, 0),
        "uses_https": int(url.startswith("https")),
        "suspicious_words": int(any(word in url.lower() for word in [
            "login", "verify", "secure", "account", "bank", "update", "free"
        ]))
    }