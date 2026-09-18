function srgbEncode(c) {
  c = Math.max(0, Math.min(1, c));
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export function oklchToRGB(str) {
  const m = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(str);
  if (!m) return [1, 1, 1];
  const L = parseFloat(m[1]), C = parseFloat(m[2]), H = (parseFloat(m[3]) * Math.PI) / 180;
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, mm = m_ ** 3, s = s_ ** 3;
  return [
    srgbEncode(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s),
    srgbEncode(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s),
    srgbEncode(-0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * s),
  ];
}
