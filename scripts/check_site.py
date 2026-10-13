"""Dependency-free checks for this static site's local references and source structure."""
from html.parser import HTMLParser
from pathlib import Path
import re
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
errors = []
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.anchors = []
        self.refs = []
        self.labels = []
    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                errors.append("Duplicate ID: " + attrs["id"])
            self.ids.add(attrs["id"])
        if tag == "img" and "alt" not in attrs:
            errors.append("Image missing alt text")
        for key in ("href", "src"):
            value = attrs.get(key, "")
            if value.startswith("#"):
                self.anchors.append(value[1:])
            elif value and not re.match(r"^[a-z]+:", value):
                self.refs.append(value)
        if tag == "label":
            self.labels.append(attrs.get("for"))
page = Page()
page.feed(root.joinpath("index.html").read_text())
for anchor in page.anchors:
    if anchor not in page.ids:
        errors.append("Missing anchor: " + anchor)
for label in page.labels:
    if label not in page.ids:
        errors.append("Label target missing: " + str(label))
for ref in page.refs:
    if not root.joinpath(ref).is_file():
        errors.append("Missing local file: " + ref)
for asset in root.joinpath("assets").rglob("*.svg"):
    try:
        ET.parse(asset)
    except ET.ParseError as exc:
        errors.append(f"Invalid SVG {asset.name}: {exc}")
css = root.joinpath("styles.css").read_text()
if css.count("{") != css.count("}"):
    errors.append("Unbalanced CSS braces")
for ref in re.findall(r'url\([\'"]?([^\)\'\"]+)', css):
    if not ref.startswith(("data:", "http:", "https:")) and not root.joinpath(ref).is_file():
        errors.append("Missing CSS asset: " + ref)
for breakpoint in ("max-width:1050px", "max-width:760px", "max-width:370px", "prefers-reduced-motion:reduce"):
    if breakpoint not in css:
        errors.append("Missing responsive/accessibility rule: " + breakpoint)
if not root.joinpath(".nojekyll").exists():
    errors.append("Missing GitHub Pages static marker")
if errors:
    raise SystemExit("\n".join(errors))
print(f"PASS: {len(page.ids)} unique IDs, {len(page.anchors)} anchors, {len(page.refs)} local references, labeled form inputs, valid SVG artwork, responsive/reduced-motion rules.")
