# Builds src/assets/fonts/noto-sans-sc-subset-700.woff2 — the Chinese DISPLAY face.
#
# WHY this exists: /zh sets its headings in whatever Han face the visitor's OS
# happens to ship, and that is where the design breaks worst. A probe of a stock
# Windows 11 machine found only Microsoft YaHei, SimHei, SimSun and KaiTi
# installed — YaHei has exactly three distinct weights (100-300 Light, 400 and
# 500 BYTE-IDENTICAL, 600+ Bold), so a headline gets the same blunt Bold as a
# caption, with none of the optical care the Latin side gets from Mona Sans.
# Self-hosting ONE real OFL display face fixes the headline without asking the
# visitor to download a 10 MB CJK font: only the glyphs headings actually need
# ship, and anything missing falls through to the system stack (see the
# @font-face comment in src/index.css for why that degrades quietly).
#
# WHY Noto Sans SC and not MiSans / HarmonyOS Sans: those two ship under custom,
# revocable vendor EULAs. Noto Sans SC is OFL — non-revocable, redistributable,
# and the licence travels with the file (src/assets/fonts/OFL.txt).
#
# WHY 700 only: the zh scope in src/index.css clamps every weight to 400 or 700
# (nothing between them exists on the system stack), and 400 is body copy, which
# deliberately stays on the system face — a mainland reader expects body text in
# PingFang/YaHei. So the only weight this face is ever asked for is 700, and
# shipping a 400 cut would be a second download nothing references. Pass
# --weights 400 700 if a regular-weight display surface ever appears.
#
# Run:  python scripts/gen-zh-subset.py
#       python scripts/gen-zh-subset.py --source path/to/"NotoSansSC[wght].ttf"
#
# !!! REGENERATE ONCE THE /zh COPY LANDS !!!
# The character pool below is a HEDGE written before the Chinese copy existed:
# top-frequency hanzi plus this site's domain vocabulary. It is not derived from
# the shipped strings. After src/i18n/zh.js is real, re-run with
#       python scripts/gen-zh-subset.py --from-dict src/i18n/zh.js
# which unions the pool with every character in that file, so no heading can
# half-render in Noto and half in YaHei.

import argparse
import re
import sys
import tempfile
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src" / "assets" / "fonts"

# The upstream variable TTF (~17 MB) lives in the google/fonts OFL tree.
SOURCE_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"
LICENSE_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt"

# ── The candidate character pool ─────────────────────────────────────────────
# Written down explicitly because it is a guess, and a guess that is not visible
# cannot be checked. Four groups, each with its own reason to be here.

# 1. Punctuation. Every one of these is a DIFFERENT SHAPE in a Han face than in
#    Mona Sans — full-width, and positioned inside the em box rather than on the
#    Latin baseline. If they fell through to the system font while the hanzi
#    around them came from Noto, the mismatch would be more visible than a
#    missing hanzi. GB/T 15834 forms plus the 「」 pair that a census of mainland
#    tech personal sites found outnumbering “ ” heavily.
PUNCT = (
    "　"          # ideographic space
    "、。，；：？！"
    "（）〔〕【】《》〈〉「」『』"
    "…—～·〜‧"
    "“”‘’"            # U+201C-201D / U+2018-2019 — Han-width in a CJK face
    "—…"    # — and … , the halves of 破折号 / 六点省略号
    "％＋－＝＃＆／＊·"
)

# 2. Numerals and units — headings on this site count things (years, roles,
#    percentages), and 01 / 02 index labels sit in every eyebrow.
NUMERALS = "零一二三四五六七八九十百千万亿两第个位次项条家款种年月日周天时分秒"

# 3. Top-frequency modern hanzi — grammar, not content. Headings draw their
#    nouns from group 4; what a frequency list buys is the connective tissue
#    around them (的 了 与 让 从 每 更 …). Deliberately cut at the top ~280
#    rather than the usual 3500: every extra 100 hanzi costs ~12 KB of glyf, and
#    this face only ever paints .ed-display and .ed-h2 — a few dozen distinct
#    characters once the copy is real.
FREQUENT = (
    "的一是不了在人有我他这个们中来上大为和国地到以说时要就出会可也你对生能"
    "而子那得于着下自之年过发后作里用道行所然家种事成方多经么去法学如都同现"
    "当没动面起看定天分还进好小部其些主样理心她本前开但因只从想实日军者意无"
    "力它与长把机十民第公此已工使情明性知全三又关点正业外将两高间由问很最重"
)

# 4. Domain vocabulary — the nouns a heading on THIS site is built from. Job
#    titles, places, the stack, the section names. A frequency list carries none
#    of these, and they are exactly the characters a headline cannot do without.
#    Trimmed to heading vocabulary on purpose: deep operational jargon (灰度、
#    回滚、复盘 …) belongs to body copy, which never uses this face.
DOMAIN = (
    "悉尼澳洲墨尔本沪京张艾迪"                     # places + the name
    "智能体代理工程师全栈前端后端架构集成自动化"
    "平台系统部署交付迭代需求评估匹配岗位职位描述"
    "简历履历作品集精选项目案例经历经验技能星座图谱"
    "联系联络关于首页招聘面试入职签证学历硕士学位"
    "计算机信息技术数据模型训练推理提示词检索增强生成"
    "语音助手副驾驶舱机器人流程编排云服务端接口"
    "测试覆盖率安全权限认证性能优化延迟成本效率提升"
    "客户团队协作沟通文档规范上线发布版本指标增长"
    "用户交互设计视觉排版动效响应式无障碍兼容浏览"
    "主题切换语言中文英文双语下载查看更多阅读返回"
    "求职机会开放欢迎垂询邮件邮箱电话微信领英"
)

# 5. The scramble pool. Hero.jsx's DecodeWord and NavBar.jsx's ScrambleText
#    substitute these hanzi frame by frame while a Han word "resolves". They are
#    painted INSIDE .ed-display, so a character missing here would flip the
#    headline between two typefaces every 70 ms — the exact reflow the CJK glyph
#    pool exists to prevent. Keep this string in sync with SCRAMBLE_HAN in both
#    components.
SCRAMBLE = "量子态叠加坍缩观测波函数纠缠概率相位"


def build_charset(extra_files):
    chars = set(PUNCT + NUMERALS + FREQUENT + DOMAIN + SCRAMBLE)
    for path in extra_files:
        text = Path(path).read_text(encoding="utf-8")
        # Everything in the dictionary file, source code included — a few dozen
        # stray Latin glyphs cost nothing next to being wrong about one hanzi.
        chars.update(ch for ch in text if ord(ch) > 0x2000)
    # Latin, digits and ASCII punctuation are deliberately NOT here: the
    # @font-face unicode-range keeps this face off them entirely, so Mona Sans
    # keeps every Latin word in a Chinese heading. Shipping them would be dead
    # weight the browser downloads and never draws.
    return {ch for ch in chars if ord(ch) > 0x2000}


def fetch(url, dest):
    if dest.exists():
        return dest
    print(f"  fetching {url}\n       -> {dest}")
    urllib.request.urlretrieve(url, dest)
    return dest


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", help="path to NotoSansSC[wght].ttf (downloaded if omitted)")
    ap.add_argument("--weights", nargs="+", type=int, default=[700])
    ap.add_argument("--from-dict", nargs="*", default=[],
                    help="extra files whose every non-ASCII character joins the subset")
    args = ap.parse_args()

    cache = Path(tempfile.gettempdir()) / "notosanssc-src"
    cache.mkdir(parents=True, exist_ok=True)
    src = Path(args.source) if args.source else fetch(SOURCE_URL, cache / "NotoSansSC-wght.ttf")
    if not src.exists():
        sys.exit(f"source font not found: {src}")

    charset = build_charset(args.from_dict)
    print(f"charset: {len(charset)} characters")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    fetch(LICENSE_URL, OUT_DIR / "OFL.txt")

    for weight in args.weights:
        font = TTFont(src, lazy=False)

        options = subset.Options()
        options.hinting = False           # display sizes only; ClearType/CoreText autohint fine
        options.glyph_names = False       # post 3.0 — glyph names are pure weight in a webfont
        options.notdef_outline = False    # a missing glyph must fall through, never draw a box
        options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]   # 13/14 carry the OFL, do not drop them
        options.name_languages = [0x409]
        # chws/halt/palt are what text-spacing-trim reads to tighten full-width
        # brackets; they cost little and the system faces have none of them.
        options.layout_features = [
            "ccmp", "locl", "liga", "clig", "calt", "kern", "mark", "mkmk",
            "chws", "halt", "palt",
        ]
        # Nothing on this site is ever set vertically, and the STAT/gasp tables
        # describe an axis and a hinting ramp the instanced, unhinted cut no
        # longer has. ~2 KB of pure description.
        options.drop_tables = list(options.drop_tables) + ["vhea", "vmtx", "STAT", "gasp"]
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=[ord(c) for c in charset])
        subsetter.subset(font)

        # Pin the weight axis AFTER subsetting — instancing the full 44k-glyph
        # face first would spend minutes rewriting outlines that are about to be
        # thrown away.
        instancer.instantiateVariableFont(font, {"wght": weight}, inplace=True, updateFontNames=False)

        style = {400: "Regular", 700: "Bold"}.get(weight, str(weight))
        family = "Noto Sans SC Subset"
        name = font["name"]
        for nid, value in (
            (1, family), (2, style), (4, f"{family} {style}"),
            (6, f"NotoSansSCSubset-{style}"),
            (3, f"{family} {style}; portfolio display subset"),
        ):
            name.setName(value, nid, 3, 1, 0x409)
        # nameID 16/17 (typographic family) would re-link this cut to the full
        # family in a font menu it will never appear in.
        for nid in (16, 17, 21, 22, 25):
            name.removeNames(nid)

        font.flavor = "woff2"
        out = OUT_DIR / f"noto-sans-sc-subset-{weight}.woff2"
        font.save(out)
        glyphs = font["maxp"].numGlyphs
        print(f"{out.relative_to(ROOT)}  {out.stat().st_size / 1024:.1f} KB  {glyphs} glyphs  wght={weight}")

        # Coverage report — the number that matters when the copy lands.
        cmap = set(TTFont(out).getBestCmap())
        missing = sorted(c for c in charset if ord(c) not in cmap)
        if missing:
            print(f"  NOT IN SOURCE FONT ({len(missing)}): {''.join(missing)}")


if __name__ == "__main__":
    main()
