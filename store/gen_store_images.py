"""Original store marketing images for Lulla: 5 screenshots (iOS 1290x2796, Android 1080x1920 + 1080x2400), Play feature graphic, 512 icon.
UI panels are drawn to match the app's screens (original design; no third-party art)."""
import os, sys, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
F = "/usr/share/fonts/opentype/inter/"
def font(w, s): return ImageFont.truetype(F + f"Inter-{w}.otf", s)

BG1, BG2, BG3 = (21, 10, 46), (42, 16, 80), (11, 42, 74)
ACC, ACC2, TXT, SUB = (167, 139, 250), (124, 58, 237), (245, 243, 255), (196, 181, 253)

def grad(w, h):
    img = Image.new("RGB", (w, h)); px = img.load()
    for y in range(h):
        t = y / h
        a, b, k = (BG1, BG2, t * 2) if t < .5 else (BG2, BG3, (t - .5) * 2)
        c = tuple(int(a[i] + (b[i] - a[i]) * k) for i in range(3))
        for x in range(w): px[x, y] = c
    return img

def icon(d, cx, cy, r, kind, col=(255, 248, 235)):
    if kind == "rain":
        d.ellipse([cx - r, cy - r * .9, cx + r, cy + r * .1], fill=col)
        for dx in (-.5, 0, .5): d.line([cx + dx * r, cy + r * .35, cx + dx * r - r * .15, cy + r * .9], fill=(150, 200, 255), width=max(3, int(r * .1)))
    elif kind == "wave":
        for i in range(3):
            y = cy - r * .5 + i * r * .5
            pts = [(cx - r + x, y + math.sin(x / r * 3.5) * r * .15) for x in range(0, int(2 * r), 4)]
            d.line(pts, fill=(140, 210, 255), width=max(4, int(r * .13)))
    elif kind == "wind":
        for i, L in enumerate((1, .75, .9)):
            y = cy - r * .5 + i * r * .5
            d.line([cx - r * L, y, cx + r * L * .8, y], fill=col, width=max(4, int(r * .12)))
    elif kind == "fire":
        d.polygon([(cx, cy - r), (cx + r * .7, cy + r * .5), (cx, cy + r), (cx - r * .7, cy + r * .5)], fill=(255, 160, 60))
        d.polygon([(cx, cy - r * .1), (cx + r * .35, cy + r * .55), (cx, cy + r * .9), (cx - r * .35, cy + r * .55)], fill=(255, 220, 120))
    elif kind == "moon":
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
        d.ellipse([cx - r * .3, cy - r * 1.1, cx + r * 1.4, cy + r * .9], fill=(40, 20, 80))
    elif kind == "leaf":
        d.ellipse([cx - r * .8, cy - r * .5, cx + r * .8, cy + r * .5], fill=(110, 220, 150))
    elif kind == "noise":
        for i in range(-3, 4):
            h = (abs(math.sin(i * 1.7)) * .8 + .2) * r
            d.rounded_rectangle([cx + i * r * .28 - r * .08, cy - h, cx + i * r * .28 + r * .08, cy + h], radius=4, fill=col)

TILES = [("Rain", "rain"), ("Ocean", "wave"), ("Wind", "wind"), ("Fireplace", "fire"), ("Night", "moon"), ("Forest", "leaf"),
         ("White Noise", "noise"), ("Creek", "wave"), ("Thunder", "rain"), ("Waterfall", "wave"), ("Fan", "wind"), ("Brown Noise", "noise"),
         ("Snow", "rain"), ("Cave", "moon"), ("Lake", "wave")]

def phone_screen(W, H, kind):
    s = W / 1290
    im = grad(W, H); d = ImageDraw.Draw(im)
    pad = int(60 * s)
    if kind != "paywall":
        d.text((pad, int(150 * s)), "Lulla", font=font("ExtraBold", int(100 * s)), fill=TXT)
        d.text((pad, int(265 * s)), "Sleep sounds, softly.", font=font("Regular", int(42 * s)), fill=SUB)

    if kind in ("grid", "playing", "mix"):
        pill = "Free: 2:41 left" if kind == "grid" else "Premium"
        pf = font("Bold", int(40 * s)); tw = d.textlength(pill, font=pf)
        x0 = W - pad - tw - int(60 * s)
        d.rounded_rectangle([x0, int(170 * s), W - pad, int(260 * s)], radius=int(45 * s), fill=(80, 55, 140) if kind == "grid" else (30, 90, 80))
        d.text((x0 + int(30 * s), int(185 * s)), pill, font=pf, fill=TXT if kind == "grid" else (110, 231, 183))
        gx, gy, g = pad, int(420 * s), int(26 * s)
        cell = (W - 2 * pad - 2 * g) // 3
        on = {0, 3} if kind in ("playing", "mix") else set()
        for i, (name, ic) in enumerate(TILES):
            r_, c_ = divmod(i, 3)
            x, y = gx + c_ * (cell + g), gy + r_ * (cell + g)
            d.rounded_rectangle([x, y, x + cell, y + cell], radius=int(44 * s), fill=(120, 95, 200) if i in on else (50, 32, 92), outline=ACC if i in on else None, width=4)
            icon(d, x + cell // 2, y + int(cell * .42), int(cell * .2), ic)
            nf = font("SemiBold", int(38 * s)); w = d.textlength(name, font=nf)
            d.text((x + (cell - w) / 2, y + int(cell * .74)), name, font=nf, fill=TXT)
        by = H - int(330 * s)
        d.rounded_rectangle([pad, by, W - pad, by + int(230 * s)], radius=int(80 * s), fill=(24, 12, 54), outline=(95, 75, 160), width=3)
        d.ellipse([W // 2 - int(80 * s), by + int(35 * s), W // 2 + int(80 * s), by + int(195 * s)], fill=ACC2)
        if kind == "grid":
            d.polygon([(W // 2 - 22 * s, by + 80 * s), (W // 2 - 22 * s, by + 150 * s), (W // 2 + 40 * s, by + 115 * s)], fill=(255, 255, 255))
        else:
            for dx in (-28, 14): d.rounded_rectangle([W // 2 + dx * s, by + 80 * s, W // 2 + (dx + 14) * s, by + 150 * s], radius=4, fill=(255, 255, 255))
        sf = font("SemiBold", int(36 * s))
        d.text((pad + int(70 * s), by + int(85 * s)), "Mix" if kind == "grid" else "Mix · 2", font=sf, fill=SUB)
        d.text((W - pad - int(210 * s), by + int(85 * s)), "Timer" if kind != "playing" else "29:51", font=sf, fill=SUB)
        if kind == "mix":
            sy = int(H * .5)
            ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
            od.rectangle([0, 0, W, H], fill=(0, 0, 0, 120))
            im = Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB"); d = ImageDraw.Draw(im)
            d.rounded_rectangle([0, sy, W, H + 80], radius=int(70 * s), fill=(29, 15, 61))
            d.text((pad, sy + int(70 * s)), "Your mix", font=font("ExtraBold", int(62 * s)), fill=TXT)
            for j, (nm, v) in enumerate([("Rain", .7), ("Fireplace", .4)]):
                y = sy + int(240 * s) + j * int(190 * s)
                d.text((pad, y), nm, font=font("SemiBold", int(46 * s)), fill=TXT)
                for k in range(10):
                    x = pad + int(430 * s) + k * int(70 * s)
                    d.rounded_rectangle([x, y + 18 * s, x + 54 * s, y + 36 * s], radius=9, fill=ACC if (k + 1) / 10 <= v else (70, 55, 110))
    elif kind == "timer":
        d.text((pad, int(430 * s)), "Sleep timer", font=font("ExtraBold", int(70 * s)), fill=TXT)
        for j, t in enumerate(["No timer", "10 minutes", "15 minutes", "30 minutes", "45 minutes", "1 hour", "2 hours", "3 hours"]):
            y = int(600 * s) + j * int(190 * s)
            d.rounded_rectangle([pad, y, W - pad, y + int(150 * s)], radius=int(36 * s), fill=(95, 60, 170) if t == "30 minutes" else (50, 32, 92))
            f = font("SemiBold", int(48 * s)); w = d.textlength(t, font=f)
            d.text(((W - w) / 2, y + int(45 * s)), t, font=f, fill=TXT)
    elif kind == "paywall":
        sz = int(300 * s)
        ic = Image.open(sys.argv[2]).convert("RGB").resize((sz, sz), Image.LANCZOS)
        m = Image.new("L", (sz, sz), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, sz, sz], radius=int(sz * .22), fill=255)
        im.paste(ic, ((W - sz) // 2, int(470 * s)), m)
        t = "Sleep deeper with Lulla"; f = font("ExtraBold", int(78 * s)); w = d.textlength(t, font=f)
        d.text(((W - w) / 2, int(860 * s)), t, font=f, fill=TXT)
        for j, p in enumerate(["25+ high-quality sleep sounds", "Layer sounds into your own mix", "Sleep timer with gentle fade-out", "Plays in the background"]):
            d.text((pad + int(60 * s), int(1100 * s) + j * int(110 * s)), "✓  " + p if False else "+  " + p, font=font("Medium", int(50 * s)), fill=TXT)
        d.rounded_rectangle([pad, H - int(480 * s), W - pad, H - int(320 * s)], radius=int(80 * s), fill=ACC2)
        t = "Subscribe · $1.99 / month"; f = font("Bold", int(56 * s)); w = d.textlength(t, font=f)
        d.text(((W - w) / 2, H - int(430 * s)), t, font=f, fill=(255, 255, 255))
        t = "Auto-renews monthly. Cancel anytime."; f = font("Regular", int(34 * s)); w = d.textlength(t, font=f)
        d.text(((W - w) / 2, H - int(280 * s)), t, font=f, fill=SUB)
    return im

CAPTIONS = {
    "grid": ("Sounds for deep sleep", "Rain, ocean, wind, fire and more"),
    "mix": ("Build your own mix", "Layer sounds, set each volume"),
    "timer": ("Sleep timer", "Fades out gently when time is up"),
    "playing": ("Keeps playing all night", "Works with the screen off"),
    "paywall": ("Try free for 3 minutes", "Then just $1.99 per month"),
}

def shot(W, H, kind):
    cap_h = int(H * .17)
    base = grad(W, H); d = ImageDraw.Draw(base)
    t, sub = CAPTIONS[kind]
    f = font("ExtraBold", int(W * .072)); w = d.textlength(t, font=f)
    d.text(((W - w) / 2, int(cap_h * .18)), t, font=f, fill=TXT)
    f2 = font("Regular", int(W * .034)); w = d.textlength(sub, font=f2)
    d.text(((W - w) / 2, int(cap_h * .18 + W * .1)), sub, font=f2, fill=SUB)
    pw = int(W * .80); ph = int((H - cap_h) * 1.02)
    inner = phone_screen(pw, int(pw * 2.1), kind)
    frame = Image.new("RGB", (pw + 28, inner.height + 28), (12, 6, 26))
    mask = Image.new("L", frame.size, 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, frame.size[0], frame.size[1]], radius=int(pw * .11), fill=255)
    frame.paste(inner, (14, 14))
    base.paste(frame, ((W - frame.size[0]) // 2, cap_h), mask)
    return base

for kind in CAPTIONS:
    shot(1320, 2868, kind).save(f"{OUT}/ios_6.9in_1320x2868_{kind}.png")
    shot(1290, 2796, kind).save(f"{OUT}/ios_6.7in_1290x2796_{kind}.png")
    shot(1080, 1920, kind).save(f"{OUT}/android_phone_1080x1920_{kind}.png")

# Play feature graphic 1024x500
fg = grad(1024, 500); d = ImageDraw.Draw(fg)
icon(d, 220, 250, 120, "moon")
d.text((400, 150), "Lulla", font=font("ExtraBold", 110), fill=TXT)
d.text((404, 285), "Sleep Sounds", font=font("SemiBold", 52), fill=SUB)
fg.save(f"{OUT}/play_feature_graphic_1024x500.png")

Image.open(sys.argv[2]).convert("RGB").resize((512, 512), Image.LANCZOS).save(f"{OUT}/play_icon_512.png")
print(sorted(os.listdir(OUT)))
