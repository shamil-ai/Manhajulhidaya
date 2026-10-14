import os
import re
import shutil

BASE_DIR = "/storage/emulated/0/G/manhajulhidaya.vercel.app/"
CSS_DIR = os.path.join(BASE_DIR, "css")
JS_DIR = os.path.join(BASE_DIR, "js")
PY_DIR = os.path.join(BASE_DIR, "python")

# ഫോൾഡറുകൾ നിർമ്മിക്കുന്നു
os.makedirs(CSS_DIR, exist_ok=True)
os.makedirs(JS_DIR, exist_ok=True)
os.makedirs(PY_DIR, exist_ok=True)

# എല്ലാ സ്ക്രീനുകൾക്കും വേണ്ടിയുള്ള റെസ്പോൺസീവ് റീസെറ്റ്
BASE_RESPONSIVE_CSS = """/* --- RESPONSIVE BASE RESET --- */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html, body {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
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

# ചെറിയ ഫോൺ മുതൽ വലിയ ടിവി വരെയുള്ള മീഡിയ ക്വറികൾ
MEDIA_QUERIES = """
/* --- MEDIA QUERIES (Mobile to TV) --- */

/* 1. ചെറിയ ഫോണുകൾ (Small Phones: 600px-ൽ താഴെ) */
@media (max-width: 600px) {
    body {
        font-size: 14px;
    }
    .container {
        width: 96%;
        padding: 5px;
    }
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
        font-size: 19px;
    }
    .container {
        max-width: 1650px;
    }
}
"""

current_script = os.path.basename(__file__)

# 1. നിലവിലുള്ള പൈത്തൺ ഫയലുകൾ python/ ഫോൾഡറിലേക്ക് മാറ്റുന്നു
for filename in os.listdir(BASE_DIR):
    if filename.endswith(".py") and filename != current_script:
        src = os.path.join(BASE_DIR, filename)
        dest = os.path.join(PY_DIR, filename)
        shutil.move(src, dest)
        print(f"[Python Moved] {filename} -> python/")

# 2. HTML ഫയലുകൾ പ്രോസസ്സ് ചെയ്യുന്നു
for filename in os.listdir(BASE_DIR):
    if filename.endswith(".html"):
        base_name = os.path.splitext(filename)[0]
        html_path = os.path.join(BASE_DIR, filename)

        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # HTML-ൽ നിന്നുള്ള <style> വേർതിരിക്കുന്നു
        styles = re.findall(r'<style(?:\s+[^>]*)?>(.*?)</style>', content, flags=re.DOTALL | re.IGNORECASE)
        css_data = "\n\n".join(s.strip() for s in styles if s.strip())

        # HTML-ൽ നിന്നുള്ള ഇൻലൈൻ <script> വേർതിരിക്കുന്നു
        scripts = re.findall(r'<script(?![^>]*\bsrc=)(?:\s+[^>]*)?>(.*?)</script>', content, flags=re.DOTALL | re.IGNORECASE)
        js_data = "\n\n".join(s.strip() for s in scripts if s.strip())

        # സിഎസ്എസ് സേവ് ചെയ്യുകയും റെസ്പോൺസീവ് കോഡുകൾ ചേർക്കുകയും ചെയ്യുന്നു
        css_file_name = f"{base_name}.css"
        full_css_content = BASE_RESPONSIVE_CSS + "\n\n" + css_data + "\n\n" + MEDIA_QUERIES
        with open(os.path.join(CSS_DIR, css_file_name), "w", encoding="utf-8") as f:
            f.write(full_css_content)

        # പഴയ <style> HTML-ൽ നിന്ന് മാറ്റുന്നു
        content = re.sub(r'<style(?:\s+[^>]*)?>.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)

        # പുതിയ CSS ലിങ്ക് head-ൽ ചേർക്കുന്നു
        css_link = f'    <link rel="stylesheet" href="css/{css_file_name}">'
        if f'href="css/{css_file_name}"' not in content:
            if re.search(r'</head>', content, re.IGNORECASE):
                content = re.sub(r'(</head>)', f'{css_link}\n\\1', content, count=1, flags=re.IGNORECASE)
            else:
                content = f"{css_link}\n" + content

        # ജാവസ്ക്രിപ്റ്റ് ഉണ്ടെങ്കിൽ js/ ഫോൾഡറിലേക്ക് സേവ് ചെയ്യുന്നു
        if js_data:
            js_file_name = f"{base_name}.js"
            with open(os.path.join(JS_DIR, js_file_name), "w", encoding="utf-8") as f:
                f.write(js_data)

            # പഴയ ഇൻലൈൻ സ്ക്രിപ്റ്റ് നീക്കം ചെയ്യുന്നു
            content = re.sub(r'<script(?![^>]*\bsrc=)(?:\s+[^>]*)?>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)

            # പുതിയ JS ലിങ്ക് body-ക്ക് മുൻപായി ചേർക്കുന്നു
            js_link = f'    <script src="js/{js_file_name}"></script>'
            if f'src="js/{js_file_name}"' not in content:
                if re.search(r'</body>', content, re.IGNORECASE):
                    content = re.sub(r'(</body>)', f'{js_link}\n\\1', content, count=1, flags=re.IGNORECASE)
                else:
                    content = content + f"\n{js_link}"

        # HTML അപ്ഡേറ്റ് ചെയ്യുന്നു
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"[Done] {filename} -> css/{css_file_name} & js/{base_name}.js (Responsive Added)")

print("\nഎല്ലാ ഫയലുകളും റെസ്പോൺസീവ് ആക്കി, CSS, JS, Python എന്നിവ വേർതിരിച്ചു കഴിഞ്ഞു!")
