"""
pHash Deduplication — removes near-duplicate images via perceptual hashing.

Usage:
    python filter_phash_dedup.py --input-dir ./images --threshold 10 --output results.json
"""

import argparse
import json
import os
import sys


def compute_phash(image_path: str, hash_size: int = 8) -> str:
    """Compute perceptual hash of an image."""
    try:
        from PIL import Image
        import numpy as np

        img = Image.open(image_path).convert("L").resize((hash_size + 1, hash_size), Image.LANCZOS)
        pixels = np.array(img)
        diff = pixels[:, 1:] > pixels[:, :-1]
        return "".join(str(int(b)) for b in diff.flatten())
    except ImportError:
        # Fallback: hash the file bytes
        import hashlib
        with open(image_path, "rb") as f:
            return hashlib.md5(f.read()).hexdigest()[:16]


def hamming_distance(hash1: str, hash2: str) -> int:
    """Compute Hamming distance between two hashes."""
    return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))


def main():
    parser = argparse.ArgumentParser(description="pHash deduplication filter")
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--threshold", type=int, default=10, help="Max Hamming distance for duplicate")
    parser.add_argument("--output", default="phash_results.json")
    args = parser.parse_args()

    if not os.path.isdir(args.input_dir):
        print(f"Error: {args.input_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    extensions = {".png", ".jpg", ".jpeg", ".webp"}
    images = []

    for filename in sorted(os.listdir(args.input_dir)):
        if os.path.splitext(filename)[1].lower() in extensions:
            filepath = os.path.join(args.input_dir, filename)
            phash = compute_phash(filepath)
            images.append({"path": filepath, "filename": filename, "hash": phash})

    # Find duplicates
    duplicates = set()
    for i in range(len(images)):
        if i in duplicates:
            continue
        for j in range(i + 1, len(images)):
            if j in duplicates:
                continue
            dist = hamming_distance(images[i]["hash"], images[j]["hash"])
            if dist <= args.threshold:
                duplicates.add(j)

    results = []
    for i, img in enumerate(images):
        is_dup = i in duplicates
        results.append({
            "path": img["path"],
            "passed": not is_dup,
            "hash": img["hash"][:16],
            "is_duplicate": is_dup,
        })

    passed = sum(1 for r in results if r["passed"])
    output = {
        "check": "phash_dedup",
        "threshold": args.threshold,
        "total": len(results),
        "passed": passed,
        "failed": len(results) - passed,
        "results": results,
    }

    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    print(f"pHash dedup: {passed}/{len(results)} unique (removed {len(results) - passed} duplicates)")


if __name__ == "__main__":
    main()
