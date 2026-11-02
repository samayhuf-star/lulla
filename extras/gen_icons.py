"""Original Lulla icon: crescent moon over a soft indigo gradient (own design)."""
import sys
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1]
S = 1024


def gradient(size, c1, c2):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x * 0.35 + y * 0.65) / size
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return img


def moon_layer(size, scale=1.0):
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    r = int(size * 0.27 * scale)
    cx, cy = size // 2 - int(size * 0.02), size // 2
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 248, 235, 255))
    off = int(r * 0.5)
    cut = Image.new("L", (size, size), 0)
    ImageDraw.Draw(cut).ellipse([cx - r + off, cy - r - int(off * 0.3), cx + r + off, cy + r - int(off * 0.3)], fill=255)
    a = layer.split()[3]
    a = Image.composite(Image.new("L", (size, size), 0), a, cut)
    layer.putalpha(a)
    d2 = ImageDraw.Draw(layer)
    for (sx, sy, sr) in [(0.68, 0.30, 0.018), (0.76, 0.46, 0.012), (0.60, 0.20, 0.010)]:
        x, y, rr = int(size * sx), int(size * sy), int(size * sr)
        d2.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(255, 248, 235, 255))
    return layer


bg = gradient(S, (24, 10, 52), (88, 40, 160))
glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
glow.paste(moon_layer(S), (0, 0))
blur = glow.filter(ImageFilter.GaussianBlur(40))
icon = bg.convert("RGBA")
icon = Image.alpha_composite(icon, blur)
icon = Image.alpha_composite(icon, moon_layer(S))
icon.convert("RGB").save(f"{OUT}/icon.png")
icon.convert("RGB").resize((48, 48)).save(f"{OUT}/favicon.png")

# Android adaptive: foreground (transparent, moon in safe zone), background, monochrome
fg = moon_layer(S, 0.8)
fg.save(f"{OUT}/android-icon-foreground.png")
gradient(S, (24, 10, 52), (88, 40, 160)).save(f"{OUT}/android-icon-background.png")
mono = Image.new("RGBA", (S, S), (0, 0, 0, 0))
mono.paste((255, 255, 255, 255), mask=moon_layer(S, 0.8).split()[3])
mono.save(f"{OUT}/android-icon-monochrome.png")

# Splash
Image.new("RGB", (1024, 1024), (21, 10, 46)).save(f"{OUT}/splash-bg.png")
print("icons done")
