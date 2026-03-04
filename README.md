# Gmail Equation Inserter

Insert **LaTeX equations directly into Gmail emails** with a visual equation editor.

This Chrome extension adds a **∑ Insert Equation** button to the Gmail compose toolbar, allowing you to quickly create and insert mathematical equations into your emails.

The extension includes a **visual editor, symbol palette, LaTeX input mode, and live preview**.

Detailed usage instructions are available inside the extension popup.

---

## Installation (Developer Mode)

1. Download or clone this repository.
2. Open Chrome and go to: ``chrome://extensions``
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked**.
5. Select the extension folder.
6. Open **Gmail** and start composing an email.

---

## Usage

1. Open Gmail and click **Compose** (or reply to an email).
2. Click the **∑ Insert Equation** button in the formatting toolbar.
3. Build your equation using the visual editor or LaTeX mode.
4. Click **Insert Equation**.

The equation will appear **inline inside your email**.

---

## How It Works

- LaTeX equations are rendered using the **CodeCogs LaTeX engine**.
- The equation is converted into an image.
- The extension inserts the image using Gmail’s **paste pipeline**, ensuring the equation is delivered correctly to recipients.

Recipients **do not need any extension** to view the equation.



