// Capture the laid-out type once, so its pixels travel on the thumbnail's mesh.
// The original HTML stays in place for links, fallback and assistive technology.
export function captureCaption(element) {
  const bounds = element.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio || 1, 2) * 1.5;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(bounds.width * ratio);
  canvas.height = Math.ceil(bounds.height * ratio);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.scale(ratio, ratio);
  context.textBaseline = "alphabetic";
  const metadata = element.querySelector(".project-meta");
  const border = getComputedStyle(metadata);
  const metaBounds = metadata.getBoundingClientRect();
  context.fillStyle = border.borderTopColor;
  context.fillRect(
    metaBounds.left - bounds.left,
    metaBounds.top - bounds.top,
    metaBounds.width,
    parseFloat(border.borderTopWidth),
  );
  element
    .querySelectorAll("h3, p, .project-arrow, .project-meta span")
    .forEach((label) => {
      const style = getComputedStyle(label);
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      context.fillStyle = style.color;
      if ("letterSpacing" in context)
        context.letterSpacing =
          style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
      const lines = [];
      // Ranges preserve the browser's actual wrapping, including narrow mobile titles.
      [...label.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .forEach((node) => {
          const words = node.textContent.matchAll(/\S+\s*/g);
          for (const match of words) {
            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].trimEnd().length);
            const box = range.getBoundingClientRect();
            const previous = lines[lines.length - 1];
            if (previous && Math.abs(previous.top - box.top) < 1)
              previous.text += " " + match[0].trim();
            else
              lines.push({
                text: match[0].trim(),
                left: box.left,
                top: box.top,
              });
          }
        });
      lines.forEach((line) => {
        const metrics = context.measureText(line.text);
        const ascent =
          metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.8;
        context.fillText(
          line.text,
          line.left - bounds.left,
          line.top - bounds.top + ascent,
        );
      });
    });
  return canvas;
}
