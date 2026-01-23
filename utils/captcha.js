const crypto = require("crypto");

function generateCaptchaText(length = 6) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, length)
    .toUpperCase();
}

function generateCaptchaSVG(text) {
  const chars = text.split("");

  const svgChars = chars
    .map((char, i) => {
      const x = 30 + i * 30;
      const y = 40 + Math.random() * 10;
      const rotate = Math.random() * 20 - 10;
      return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})"
        font-size="28" font-family="Arial" fill="#0b4aa2">${char}</text>`;
    })
    .join("");

  const noise = Array.from({ length: 6 })
    .map(
      () =>
        `<line x1="${Math.random() * 200}" y1="${Math.random() * 60}"
        x2="${Math.random() * 200}" y2="${Math.random() * 60}"
        stroke="#c7d2fe" stroke-width="2" />`
    )
    .join("");

  return `
    <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#eef4ff"/>
      ${noise}
      ${svgChars}
    </svg>
  `;
}

module.exports = { generateCaptchaText, generateCaptchaSVG };
