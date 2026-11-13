"""Original artwork for the Frequencies hero card (own work, Samay Vashsht).

Drawn from scratch with numpy + Pillow: a cosmic indigo/purple gradient with soft nebula
clouds and star specks, and a simple glowing neon wireframe of a person sleeping on a
pillow, a soft glow around the head and a faint frequency wave. No reference image is read, traced or embedded.

Run: python3 tools/art/frequencies_hero.py
Writes assets/hero/frequencies-hero@2x.png and @3x.png (card art, 400 x 132 pt).
"""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W_PT, H_PT = 400, 132
SS = 4  # supersampling for clean lines
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'hero')
rng = np.random.default_rng(963)


def lerp(a, b, t):
    return a + (b - a) * t


def background(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u, v = x / w, y / h
    deep = np.array([10, 12, 46], np.float32)      # night indigo
    mid = np.array([44, 22, 104], np.float32)      # violet
    edge = np.array([76, 29, 149], np.float32)     # purple (app accent family)
    t = np.clip(u * 0.8 + v * 0.25, 0, 1)[..., None]
    img = lerp(deep, mid, t)
    img = lerp(img, edge, np.clip((u - 0.6) * 1.6, 0, 1)[..., None] * 0.6)
    # nebula clouds: soft gaussian blobs, blue and magenta
    for cx, cy, r, col, a in [(0.72, 0.35, 0.28, (59, 130, 246), 0.35), (0.88, 0.75, 0.22, (192, 38, 211), 0.30),
                              (0.55, 0.85, 0.30, (99, 102, 241), 0.25), (0.97, 0.15, 0.18, (236, 72, 153), 0.18)]:
        d2 = ((u - cx) * (w / h)) ** 2 + (v - cy) ** 2
        g = np.exp(-d2 / (2 * (r * 0.6) ** 2))[..., None] * a
        img = img * (1 - g) + np.array(col, np.float32) * g
    # darker left side so the title stays readable
    shade = np.clip(1 - u / 0.55, 0, 1)[..., None] ** 1.5 * 0.55
    img = img * (1 - shade) + np.array([8, 8, 30], np.float32) * shade
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGB')


def stars(draw, w, h, n):
    for _ in range(n):
        x, y = rng.uniform(0.25, 1.0) * w, rng.uniform(0, 1) * h
        r = rng.choice([0.6, 0.8, 1.0, 1.4]) * SS
        a = int(rng.uniform(90, 230))
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(235, 230, 255, a))


def ellipse_pts(cx, cy, rx, ry, rot=0.0, n=90, a0=0.0, a1=2 * math.pi):
    c, s = math.cos(rot), math.sin(rot)
    out = []
    for i in range(n + 1):
        t = a0 + (a1 - a0) * i / n
        x, y = rx * math.cos(t), ry * math.sin(t)
        out.append((cx + x * c - y * s, cy + x * s + y * c))
    return out


def sleeper(draw, w, h, col):
    """Wireframe of a person lying on their side under the stars, head resting on a pillow.
    The body is cross-section rings along a gently curved spine, with a radius profile
    for shoulder, waist, hip and legs."""
    lw = max(1, int(1.15 * SS * (w / (W_PT * SS)) / 2.2))
    s = h / 132.0
    base_y = 0.86 * h  # mattress line
    # pillow (soft rounded outline)
    px, pw, ph = 0.585 * w, 30 * s, 8 * s
    draw.line(ellipse_pts(px, base_y - ph, pw, ph), fill=col + (170,), width=lw)
    # head resting on the pillow, rings like a globe
    hr = 15 * s
    hx, hy = px + 2 * s, base_y - 2 * ph - hr + 3 * s
    draw.line(ellipse_pts(hx, hy, hr, hr), fill=col + (255,), width=lw)
    for k in (-0.55, -0.15, 0.25, 0.62):
        q = math.sqrt(1 - k * k)
        draw.line(ellipse_pts(hx, hy + k * hr, hr * q, hr * 0.22 * q), fill=col + (160,), width=lw)
    for k in (0.3, 0.65):
        draw.line(ellipse_pts(hx, hy, hr * k, hr), fill=col + (160,), width=lw)
    # body along a spine from the neck to the feet
    x0, x1 = hx + hr * 0.62, 0.985 * w
    prof = [(0.00, 6), (0.07, 15), (0.18, 15), (0.33, 11), (0.47, 15), (0.60, 12), (0.75, 8), (0.88, 6.5), (1.00, 5)]
    def rad(t):
        for (ta, ra), (tb, rb) in zip(prof, prof[1:]):
            if t <= tb:
                u = (t - ta) / (tb - ta)
                u = 0.5 - 0.5 * math.cos(math.pi * u)
                return (ra + (rb - ra) * u) * s
        return prof[-1][1] * s
    def spine(t):
        return base_y - rad(t) * 0.95 - 1.5 * s * math.sin(math.pi * t)
    ts = np.linspace(0, 1, 120)
    xs = [lerp(x0, x1, t) for t in ts]
    draw.line([(x, spine(t) - rad(t)) for x, t in zip(xs, ts)], fill=col + (255,), width=lw)
    draw.line([(x, spine(t) + rad(t) * 0.9) for x, t in zip(xs, ts)], fill=col + (220,), width=lw)
    for k in (-0.45, 0.35):
        draw.line([(x, spine(t) + rad(t) * k) for x, t in zip(xs, ts)], fill=col + (120,), width=lw)
    for i in range(1, 22):
        t = i / 22
        x, yc, r = lerp(x0, x1, t), spine(t), rad(t)
        draw.line(ellipse_pts(x - 0.0, yc - 0.05 * r, 3.2 * s, r * 0.95, n=36, a0=-math.pi / 2, a1=math.pi / 2), fill=col + (140,), width=lw)
    # arm folded forward under the pillow
    ax = lerp(x0, x1, 0.10)
    draw.line([(ax, spine(0.10)), (ax - 6 * s, base_y - 9 * s), (px - 10 * s, base_y - 6 * s)], fill=col + (210,), width=lw, joint='curve')
    # mattress line
    draw.line([(0.50 * w, base_y + 2 * s), (w, base_y + 2 * s)], fill=col + (70,), width=lw)
    return hx, hy, hr


def wave(draw, w, h, col):
    """A faint frequency wave drifting over the sky."""
    lw = max(1, int(0.9 * SS * (w / (W_PT * SS)) / 2.2))
    s = h / 132.0
    for j, (amp, ph, al) in enumerate([(9, 0.0, 120), (6, 1.3, 80)]):
        pts = []
        for i in range(200):
            u = i / 199
            x = lerp(0.42 * w, w, u)
            env = math.sin(math.pi * u)
            pts.append((x, 0.26 * h + j * 6 * s + amp * s * env * math.sin(2 * math.pi * 5.5 * u + ph)))
        draw.line(pts, fill=col + (al,), width=lw)


def render(scale):
    w, h = W_PT * scale * SS, H_PT * scale * SS
    base = background(w // SS, h // SS).resize((w, h), Image.BICUBIC).convert('RGBA')
    sky = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    stars(ImageDraw.Draw(sky), w, h, 90)
    base = Image.alpha_composite(base, sky)
    lines = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lines)
    wave(ld, w, h, (103, 232, 249))
    hx, hy, hr = sleeper(ld, w, h, (196, 181, 253))
    # soft glow behind the head
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i, a in enumerate([55, 80, 120]):
        r = hr * (2.2 - 0.5 * i)
        gd.ellipse([hx - r, hy - r, hx + r, hy + r], fill=(232, 121, 249, a))
    glow = glow.filter(ImageFilter.GaussianBlur(hr * 0.6))
    base = Image.alpha_composite(base, glow)
    # neon: blurred copy of the wireframe under the sharp one
    halo = lines.filter(ImageFilter.GaussianBlur(3 * SS * scale / 2))
    wide = lines.filter(ImageFilter.GaussianBlur(8 * SS * scale / 2))
    for layer in (wide, wide, halo, halo, halo):
        base = Image.alpha_composite(base, layer)
    base = Image.alpha_composite(base, lines)
    return base.resize((W_PT * scale, H_PT * scale), Image.LANCZOS).convert('RGB')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for sc in (2, 3):
        p = os.path.join(OUT, f'frequencies-hero@{sc}x.png')
        render(sc).save(p, optimize=True)
        print(p, os.path.getsize(p))
