/* ============================================================
   Gmail Equation Inserter — content.js
   ============================================================ */
(function () {
  'use strict';

  const CODECOGS_SVG = 'https://latex.codecogs.com/svg.image?'; // for previews/thumbnails
  const CODECOGS_PNG = 'https://latex.codecogs.com/png.image?'; // for actual insertion
  const injected = new WeakSet();

  // ── Symbol groups ─────────────────────────────────────────
  const SYMBOL_GROUPS = [
    {
      id: 'greek', label: 'Greek', icon: 'αβ',
      symbols: [
        { d: 'α', l: '\\alpha' }, { d: 'β', l: '\\beta' }, { d: 'γ', l: '\\gamma' },
        { d: 'δ', l: '\\delta' }, { d: 'ε', l: '\\epsilon' }, { d: 'ζ', l: '\\zeta' },
        { d: 'η', l: '\\eta' }, { d: 'θ', l: '\\theta' }, { d: 'ι', l: '\\iota' },
        { d: 'κ', l: '\\kappa' }, { d: 'λ', l: '\\lambda' }, { d: 'μ', l: '\\mu' },
        { d: 'ν', l: '\\nu' }, { d: 'ξ', l: '\\xi' }, { d: 'π', l: '\\pi' },
        { d: 'ρ', l: '\\rho' }, { d: 'σ', l: '\\sigma' }, { d: 'τ', l: '\\tau' },
        { d: 'υ', l: '\\upsilon' }, { d: 'φ', l: '\\phi' }, { d: 'χ', l: '\\chi' },
        { d: 'ψ', l: '\\psi' }, { d: 'ω', l: '\\omega' },
        { d: 'Γ', l: '\\Gamma' }, { d: 'Δ', l: '\\Delta' }, { d: 'Θ', l: '\\Theta' },
        { d: 'Λ', l: '\\Lambda' }, { d: 'Ξ', l: '\\Xi' }, { d: 'Π', l: '\\Pi' },
        { d: 'Σ', l: '\\Sigma' }, { d: 'Φ', l: '\\Phi' }, { d: 'Ψ', l: '\\Psi' },
        { d: 'Ω', l: '\\Omega' },
      ]
    },
    {
      id: 'ops', label: 'Operations', icon: '×÷',
      symbols: [
        { d: '×', l: '\\times' }, { d: '÷', l: '\\div' }, { d: '±', l: '\\pm' },
        { d: '∓', l: '\\mp' }, { d: '·', l: '\\cdot' }, { d: '∘', l: '\\circ' },
        { d: '∗', l: '\\ast' }, { d: '⊕', l: '\\oplus' }, { d: '⊗', l: '\\otimes' },
        { d: '⊙', l: '\\odot' }, { d: '∧', l: '\\wedge' }, { d: '∨', l: '\\vee' },
        { d: '∩', l: '\\cap' }, { d: '∪', l: '\\cup' }, { d: '△', l: '\\triangle' },
      ]
    },
    {
      id: 'rel', label: 'Relations', icon: '≤≥',
      symbols: [
        { d: '=', l: '=' }, { d: '≠', l: '\\neq' }, { d: '≡', l: '\\equiv' },
        { d: '<', l: '<' }, { d: '>', l: '>' }, { d: '≤', l: '\\leq' },
        { d: '≥', l: '\\geq' }, { d: '≪', l: '\\ll' }, { d: '≫', l: '\\gg' },
        { d: '≈', l: '\\approx' }, { d: '∼', l: '\\sim' }, { d: '≅', l: '\\cong' },
        { d: '∝', l: '\\propto' }, { d: '⊂', l: '\\subset' }, { d: '⊃', l: '\\supset' },
        { d: '⊆', l: '\\subseteq' }, { d: '∈', l: '\\in' }, { d: '∉', l: '\\notin' },
        { d: '⊥', l: '\\perp' }, { d: '∥', l: '\\parallel' },
      ]
    },
    {
      id: 'arrows', label: 'Arrows', icon: '→⇒',
      symbols: [
        { d: '→', l: '\\to' }, { d: '←', l: '\\leftarrow' }, { d: '↔', l: '\\leftrightarrow' },
        { d: '↑', l: '\\uparrow' }, { d: '↓', l: '\\downarrow' }, { d: '⇒', l: '\\Rightarrow' },
        { d: '⇐', l: '\\Leftarrow' }, { d: '⇔', l: '\\Leftrightarrow' }, { d: '⇑', l: '\\Uparrow' },
        { d: '⇓', l: '\\Downarrow' }, { d: '↦', l: '\\mapsto' }, { d: '↪', l: '\\hookrightarrow' },
      ]
    },
    {
      id: 'misc', label: 'Misc', icon: '∞∂',
      symbols: [
        { d: '∞', l: '\\infty' }, { d: '∂', l: '\\partial' }, { d: '∇', l: '\\nabla' },
        { d: '∀', l: '\\forall' }, { d: '∃', l: '\\exists' }, { d: '∅', l: '\\emptyset' },
        { d: '…', l: '\\ldots' }, { d: '⋯', l: '\\cdots' }, { d: '⋮', l: '\\vdots' },
        { d: '⋱', l: '\\ddots' }, { d: '∴', l: '\\therefore' }, { d: '∵', l: '\\because' },
        { d: 'ℕ', l: '\\mathbb{N}' }, { d: 'ℤ', l: '\\mathbb{Z}' }, { d: 'ℝ', l: '\\mathbb{R}' },
        { d: 'ℂ', l: '\\mathbb{C}' }, { d: '!', l: '!' },
      ]
    },
  ];

  // ── Structures — with optional slots for interactive editor ──
  // slots: array of { label, placeholder }
  // build(values): fn that returns LaTeX string from filled-in values
  // If no slots → inserts latex directly
  const STRUCTURES = [
    {
      label: 'Fraction',
      latex: '\\frac{a}{b}',
      slots: [
        { label: 'Numerator', placeholder: 'e.g. a+b' },
        { label: 'Denominator', placeholder: 'e.g. 2c' },
      ],
      build: (v) => `\\frac{${v[0] || 'a'}}{${v[1] || 'b'}}`,
    },
    {
      label: 'Square root',
      latex: '\\sqrt{x}',
      slots: [{ label: 'Expression', placeholder: 'e.g. x^2+1' }],
      build: (v) => `\\sqrt{${v[0] || 'x'}}`,
    },
    {
      label: 'nth root',
      latex: '\\sqrt[n]{x}',
      slots: [
        { label: 'Index (n)', placeholder: 'e.g. 3' },
        { label: 'Expression', placeholder: 'e.g. x' },
      ],
      build: (v) => `\\sqrt[${v[0] || 'n'}]{${v[1] || 'x'}}`,
    },
    {
      label: 'Superscript',
      latex: 'x^{a}',
      slots: [
        { label: 'Base', placeholder: 'e.g. x' },
        { label: 'Exponent', placeholder: 'e.g. 2' },
      ],
      build: (v) => `${v[0] || 'x'}^{${v[1] || 'a'}}`,
    },
    {
      label: 'Subscript',
      latex: 'x_{a}',
      slots: [
        { label: 'Base', placeholder: 'e.g. x' },
        { label: 'Index', placeholder: 'e.g. n' },
      ],
      build: (v) => `${v[0] || 'x'}_{${v[1] || 'a'}}`,
    },
    {
      label: 'Sub + super',
      latex: 'x^{b}_{a}',
      slots: [
        { label: 'Base', placeholder: 'e.g. x' },
        { label: 'Subscript', placeholder: 'e.g. i' },
        { label: 'Superscript', placeholder: 'e.g. 2' },
      ],
      build: (v) => `${v[0] || 'x'}^{${v[2] || 'b'}}_{${v[1] || 'a'}}`,
    },
    {
      label: 'Sum',
      latex: '\\sum_{i=1}^{n}',
      slots: [
        { label: 'Lower limit', placeholder: 'e.g. i=1' },
        { label: 'Upper limit', placeholder: 'e.g. n' },
        { label: 'Body', placeholder: 'e.g. x_i' },
      ],
      build: (v) => `\\sum_{${v[0] || 'i=1'}}^{${v[1] || 'n'}} ${v[2] || ''}`,
    },
    {
      label: 'Product',
      latex: '\\prod_{i=1}^{n}',
      slots: [
        { label: 'Lower limit', placeholder: 'e.g. i=1' },
        { label: 'Upper limit', placeholder: 'e.g. n' },
        { label: 'Body', placeholder: 'e.g. x_i' },
      ],
      build: (v) => `\\prod_{${v[0] || 'i=1'}}^{${v[1] || 'n'}} ${v[2] || ''}`,
    },
    {
      label: 'Integral',
      latex: '\\int_{a}^{b}',
      slots: [
        { label: 'Lower limit', placeholder: 'e.g. 0' },
        { label: 'Upper limit', placeholder: 'e.g. \\infty' },
        { label: 'Integrand', placeholder: 'e.g. f(x)\\,dx' },
      ],
      build: (v) => `\\int_{${v[0] || 'a'}}^{${v[1] || 'b'}} ${v[2] || ''}`,
    },
    {
      label: 'Double int.',
      latex: '\\iint',
      slots: [{ label: 'Integrand', placeholder: 'e.g. f(x,y)\\,dx\\,dy' }],
      build: (v) => `\\iint ${v[0] || ''}`,
    },
    {
      label: 'Oint integral',
      latex: '\\oint',
      slots: [{ label: 'Integrand', placeholder: 'e.g. f(z)\\,dz' }],
      build: (v) => `\\oint ${v[0] || ''}`,
    },
    {
      label: 'Limit',
      latex: '\\lim_{x \\to 0}',
      slots: [
        { label: 'Variable → value', placeholder: 'e.g. x \\to 0' },
        { label: 'Expression', placeholder: 'e.g. f(x)' },
      ],
      build: (v) => `\\lim_{${v[0] || 'x \\to 0'}} ${v[1] || ''}`,
    },
    {
      label: 'Matrix 2×2',
      latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
      slots: [
        { label: 'a (top-left)', placeholder: 'a' },
        { label: 'b (top-right)', placeholder: 'b' },
        { label: 'c (bottom-left)', placeholder: 'c' },
        { label: 'd (bottom-right)', placeholder: 'd' },
      ],
      build: (v) => `\\begin{pmatrix} ${v[0] || 'a'} & ${v[1] || 'b'} \\\\ ${v[2] || 'c'} & ${v[3] || 'd'} \\end{pmatrix}`,
    },
    {
      label: 'Abs value',
      latex: '\\left|x\\right|',
      slots: [{ label: 'Expression', placeholder: 'e.g. x-y' }],
      build: (v) => `\\left|${v[0] || 'x'}\\right|`,
    },
    {
      label: 'Overline',
      latex: '\\overline{x}',
      slots: [{ label: 'Expression', placeholder: 'e.g. AB' }],
      build: (v) => `\\overline{${v[0] || 'x'}}`,
    },
    {
      label: 'Hat',
      latex: '\\hat{x}',
      slots: [{ label: 'Expression', placeholder: 'e.g. x' }],
      build: (v) => `\\hat{${v[0] || 'x'}}`,
    },
    {
      label: 'Vector',
      latex: '\\vec{x}',
      slots: [{ label: 'Expression', placeholder: 'e.g. v' }],
      build: (v) => `\\vec{${v[0] || 'x'}}`,
    },
    {
      label: 'Cases',
      latex: 'f(x) = \\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases}',
      slots: [
        { label: 'Function name', placeholder: 'f(x)' },
        { label: 'Case 1 value', placeholder: 'x' },
        { label: 'Case 1 cond.', placeholder: 'x \\ge 0' },
        { label: 'Case 2 value', placeholder: '-x' },
        { label: 'Case 2 cond.', placeholder: 'x < 0' },
      ],
      build: (v) => `${v[0] || 'f(x)'} = \\begin{cases} ${v[1] || 'x'} & ${v[2] || 'x \\ge 0'} \\\\ ${v[3] || '-x'} & ${v[4] || 'x < 0'} \\end{cases}`,
    },
  ];

  const EXAMPLES = [
    { label: 'Quadratic formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { label: "Euler's identity", latex: 'e^{i\\pi} + 1 = 0' },
    { label: 'Pythagorean theorem', latex: 'a^2 + b^2 = c^2' },
    { label: 'Taylor series', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n' },
    { label: 'Normal distribution', latex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
    { label: 'Fourier transform', latex: '\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi}\\,dx' },
  ];

  // ── DOM observer ─────────────────────────────────────────
  const observer = new MutationObserver(() => injectButtons());
  observer.observe(document.body, { childList: true, subtree: true });
  injectButtons();

  function injectButtons() {
    document.querySelectorAll('.aDh').forEach((toolbar) => {
      if (injected.has(toolbar)) return;
      injected.add(toolbar);
      addEquationButton(toolbar);
    });
  }

  function addEquationButton(toolbar) {
    const btn = document.createElement('div');
    btn.className = 'geq-toolbar-btn';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', 'Insert equation');
    btn.innerHTML = `<span class="geq-btn-sigma">∑</span><span class="geq-btn-label">Insert Equation</span>`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); e.preventDefault();
      const composeRoot = toolbar.closest('.T-I-KE, .AD, [role="dialog"]');
      const body =
        (composeRoot && composeRoot.querySelector('[contenteditable="true"]')) ||
        document.querySelector('.Am.Al.editable[contenteditable="true"]');

      // Save the cursor position NOW, before the modal steals focus
      let savedRange = null;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRange = sel.getRangeAt(0).cloneRange();
      }

      openModal(body, savedRange);
    });
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') btn.click(); });
    toolbar.appendChild(btn);
  }

  // ── Modal ─────────────────────────────────────────────────
  function openModal(composeBody, savedRange) {
    document.getElementById('geq-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'geq-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div id="geq-modal">
        <div id="geq-header">
          <div id="geq-title"><span id="geq-title-icon">∑</span> Equation Editor</div>
          <button id="geq-close" aria-label="Close">&times;</button>
        </div>

        <div id="geq-tabs">
          <button class="geq-tab geq-tab-active" data-tab="visual">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Visual
          </button>
          <button class="geq-tab" data-tab="latex">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            LaTeX
          </button>
        </div>

        <!-- VISUAL PANEL -->
        <div id="geq-panel-visual" class="geq-panel">
          <div class="geq-section-label">Structures</div>
          <div id="geq-structures">
            ${STRUCTURES.map((s, i) => `
              <button class="geq-struct-btn" data-idx="${i}" title="${escapeAttr(s.label)}">
                <img class="geq-struct-img" src="${buildUrl(s.latex)}" alt="${escapeAttr(s.label)}" loading="lazy" />
                <span class="geq-struct-label">${s.label}</span>
              </button>`).join('')}
          </div>

          <!-- Slot editor — hidden until a structure is clicked -->
          <div id="geq-slot-editor" style="display:none">
            <div id="geq-slot-header">
              <span id="geq-slot-title"></span>
              <button id="geq-slot-close" title="Cancel">×</button>
            </div>
            <div id="geq-slot-fields"></div>
            <div id="geq-slot-preview-wrap">
              <img id="geq-slot-preview-img" alt="preview" />
            </div>
            <button id="geq-slot-insert" class="geq-btn-secondary">Add to equation</button>
          </div>

          <div class="geq-section-label" style="margin-top:14px">Symbols</div>
          <div id="geq-sym-tabs">
            ${SYMBOL_GROUPS.map((g, i) => `
              <button class="geq-sym-tab ${i === 0 ? 'geq-sym-tab-active' : ''}" data-group="${g.id}">
                <span class="geq-sym-tab-icon">${g.icon}</span>
                ${g.label}
              </button>`).join('')}
          </div>
          <div id="geq-sym-grid">
            ${SYMBOL_GROUPS.map((g, i) => `
              <div class="geq-sym-panel ${i === 0 ? 'geq-sym-panel-active' : ''}" data-group="${g.id}">
                ${g.symbols.map(s => `
                  <button class="geq-sym" data-latex="${escapeAttr(s.l)}" title="${escapeAttr(s.l)}">${s.d}</button>`
    ).join('')}
              </div>`).join('')}
          </div>

          <div class="geq-section-label" style="margin-top:14px">Equation so far</div>
          <div id="geq-visual-eq-wrap">
            <div id="geq-visual-eq-display">
              <span class="geq-eq-placeholder">Click symbols &amp; structures above…</span>
            </div>
            <button id="geq-visual-clear" title="Clear">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </div>

        <!-- LATEX PANEL -->
        <div id="geq-panel-latex" class="geq-panel" style="display:none">
          <label class="geq-section-label" for="geq-latex-input">LaTeX source</label>
          <div id="geq-input-wrap">
            <textarea id="geq-latex-input" spellcheck="false" autocorrect="off" autocapitalize="off"
              placeholder="e.g. \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"></textarea>
          </div>
        </div>

        <!-- PREVIEW -->
        <div id="geq-preview-section">
          <div class="geq-section-label">Preview</div>
          <div id="geq-preview">
            <div id="geq-preview-inner">
              <span id="geq-preview-hint">Build or type an equation above…</span>
              <img id="geq-preview-img" alt="equation preview" style="display:none" />
              <div id="geq-preview-error" style="display:none"></div>
            </div>
          </div>
        </div>

        <div id="geq-bottom-row">
          <div id="geq-size-row">
            <label for="geq-size">Size</label>
            <input type="range" id="geq-size" min="14" max="40" value="22" step="1" />
            <span id="geq-size-val">22px</span>
          </div>
          <div id="geq-actions">
            <button id="geq-insert" class="geq-btn-primary" disabled>Insert Equation</button>
            <button id="geq-cancel" class="geq-btn-ghost">Cancel</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    // ── State ───────────────────────────────────────────────
    let activeTab = 'visual';
    let visualLatex = '';
    let currentSize = 22;
    let previewTimer;
    let slotDebounce;

    const $ = (s) => overlay.querySelector(s);
    const $$ = (s) => overlay.querySelectorAll(s);

    const previewImg = $('#geq-preview-img');
    const previewErr = $('#geq-preview-error');
    const hint = $('#geq-preview-hint');
    const insertBtn = $('#geq-insert');
    const latexInput = $('#geq-latex-input');
    const eqDisplay = $('#geq-visual-eq-display');
    const slotEditor = $('#geq-slot-editor');

    // ── Close ───────────────────────────────────────────────
    const escHandler = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', escHandler);
    function closeModal() { document.removeEventListener('keydown', escHandler); overlay.remove(); }
    $('#geq-close').onclick = closeModal;
    $('#geq-cancel').onclick = closeModal;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    // ── Mode tabs ───────────────────────────────────────────
    $$('.geq-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const name = tab.dataset.tab;
        if (name === activeTab) return;
        activeTab = name;
        $$('.geq-tab').forEach(t => t.classList.toggle('geq-tab-active', t.dataset.tab === name));
        $('#geq-panel-visual').style.display = name === 'visual' ? '' : 'none';
        $('#geq-panel-latex').style.display = name === 'latex' ? '' : 'none';
        if (name === 'latex' && visualLatex) latexInput.value = visualLatex;
        if (name === 'visual' && latexInput.value.trim()) { visualLatex = latexInput.value.trim(); renderEqDisplay(); }
        schedulePreview();
        if (name === 'latex') latexInput.focus();
      });
    });

    // ── Structure clicks → open slot editor ────────────────
    $$('.geq-struct-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        openSlotEditor(STRUCTURES[idx]);
      });
    });

    // ── Slot editor ─────────────────────────────────────────
    function openSlotEditor(struct) {
      slotEditor.style.display = 'block';
      $('#geq-slot-title').textContent = struct.label;

      const fields = $('#geq-slot-fields');
      fields.innerHTML = struct.slots.map((slot, i) => `
        <div class="geq-slot-field">
          <label class="geq-slot-label" for="geq-slot-${i}">${slot.label}</label>
          <input class="geq-slot-input" id="geq-slot-${i}" type="text"
            placeholder="${escapeAttr(slot.placeholder)}" autocomplete="off" spellcheck="false" />
        </div>`).join('');

      const slotPreviewImg = $('#geq-slot-preview-img');

      function getValues() {
        return struct.slots.map((_, i) => ($(`#geq-slot-${i}`)?.value.trim() || ''));
      }

      function updateSlotPreview() {
        const latex = struct.build(getValues());
        slotPreviewImg.src = buildUrl(latex);
      }

      fields.querySelectorAll('.geq-slot-input').forEach(inp => {
        inp.addEventListener('input', () => {
          clearTimeout(slotDebounce);
          slotDebounce = setTimeout(updateSlotPreview, 300);
        });
      });

      // Show initial preview with placeholders
      updateSlotPreview();

      // Focus first input
      setTimeout(() => $(`#geq-slot-0`)?.focus(), 50);

      $('#geq-slot-insert').onclick = () => {
        const latex = struct.build(getValues());
        visualLatex += (visualLatex ? ' ' : '') + latex;
        renderEqDisplay();
        schedulePreview();
        closeSlotEditor();
      };
    }

    function closeSlotEditor() {
      slotEditor.style.display = 'none';
      $('#geq-slot-fields').innerHTML = '';
    }

    $('#geq-slot-close').addEventListener('click', closeSlotEditor);

    // ── Symbol group tabs ───────────────────────────────────
    $$('.geq-sym-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const gid = tab.dataset.group;
        $$('.geq-sym-tab').forEach(t => t.classList.toggle('geq-sym-tab-active', t.dataset.group === gid));
        $$('.geq-sym-panel').forEach(p => p.classList.toggle('geq-sym-panel-active', p.dataset.group === gid));
      });
    });

    // ── Symbol clicks ───────────────────────────────────────
    $$('.geq-sym').forEach(btn => {
      btn.addEventListener('click', () => {
        visualLatex += (visualLatex ? ' ' : '') + btn.dataset.latex;
        renderEqDisplay(); schedulePreview();
      });
    });

    // ── Clear ───────────────────────────────────────────────
    $('#geq-visual-clear').addEventListener('click', () => {
      visualLatex = ''; renderEqDisplay(); schedulePreview();
    });

    // ── LaTeX input ─────────────────────────────────────────
    latexInput.addEventListener('input', () => schedulePreview());

    // ── Examples ────────────────────────────────────────────
    $$('.geq-example').forEach(btn => {
      btn.addEventListener('click', () => {
        latexInput.value = btn.dataset.latex;
        $('#geq-examples-details').open = false;
        schedulePreview();
      });
    });

    // ── Size slider ──────────────────────────────────────────
    $('#geq-size').addEventListener('input', (e) => {
      currentSize = parseInt(e.target.value, 10);
      $('#geq-size-val').textContent = currentSize + 'px';
      if (previewImg.style.display !== 'none') previewImg.style.height = currentSize + 'px';
    });

    // ── Insert ───────────────────────────────────────────────
    insertBtn.addEventListener('click', async () => {
      const latex = getLatex();
      if (!latex) return;
      insertBtn.textContent = 'Inserting…';
      insertBtn.disabled = true;
      document.removeEventListener('keydown', escHandler);

      // Use savedRange from when the toolbar button was clicked.
      // If compose body has a live selection right now, prefer that instead.
      let rangeToUse = savedRange;
      overlay.remove(); // remove modal before focusing compose

      await doInsert(latex, composeBody, rangeToUse, currentSize);
    });

    // ── Core fns ─────────────────────────────────────────────
    function getLatex() {
      return activeTab === 'latex' ? latexInput.value.trim() : visualLatex.trim();
    }

    function renderEqDisplay() {
      eqDisplay.innerHTML = visualLatex.trim()
        ? `<code class="geq-eq-code">${escapeHtml(visualLatex)}</code>`
        : `<span class="geq-eq-placeholder">Click symbols &amp; structures above…</span>`;
    }

    function schedulePreview() {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(updatePreview, 350);
    }

    function updatePreview() {
      const latex = getLatex();
      hint.style.display = 'none'; previewErr.style.display = 'none';
      if (!latex) {
        previewImg.style.display = 'none'; hint.style.display = 'block';
        insertBtn.disabled = true; return;
      }
      const url = buildUrl(latex);
      previewImg.onload = () => { previewImg.style.height = currentSize + 'px'; previewImg.style.display = 'block'; previewErr.style.display = 'none'; insertBtn.disabled = false; };
      previewImg.onerror = () => { previewImg.style.display = 'none'; previewErr.style.display = 'block'; previewErr.textContent = '⚠ Invalid LaTeX — check syntax.'; insertBtn.disabled = true; };
      previewImg.src = url;
    }
  }

  // ── Insert into Gmail ─────────────────────────────────────
  async function doInsert(latex, composeBody, savedRange, size) {
    if (!composeBody) { console.warn('[GEQ] No compose body.'); return; }

    let pngDataUrl;
    try {
      pngDataUrl = await latexToPng(latex);
    } catch (err) {
      console.error('[GEQ] Render failed:', err);
      return;
    }

    // Build the image element
    const img = document.createElement('img');
    img.src = pngDataUrl;
    img.style.cssText = `height:${size}px;width:auto;vertical-align:middle;display:inline-block;border:none;margin:0 2px;`;

    // Focus the compose body first
    composeBody.focus();

    const sel = window.getSelection();
    let range;

    // Try to restore the saved cursor position
    if (
      savedRange &&
      savedRange.commonAncestorContainer &&
      composeBody.contains(savedRange.commonAncestorContainer)
    ) {
      range = savedRange;
    } else {
      // Fallback: place cursor at end of compose body
      range = document.createRange();
      range.selectNodeContents(composeBody);
      range.collapse(false);
    }

    // Restore selection so the user sees the cursor move
    sel.removeAllRanges();
    sel.addRange(range);

    // Insert image directly via Range — no deprecated execCommand needed
    range.deleteContents();
    range.insertNode(img);

    // Move caret to just after the inserted image
    range.setStartAfter(img);
    range.setEndAfter(img);
    sel.removeAllRanges();
    sel.addRange(range);

    // Trigger Gmail's input event so it registers the change
    composeBody.dispatchEvent(new Event('input', { bubbles: true }));
  }

  async function latexToPng(latex) {
    // Fetch the PNG directly from CodeCogs — no canvas, no SVG font issues.
    // Extension content scripts bypass CORS for hosts in host_permissions,
    // so this fetch works even though the page itself couldn't do it.
    const url = buildPngUrl(latex);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`CodeCogs returned HTTP ${resp.status}`);
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // data:image/png;base64,...
      reader.onerror = () => reject(new Error('Blob → dataURL failed'));
      reader.readAsDataURL(blob);
    });
  }

  function buildUrl(latex) {          // SVG — used for live previews & thumbnails
    return CODECOGS_SVG + encodeURIComponent('\\bg{white}\\color{black}' + latex);
  }
  function buildPngUrl(latex) {       // PNG — used for actual insertion into Gmail
    return CODECOGS_PNG + encodeURIComponent('\\dpi{150}\\bg{white}' + latex);
  }

  function escapeAttr(s) { return s.replace(/"/g, '&quot;'); }
  function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

})();