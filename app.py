print(">>> APP.PY LOADED <<<")

import os
import unicodedata
import re
import collections
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__)

#-------------------------------------------------------------
# CONFIG
#-------------------------------------------------------------

# List your wordlist files here (must be in same folder as app.py)
WORDLIST_FILES = [
    "engwords.txt",
    "countries.txt",
    "cities.txt",
    "entertainers.txt",
    "politicians.txt",
    "scientists.txt",
    "sportspeople.txt",
    "phrases.txt",
]

# Master anagram dictionary
ANAGRAM_MAP = collections.defaultdict(list)


#-------------------------------------------------------------
# HELPERS
#-------------------------------------------------------------

def clean_word(word):
    """
    Standardize a word so that matching is consistent:
    - lowercase
    - remove accents (unicode normalize)
    - keep letters only (no punctuation, no digits)
    - keep spaces only if needed (input is a single word so spaces removed here)
    """
    word = word.strip().lower()

    # Normalize Unicode accents → ASCII
    word = unicodedata.normalize("NFKD", word)
    word = word.encode("ASCII", "ignore").decode("utf-8")

    # Letters only for anagram keys
    word = re.sub(r'[^a-z]', '', word)

    return word


def load_wordlist(path):
    """
    Safely load a text file into a list of cleaned words.
    Always returns a list (never None).
    """
    if not os.path.exists(path):
        print(f"[WARN] Wordlist not found: {path}")
        return []

    words = []
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                w = line.strip()
                if w:
                    words.append(w)
        print(f"[INFO] Loaded {len(words):,} words from {path}")
        return words
    except Exception as e:
        print(f"[ERROR] Failed reading {path}: {e}")
        return []


def build_anagram_map():
    """
    Build the global ANAGRAM_MAP from all wordlist files.
    Keys are sorted letters; values are wordlists.
    """
    total = 0

    for filename in WORDLIST_FILES:
        words = load_wordlist(filename)

        for w in words:
            cleaned = clean_word(w)
            if cleaned:
                key = "".join(sorted(cleaned))
                ANAGRAM_MAP[key].append(w)  # Keep original word spelling
                total += 1

    print(f"[INFO] Total indexed words: {total:,}")
    print(f"[INFO] Unique anagram groups: {len(ANAGRAM_MAP):,}")


# Build map on startup
build_anagram_map()


#-------------------------------------------------------------
# ROUTES
#-------------------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/solve")
def solve():
    """
    Frontend sends: /solve?letters=exampletext
    Returns JSON list of matching anagrams.
    """
    letters = request.args.get("letters", "").strip()

    if not letters:
        return jsonify({"error": "No letters provided", "results": []})

    cleaned = clean_word(letters)
    key = "".join(sorted(cleaned))

    matches = ANAGRAM_MAP.get(key, [])

    return jsonify({"query": letters, "results": sorted(set(matches))})


#-------------------------------------------------------------
# MAIN ENTRY
#-------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
