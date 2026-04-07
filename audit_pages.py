"""
XM Studios Pipeline — Visual Audit Script
Logs in, visits every page, takes full-page screenshots, reports console errors.
Screenshots saved to /tmp/xm-audit/
"""

import os
import json
import pathlib
from playwright.sync_api import sync_playwright, Page

EMAIL = "admin@xmstudios.com"
PASSWORD = "password123"
BASE = "http://localhost:3000"
OUT = pathlib.Path("/tmp/xm-audit")
OUT.mkdir(parents=True, exist_ok=True)

# Known session IDs from seed data
SESSION_IDS = {
    "spider-man": "aaaa1111-1111-1111-1111-111111111111",
    "batman":     "bbbb2222-2222-2222-2222-222222222222",
    "darth-vader":"cccc3333-3333-3333-3333-333333333333",
}
SID = SESSION_IDS["spider-man"]  # stage 3, active — best for pipeline pages

ROUTES = [
    # Public
    ("register",            "/register",                          False),
    ("login",               "/login",                             False),
    # Main apps
    ("dashboard",           "/dashboard",                         True),
    ("scene-composer",      "/scene-composer",                    True),
    ("scene-composer-session", f"/scene-composer/{SID}",         True),
    ("jury",                "/jury",                              True),
    ("jury-session",        f"/jury/{SID}",                      True),
    ("imagination-studio",  "/imagination-studio",                True),
    ("character-library",   "/character-library",                 True),
    ("store-content",       "/store-content",                     True),
    ("store-content-session", f"/store-content/{SID}",           True),
    ("admin",               "/admin",                             True),
    # ComfyUI pipeline
    ("generation",          f"/generation/{SID}",                True),
    ("generation-filter",   f"/generation/{SID}/filter",         True),
    ("pipeline-turnaround", f"/pipeline/{SID}/turnaround",       True),
    ("pipeline-3d",         f"/pipeline/{SID}/3d",               True),
    ("pipeline-factory",    f"/pipeline/{SID}/factory",          True),
]

def screenshot(page: Page, name: str) -> str:
    path = str(OUT / f"{name}.png")
    page.screenshot(path=path, full_page=True)
    return path

def collect_errors(page: Page) -> list[str]:
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    return errors

def login(page: Page):
    page.goto(f"{BASE}/login", wait_until="networkidle")
    # Wait for React to hydrate — button must be enabled
    page.wait_for_selector('button[type="submit"]:not([disabled])', timeout=10000)
    page.locator('input[name="email"]').fill(EMAIL)
    page.locator('input[name="password"]').fill(PASSWORD)
    # Small pause so React state is settled before submit
    page.wait_for_timeout(500)
    page.locator('button[type="submit"]').click()
    # Wait for navigation — server action redirect to /dashboard
    try:
        page.wait_for_url(f"**/dashboard**", timeout=20000)
    except Exception:
        pass
    page.wait_for_load_state("networkidle", timeout=10000)
    current = page.url
    if "/login" in current:
        err_text = ""
        try:
            err_text = page.inner_text(".text-red-400", timeout=1000)
        except Exception:
            pass
        raise Exception(f"Still on login page. Error: '{err_text}'. URL: {current}")
    print(f"  OK Logged in -> {current}")

def main():
    report = []
    print(f"\nXM Studios Visual Audit\n{'-'*50}")
    print(f"Output: {OUT}\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        console_errors: list[str] = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        # Login first
        print("Logging in...")
        try:
            login(page)
        except Exception as e:
            print(f"  XX Login failed: {e}")
            print("  Cannot proceed with authenticated pages. Check that dev server + Supabase are running.")
            browser.close()
            return

        # Visit each route
        for name, path, needs_auth in ROUTES:
            console_errors.clear()
            url = BASE + path
            print(f"  {path}")

            try:
                resp = page.goto(url, wait_until="networkidle", timeout=15000)
                status = resp.status if resp else 0

                # Check for crash indicators
                content = page.content()
                crashed = any(x in content for x in [
                    "Application error",
                    "Internal Server Error",
                    "TypeError",
                    "ReferenceError",
                    "unhandled",
                ])
                # Check if page is essentially blank (less than 500 chars of body text)
                body_text = page.inner_text("body") if not crashed else ""
                blank = len(body_text.strip()) < 200

                shot = screenshot(page, name)
                errs = list(console_errors)

                status_icon = "OK" if (not crashed and not blank and status < 400) else "XX"
                issues = []
                if crashed:   issues.append("CRASHED")
                if blank:     issues.append("BLANK")
                if errs:      issues.append(f"{len(errs)} console error(s)")
                if status >= 400: issues.append(f"HTTP {status}")

                label = f"[{', '.join(issues)}]" if issues else "[OK]"
                print(f"    {status_icon} {label}")
                if errs:
                    for e in errs[:3]:
                        print(f"       └ {e[:120]}")

                report.append({
                    "name": name,
                    "url": url,
                    "status": status,
                    "crashed": crashed,
                    "blank": blank,
                    "console_errors": errs,
                    "screenshot": shot,
                    "ok": not crashed and not blank and status < 400,
                })

            except Exception as ex:
                print(f"    XX [EXCEPTION] {ex}")
                report.append({
                    "name": name,
                    "url": url,
                    "status": 0,
                    "crashed": True,
                    "blank": False,
                    "console_errors": [str(ex)],
                    "screenshot": None,
                    "ok": False,
                })

        browser.close()

    # Summary
    ok = sum(1 for r in report if r["ok"])
    broken = [r for r in report if not r["ok"]]
    print(f"\n{'-'*50}")
    print(f"Results: {ok}/{len(report)} pages OK")
    if broken:
        print(f"\nBroken pages:")
        for r in broken:
            print(f"  XX {r['url']}")
            for e in r["console_errors"][:2]:
                print(f"     └ {e[:100]}")

    # Save report
    report_path = OUT / "audit_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\nFull report: {report_path}")
    print(f"Screenshots: {OUT}/\n")

if __name__ == "__main__":
    main()
