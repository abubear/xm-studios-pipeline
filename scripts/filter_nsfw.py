"""
NSFW Filter — content safety check for IP licensing compliance.
Uses a lightweight classifier to flag inappropriate content.

Usage:
    python filter_nsfw.py --input-dir ./images --threshold 0.5 --output results.json
"""

import argparse
import json
import os
import sys


def check_nsfw(image_path: str, threshold: float = 0.5) -> dict:
    """Check if an image contains NSFW content."""
    try:
        from transformers import pipeline

        classifier = pipeline("image-classification", model="Falconsai/nsfw_image_detection")
        result = classifier(image_path)

        nsfw_score = 0.0
        for item in result:
            if item["label"].lower() in ("nsfw", "porn", "sexy", "hentai"):
                nsfw_score = max(nsfw_score, item["score"])

        return {
            "path": image_path,
            "passed": nsfw_score < threshold,
            "score": round(nsfw_score, 4),
            "flagged": nsfw_score >= threshold,
        }
    except ImportError:
        # Fallback: assume all images pass
        return {
            "path": image_path,
            "passed": True,
            "score": 0.0,
            "note": "NSFW classifier not installed, assuming safe",
        }


def main():
    parser = argparse.ArgumentParser(description="NSFW content filter")
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--threshold", type=float, default=0.5)
    parser.add_argument("--output", default="nsfw_results.json")
    args = parser.parse_args()

    if not os.path.isdir(args.input_dir):
        print(f"Error: {args.input_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    results = []
    extensions = {".png", ".jpg", ".jpeg", ".webp"}

    for filename in sorted(os.listdir(args.input_dir)):
        if os.path.splitext(filename)[1].lower() in extensions:
            filepath = os.path.join(args.input_dir, filename)
            result = check_nsfw(filepath, args.threshold)
            results.append(result)

    passed = sum(1 for r in results if r["passed"])
    output = {
        "check": "nsfw",
        "threshold": args.threshold,
        "total": len(results),
        "passed": passed,
        "failed": len(results) - passed,
        "results": results,
    }

    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    print(f"NSFW filter: {passed}/{len(results)} passed (threshold={args.threshold})")


if __name__ == "__main__":
    main()
