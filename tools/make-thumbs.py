# 札や小さな絵に使う軽い控えを作る（docs/img/thumb/、幅 300px）。
# 作品の絵を足したら走らせる：py tools/make-thumbs.py
# tools/prerender.mjs が、書き出したページの控えの有無を確かめる（無ければ止まる）。
import glob, io, os, re, sys
from PIL import Image

DOCS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs')
OUT = os.path.join(DOCS, 'img', 'thumb')
os.makedirs(OUT, exist_ok=True)

# img/works の全部と、seed.js が直接指している img/*.jpg
seed = io.open(os.path.join(DOCS, 'js', 'seed.js'), encoding='utf-8').read()
src = set(glob.glob(os.path.join(DOCS, 'img', 'works', '*.jpg')))
for name in re.findall(r"['\"]img/([^/'\"]+\.jpg)['\"]", seed):
    src.add(os.path.join(DOCS, 'img', name))

made = 0
for f in sorted(src):
    if not os.path.exists(f):
        continue
    to = os.path.join(OUT, os.path.basename(f))
    if os.path.exists(to) and os.path.getmtime(to) >= os.path.getmtime(f):
        continue
    im = Image.open(f).convert('RGB')
    w = 300
    h = round(im.height * w / im.width)
    if im.width > w:
        im = im.resize((w, h), Image.LANCZOS)
    im.save(to, 'JPEG', quality=74, optimize=True, progressive=True)
    made += 1

total = sum(os.path.getsize(os.path.join(OUT, x)) for x in os.listdir(OUT))
print(f'thumb: made {made} / all {len(os.listdir(OUT))} / {total // 1024} KB')
