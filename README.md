# Gmail Equation Inserter — Chrome Extension

Insert beautiful LaTeX equations directly into Gmail compose windows, no copy-paste from Google Docs needed.

---

## Installation (Developer Mode)

1. **Download** and unzip this folder somewhere on your computer.
2. Open Chrome and go to **`chrome://extensions`**
3. Toggle **Developer mode** ON (top-right corner)
4. Click **"Load unpacked"**
5. Select the `gmail-equation-inserter` folder
6. Done! Open Gmail and start composing.

---

## How to use

1. Open a **new compose** window in Gmail (or reply/forward).
2. In the **formatting toolbar** (the bar with Bold, Italic, etc.), you'll see a new **∑ button** at the end.
3. Click it to open the **Equation Editor**.
4. Type any **LaTeX** expression in the input box.
5. See a **live preview** update as you type.
6. Adjust the **size** with the slider.
7. Click **Insert Equation** — the equation appears inline in your email as an image.

---

## LaTeX Quick Reference

| What you want | LaTeX |
|---|---|
| Fraction | `\frac{a}{b}` |
| Square root | `\sqrt{x}` |
| Power | `x^{2}` |
| Subscript | `x_{n}` |
| Sum | `\sum_{i=1}^{n} i` |
| Integral | `\int_{a}^{b} f(x)\,dx` |
| Greek letters | `\alpha`, `\beta`, `\pi`, `\theta` |
| Infinity | `\infty` |
| Plus-minus | `\pm` |
| Matrix | `\begin{pmatrix} a & b \\ c & d \end{pmatrix}` |

---

## Notes

- Equations are rendered using the [CodeCogs](https://latex.codecogs.com) LaTeX engine and embedded as images.
- The inserted image travels with the email — recipients see the equation even without the extension.
- If you're offline, the equation URL is used as a fallback (recipients need an internet connection to see it).

---

## Troubleshooting

**Button doesn't appear?**
- Refresh Gmail after installing the extension.
- Make sure you're on `https://mail.google.com`.

**Equation shows a broken image?**
- Check your LaTeX syntax (missing backslash, unclosed bracket, etc.).
- The preview will show a warning when syntax is invalid.
