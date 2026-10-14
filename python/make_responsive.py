import os
import re

# ഫയലുകൾ ഉള്ള മെയിൻ ഫോൾഡർ
BASE_DIR = "/storage/emulated/0/G/manhajulhidaya.vercel.app/"
CSS_DIR = os.path.join(BASE_DIR, "css")

VIEWPORT_TAG = '    <meta name="viewport" content="width=device-width, initial-scale=1.0">'

# CSS ഫയലുകളുടെ തുടക്കത്തിൽ ചേർക്കേണ്ട ബേസ് റീസെറ്റ്
BASE_CSS = """/* --- RESPONSIVE BASE RESET --- */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html, body {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    -webkit-text-size-adjust: 100%;
}

img, video, iframe, svg {
    max-width: 100%;
    height: auto;
    display: block;
}

.container {
    width: 92%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
}
"""

# CSS ഫയലുകളുടെ അവസാനം ചേർക്കേണ്ട മീഡിയ ക്വറികൾ (മൊബൈൽ മുതൽ ടിവി വരെ)
RESPONSIVE_QUERIES = """
/* --- RESPONSIVE MEDIA QUERIES (Mobile to TV) --- */

/* 1. ചെറിയ ഫോണുകൾ (Small Phones: 600px-ൽ താഴെ) */
@media (max-width: 600px) {
    body {
        font-size: 14px;
    }
    .container {
        width: 95%;
        padding: 6px;
    }
    /* വരിയായി വരുന്ന ഘടകങ്ങൾ മൊബൈലിൽ ഒന്നിന് താഴെ ഒന്നായി വരാൻ */
    .row, .flex, [class*="flex-row"] {
        flex-direction: column !important;
    }
}

/* 2. ടാബ്‌ലെറ്റുകൾ (Tablets: 601px മുതൽ 1024px വരെ) */
@media (min-width: 601px) and (max-width: 1024px) {
    body {
        font-size: 15px;
    }
    .container {
        width: 90%;
    }
}

/* 3. ഡെസ്ക്ടോപ്പ് മോണിറ്ററുകൾ (1025px മുതൽ 1440px വരെ) */
@media (min-width: 1025px) and (max-width: 1440px) {
    body {
        font-size: 16px;
    }
}

/* 4. സ്മാർട്ട് ടിവി & വലിയ സ്ക്രീനുകൾ (TV / Ultra-wide: 1441px-ന് മുകളിൽ) */
@media (min-width: 1441px) {
    body {
        font-size: 18px; /* ടിവിയിൽ ദൂരെനിന്ന് കാണുമ്പോൾ വ്യക്തത നൽകാൻ */
    }
    .container {
        max-width: 1600px;
    }
}
"""

def update_html_files():
    """എല്ലാ HTML ഫയലുകളിലും viewport meta tag ചേർക്കുന്നു"""
    if not os.path.exists(BASE_DIR):
        print(f"Directory not found: {BASE_DIR}")
        return

    for filename in os.listdir(BASE_DIR):
        if filename.endswith(".html"):
            file_path = os.path.join(BASE_DIR, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # viewport മുൻപ് ചേർത്തിട്ടില്ലെങ്കിൽ മാത്രം ചേർക്കുന്നു
            if 'name="viewport"' not in content and "name='viewport'" not in content:
                if re.search(r'<head(?:\s+[^>]*)?>', content, re.IGNORECASE):
                    content = re.sub(
                        r'(<head(?:\s+[^>]*)?>)',
                        f'\\1\n{VIEWPORT_TAG}',
                        content,
                        count=1,
                        flags=re.IGNORECASE
                    )
                else:
                    content = f"{VIEWPORT_TAG}\n" + content

                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"[HTML Updated] Viewport added to: {filename}")
            else:
                print(f"[HTML Skipped] Viewport already exists in: {filename}")

def update_css_files():
    """എല്ലാ CSS ഫയലുകളിലും ബേസ് റീസെറ്റും മീഡിയ ക്വറികളും ചേർക്കുന്നു"""
    if not os.path.exists(CSS_DIR):
        print(f"CSS directory not found: {CSS_DIR}")
        return

    for filename in os.listdir(CSS_DIR):
        if filename.endswith(".css"):
            file_path = os.path.join(CSS_DIR, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # മുൻപ് ഈ കോഡ് ചേർത്തിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുന്നു
            if "RESPONSIVE BASE RESET" not in content:
                updated_content = BASE_CSS + "\n" + content + "\n" + RESPONSIVE_QUERIES
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(updated_content)
                print(f"[CSS Updated] Responsive styles added to: {filename}")
            else:
                print(f"[CSS Skipped] Already updated: {filename}")

if __name__ == "__main__":
    print("പ്രോസസ്സ് ആരംഭിക്കുന്നു...\n")
    update_html_files()
    update_css_files()
    print("\nഎല്ലാ ഫയലുകളും വിജയകരമായി റെസ്പോൺസീവ് ആക്കി മാറ്റി!")
