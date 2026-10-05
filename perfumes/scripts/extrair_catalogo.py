"""
Gera o catálogo do site a partir da lista de preços em PDF.

    pip install pymupdf pillow
    python scripts/extrair_catalogo.py caminho/para/LISTA.pdf

Saída:
    lib/catalogo.json        produtos (código, marca, nome, preço, imagem...)
    public/produtos/*.webp   uma foto por produto, recortada do PDF

Rode de novo sempre que chegar uma lista nova: os produtos e preços são substituídos.
"""

import json
import re
import sys
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_JSON = ROOT / "lib" / "catalogo.json"
OUT_IMG = ROOT / "public" / "produtos"
IMG_MAX = 720  # lado maior da foto, em px

CODE_RE = re.compile(r"^\d{3,5}-\d$")

# Nome de exibição de cada marca (como aparece no cabeçalho do PDF)
BRANDS = {
    "ARMAF": "Armaf",
    "AFEER": "Afeer",
    "AFNAN": "Afnan",
    "ASDAAF": "Asdaaf",
    "AL HARAMAIN": "Al Haramain",
    "AURORA SCENTS": "Aurora Scents",
    "BHARARA": "Bharara",
    "FRENCH AVENUE": "French Avenue",
    "LATTAFA": "Lattafa",
    "MAISON ALHAMBRA": "Maison Alhambra",
    "ORIENTICA LUXURY COLLECTION": "Orientica",
    "RASASI": "Rasasi",
    "RAYHAAN": "Rayhaan",
    "RISALA": "Risala",
    "SAQR": "Saqr",
    "PROMO": "Linha Promo",
    "AL WATANIAH": "Al Wataniah",
    "XERJOFF": "Xerjoff",
    "VICTORIA'S SECRET": "Victoria's Secret",
    "KARSEELL": "Karseell",
}

# Prefixos de marca que se repetem dentro da descrição e saem do nome
BRAND_PREFIXES = [
    "RISALA BY ARMAF", "ORIENTICA LUXURY", "ORIENTICA", "MAISON ALHAMBRA", "AL WATANIAH",
    "AL HARAMAIN", "AURORA SCENTS", "FRENCH AVENUE", "VICTORIA'S SECRET", "ARMAF", "AFEER",
    "AFNAN", "ASDAAF", "BHARARA", "LATTAFA", "RASASI", "RAYHAAN", "SAQR", "PROMO", "XERJOFF",
    "KARSEELL",
]

# Correções pontuais de digitação na lista do fornecedor
FIXES = {
    "BA HA MAS": "BAHAMAS",
    "OF THE WIL ": "OF THE WILD ",
    "SIVER": "SILVER",
    "MADDNES": "MADNESS",
    "EDP100ML": "EDP 100ML",
    "250MG": "250G",
    "HONOR&GLORY": "HONOR & GLORY",
}

# Nomes reescritos à mão (itens de cuidado com descrição em espanhol/abreviada)
OVERRIDES = {
    "9099-5": dict(name="Maca Power Repair · Máscara capilar", size="500 ml"),
    "9100-8": dict(name="Maca Power · Shampoo", size="500 ml"),
    "9104-6": dict(name="Kit viagem Maca · máscara, shampoo e condicionador", size="3 peças"),
    "9106-0": dict(name="Maca Power Collagen · Sachês", size="24 × 10 ml"),
    "9107-7": dict(name="Sachês shampoo + condicionador", size="24 + 24 × 10 ml"),
    "8233-4": dict(name="Óleo capilar", size="50 ml"),
    "8917-3": dict(name="Rush · Body Splash"),
}

SMALL_WORDS = {"DE", "DI", "DU", "OF", "THE", "BY", "AND", "FOR", "TO", "ON", "IN", "LA", "LE", "AL"}
KEEP_UPPER = {"I", "II", "III", "IV", "XV"}

CONCENTRATIONS = [
    (r"\bEXTRAIT EDP\b", "Extrait de Parfum"),
    (r"\bEXTRAIT\b", "Extrait de Parfum"),
    (r"\bEXT\b", "Extrait de Parfum"),
    (r"\bPARFUM\b", "Parfum"),
    (r"\bEDP\b", "Eau de Parfum"),
    (r"\bEDT\b", "Eau de Toilette"),
]


def title_word(w: str, first: bool) -> str:
    if w in KEEP_UPPER or any(c.isdigit() for c in w):
        return w
    if w == "&":
        return w
    if not first and w in SMALL_WORDS and w != "AL":
        return w.lower()
    if "'" in w:
        head, _, tail = w.partition("'")
        if len(head) == 1:  # D'ANTIQUITES, L'AUTRE
            return head + "'" + tail.capitalize()
        return head.capitalize() + "'" + tail.lower()
    return w.capitalize()


def title(s: str) -> str:
    words = s.split()
    return " ".join(title_word(w, i == 0) for i, w in enumerate(words))


def analyze(img: Image.Image):
    """Cor dominante (ignorando o fundo branco) e se a foto é de estúdio, em fundo claro."""
    small = img.resize((64, 64), Image.Resampling.BOX)
    px = list(small.get_flattened_data() if hasattr(small, "get_flattened_data") else small.getdata())
    w, h = small.size

    # fundo claro: boa parte dos pixels quase brancos ou cantos claros
    white = sum(1 for c in px if min(c) > 232) / len(px)
    corners = 0
    for cx, cy in [(0, 0), (w - 4, 0), (0, h - 4), (w - 4, h - 4)]:
        region = [small.getpixel((cx + i, cy + j)) for i in range(4) for j in range(4)]
        if sum(1 for c in region if min(c) > 225) >= 12:
            corners += 1
    cutout = white >= 0.05 or corners >= 2

    def sat(c):
        return max(c) - min(c)

    colored = [c for c in px if min(c) < 225 and sat(c) > 28] or [c for c in px if min(c) < 225] or px
    r = sum(c[0] for c in colored) // len(colored)
    g = sum(c[1] for c in colored) // len(colored)
    b = sum(c[2] for c in colored) // len(colored)
    return "#%02x%02x%02x" % (r, g, b), cutout


def parse(desc: str, brand_key: str, code: str):
    s = " " + desc.upper() + " "
    for a, b in FIXES.items():
        s = s.replace(a, b)
    # separa tamanhos/gêneros grudados por hífen: "100ML-FEM", "MASC-100ML", "EDP-MASC"
    s = re.sub(r"(\d)(ML|G)\s*-\s*", r"\1\2 ", s)
    s = re.sub(r"\s-\s*(?=[A-Z])", " ", s)
    s = re.sub(r"(MASC|FEM|EDP)-(?=\S)", r"\1 ", s)
    s = re.sub(r"\s+", " ", s)

    s = re.sub(r"^ PERFUME ", " ", s)

    # categoria
    if brand_key == "KARSEELL":
        category = "cuidados"
    elif "BODY CREAM" in s:
        category = "cuidados"
    elif "SPLASH" in s or "MIST" in s:
        category = "body"
    elif re.search(r"\bKIT\b", s) or re.search(r"\d\s*X\s*\d+ML", s):
        category = "kit"
    else:
        category = "perfume"

    kind = None
    for pat, label in [
        (r"BODY SPLASH \(MIST\)", "Body Mist"),
        (r"BODY AND HAIR SPLASH", "Body & Hair Splash"),
        (r"BODY SPLASH", "Body Splash"),
        (r"\bSPLASH\b", "Body Splash"),
        (r"BODY CREAM", "Creme corporal"),
    ]:
        if re.search(pat, s):
            kind = label
            s = re.sub(pat, " ", s, count=1)
            break

    # tamanho
    size = None
    m = re.search(r"(\d+)\s*PCS\s*X?\s*(\d+)\s*ML", s)
    if m:
        size = f"{m.group(1)} × {m.group(2)} ml"
        s = s[: m.start()] + " " + s[m.end():]
    else:
        m = re.search(r"(\d+)\s*PCS\s+(\d+)\s*ML", s) or re.search(r"(\d+)\s*X\s*(\d+)\s*ML", s)
        if m:
            size = f"{m.group(1)} × {m.group(2)} ml"
            s = s[: m.start()] + " " + s[m.end():]
        else:
            m = re.search(r"\b(\d+)\s*(ML|G)\b", s)
            if m:
                size = f"{m.group(1)} {m.group(2).lower()}"
                s = s[: m.start()] + " " + s[m.end():]

    # concentração
    concentration = None
    for pat, label in CONCENTRATIONS:
        if re.search(pat, s):
            concentration = concentration or label
            s = re.sub(pat, " ", s)

    # gênero
    gender = None
    for pat, g in [
        (r"\bUNISEX\b", "unissex"),
        (r"\bMASC\b", "masculino"),
        (r"\bFEM\b", "feminino"),
        (r"\bF\b(?=\s*$)|\bF\b(?= )", "feminino"),
        (r"\bU\s*$", "unissex"),
    ]:
        if re.search(pat, s):
            gender = gender or g
            s = re.sub(pat, " ", s)
    if not gender:
        if re.search(r"\b(FOR MEN|MEN|MAN|HOMME|POUR HOMME)\b", s):
            gender = "masculino"
        elif re.search(r"\b(FOR WOMEN|WOMEN|WOMAN|FEMME|FOR HER)\b", s):
            gender = "feminino"

    s = re.sub(r"\(MIST\)", " ", s)
    s = re.sub(r"\bKIT\b", " ", s)
    s = re.sub(r"\s+", " ", s).strip(" -")
    for p in BRAND_PREFIXES:
        if s.startswith(p + " "):
            s = s[len(p) + 1:]
            break
    s = s.strip(" -")

    name = title(s) if s else ""
    if category == "kit":
        name = "Kit " + name
    if kind and category == "body":
        name = f"{name} · {kind}"
    elif kind:
        name = f"{name} · {kind}"

    item = dict(name=name, size=size, concentration=concentration, gender=gender, category=category)
    item.update(OVERRIDES.get(code, {}))
    return item


def main(pdf_path: str):
    doc = pymupdf.open(pdf_path)
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    for old in OUT_IMG.glob("*.webp"):
        old.unlink()

    products = []
    brand = None
    for pno, page in enumerate(doc):
        # cabeçalhos de marca: texto grande dentro da faixa preta
        headers = []
        for b in page.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                for sp in l["spans"]:
                    t = sp["text"].strip()
                    if t and sp["size"] >= 13 and "COSMÉTICOS" not in t:
                        y0, y1 = sp["bbox"][1], sp["bbox"][3]
                        headers.append(((y0 + y1) / 2, " ".join(t.split())))

        words = page.get_text("words")
        rows = []
        for w in words:
            x0, y0, x1, y1, t = w[:5]
            if x1 < 100 and CODE_RE.match(t):
                rows.append(dict(code=t, yc=(y0 + y1) / 2, desc=[], price=None, rects=[]))
        rows.sort(key=lambda r: r["yc"])

        def nearest(y, tol):
            best = min(rows, key=lambda r: abs(r["yc"] - y), default=None)
            return best if best and abs(best["yc"] - y) < tol else None

        for w in words:
            x0, y0, x1, y1, t = w[:5]
            yc = (y0 + y1) / 2
            if CODE_RE.match(t) and x1 < 100:
                continue
            if x0 >= 60 and x1 <= 360:
                r = nearest(yc, 30)
                if r:
                    r["desc"].append((round(yc), x0, t))
            elif x0 > 480 and re.match(r"^[\d.,]+$", t):
                r = nearest(yc, 30)
                if r:
                    r["price"] = float(t.replace(",", ""))

        for info in page.get_image_info():
            x0, y0, x1, y1 = info["bbox"]
            if x0 < 300:
                continue
            r = nearest((y0 + y1) / 2, 60)
            if r:
                r["rects"].append(pymupdf.Rect(x0, y0, x1, y1))

        events = [(r["yc"], "row", r) for r in rows] + [(y, "brand", t) for y, t in headers]
        events.sort(key=lambda e: e[0])
        pending = []
        for _, kind, v in events:
            if kind == "brand":
                pending.append(v)
                continue
            if pending:
                brand = " ".join(" ".join(pending).split())
                pending = []
            desc = " ".join(t for _, _, t in sorted(v["desc"]))
            info = parse(desc, brand, v["code"])
            image = None
            tone, cutout = "#8a6a45", False
            if v["rects"]:
                rect = v["rects"][0]
                for extra in v["rects"][1:]:
                    rect |= extra
                rect = rect + (0.6, 0.6, -0.6, -0.6)  # tira a borda da célula
                zoom = IMG_MAX / max(rect.width, rect.height)
                pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=rect, alpha=False)
                img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                image = f"/produtos/{v['code']}.webp"
                img.save(OUT_IMG / f"{v['code']}.webp", "WEBP", quality=78, method=6)
                tone, cutout = analyze(img)
            products.append(
                dict(
                    code=v["code"],
                    brand=BRANDS.get(brand, title(brand or "")),
                    price=v["price"],
                    image=image,
                    tone=tone,
                    cutout=cutout,
                    **info,
                )
            )
        if pending:
            brand = " ".join(" ".join(pending).split())

    OUT_JSON.write_text(json.dumps(products, ensure_ascii=False, separators=(",", ":")).replace("},{", "},\n{"))
    print(f"{len(products)} produtos · {sum(1 for p in products if p['image'])} fotos")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("uso: python scripts/extrair_catalogo.py LISTA.pdf")
    main(sys.argv[1])
