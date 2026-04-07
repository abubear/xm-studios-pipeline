"""
Sharpness Check — Laplacian variance filter.
Rejects blurry generated images below a threshold.

Usage:
    python filter_sharpness.py --input-dir ./images --threshold 100 --output results.json
"""

import argparse
import json
import os
import sys

def check_sharpness(image_path: str, threshold: float = 100.0) -> dict:
    """Calculate Laplacian variance as a sharpness metric."""
    try:
        import cv2
        import numpy as np

        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return {"path": image_path, "passed": False, "score": 0, "error": "Could not load image"}

        laplacian = cv2.Laplacian(img, cv2.CV_64F)
        variance = float(np.var(laplacian))

        return {
            "path": image_path,
            "passed": variance >= threshold,
            "score": round(variance, 2),
        }
    except ImportError:
        # Fallback without OpenCV
        file_size = os.path.getsize(image_path) if os.path.exists(image_path) else 0
        score = file_size / 1000  # Rough proxy
        return {
            "path": image_path,
            "passed": score >= threshold,
            "score": round(score, 2),
            "note": "OpenCV not installed, using file size proxy",
        }


def main():
    parser = argparse.ArgumentParser(description="Sharpness filter for generated images")
    parser.add_argument("--input-dir", required=True, help="Directory of images to check")
    parser.add_argument("--threshold", type=float, default=100.0, help="Minimum Laplacian variance")
    parser.add_argument("--output", default="sharpness_results.json", help="Output JSON file")
    args = parser.parse_args()

    if not os.path.isdir(args.input_dir):
        print(f"Error: {args.input_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    results = []
    extensions = {".png", ".jpg", ".jpeg", ".webp"}

    for filename in sorted(os.listdir(args.input_dir)):
        if os.path.splitext(filename)[1].lower() in extensions:
            filepath = os.path.join(args.input_dir, filename)
            result = check_sharpness(filepath, args.threshold)
            results.append(result)

    passed = sum(1 for r in results if r["passed"])
    failed = len(results) - passed

    output = {
        "check": "sharpness",
        "threshold": args.threshold,
        "total": len(results),
        "passed": passed,
        "failed": failed,
        "results": results,
    }

    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Sharpness check: {passed}/{len(results)} passed (threshold={args.threshold})")


if __name__ == "__main__":
    main()
