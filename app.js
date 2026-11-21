/*
    * Copyright (C) 2025 [GEORGE PETRAKIS]
    *
    * This program is free software: you can redistribute it and/or modify
    * it under the terms of the GNU General Public License as published by
    * the Free Software Foundation, either version 3 of the License, or
    * (at your option) any later version.
    *
    * This program is distributed in the hope that it will be useful,
    * but WITHOUT ANY WARRANTY; without even the implied warranty of
    * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    * GNU General Public License for more details.
    */
// ============================================================================
// ΕΚΔΟΣΗ ΕΦΑΡΜΟΓΗΣ (APPLICATION VERSION)
// Τροποποιήστε την παρακάτω σταθερά για ενημέρωση της έκδοσης της εφαρμογής
// ============================================================================
const APP_VERSION = "1.1.0";

// Δημιουργούμε ένα global object 'App' για να οργανώσουμε τον κώδικα μας
const App = {
    // 1. Ιδιότητες (Μεταβλητές Κατάστασης)
    // DOM Elements
    mainNumberInput: null,
    problemContainer: null,
    checkBtn: null,
    practiceModeBtn: null,
    startGameBtn: null,
    resultContainer: null,
    gameProgress: null,
    practiceLink: null, // Σύνδεσμος επιστροφής
    aboutModal: null,   // Modal πληροφοριών / credits
    numpadToggleBtn: null,
    numpadEl: null,
    numpadActionBtn: null,
    numpadDotBtn: null,

    // State
    currentProblemFactors: {},
    currentOriginalNumber: 0,
    isInGameMode: false,
    gameProblems: [],
    gameCurrentProblemIndex: 0,
    gameTotalCells: 0,
    gameCorrectCells: 0,
    gameReportData: [],

    // Floating Numpad State
    numpadOpen: false,
    numpadActiveInput: null,
    numpadSelectAllTarget: null,
    mainNumberDirty: false,
    numpadStorageKey: 'factorization_floating_numpad_v1',

    // 2. Μέθοδοι Αρχικοποίησης
    
    /**
     * Αρχικοποιεί τη σελίδα εξάσκησης (index.html)
     */
    initPracticeMode: function() {
        this.isInGameMode = false;
        
        // "Πιάσε" τα DOM elements
        this.mainNumberInput = document.getElementById('mainNumberInput');
        this.problemContainer = document.getElementById('problemContainer');
        this.checkBtn = document.getElementById('checkBtn');
        this.practiceModeBtn = document.getElementById('practiceModeBtn');
        this.resultContainer = document.getElementById('resultContainer');
        
        // Σύνδεσε τα events
        this.checkBtn.addEventListener('click', this.handleCheck.bind(this));
        this.practiceModeBtn.addEventListener('click', this.generatePracticeProblem.bind(this));
        this.mainNumberInput.addEventListener('change', this.handleNumberChange.bind(this));
        this.mainNumberInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.handleNumberChange(); 
                e.target.blur(); 
            }
        });

        // Αυτόματη επιλογή του υπάρχοντος αριθμού (select()) κατά το focus/click
        this.mainNumberInput.addEventListener('focus', (e) => {
            e.target.select();
            this.numpadSelectAllTarget = e.target;
        });
        this.mainNumberInput.addEventListener('click', (e) => {
            e.target.select();
            this.numpadSelectAllTarget = e.target;
        });
        this.mainNumberInput.addEventListener('keydown', () => {
            this.numpadSelectAllTarget = null;
        });

        // Listener για το "cheat key" (PageUp)
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Αρχικοποίηση του Modal Πληροφοριών
        this.initAboutModal();

        // Φόρτωσε το πρώτο πρόβλημα εξάσκησης
        this.generatePracticeProblem();

        // Αρχικοποίηση του Αιωρούμενου Αριθμητικού Πληκτρολογίου
        this.initFloatingNumpad();
    },

    /**
     * Αρχικοποιεί τη σελίδα παιχνιδιού (game_mode.html)
     */
    initGameMode: function() {
        this.isInGameMode = true; // Ξεκινά αμέσως σε game mode
        
        // "Πιάσε" τα DOM elements
        this.mainNumberInput = document.getElementById('mainNumberInput');
        this.problemContainer = document.getElementById('problemContainer');
        this.checkBtn = document.getElementById('checkBtn');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.resultContainer = document.getElementById('resultContainer');
        this.gameProgress = document.getElementById('gameProgress');
        this.practiceLink = document.querySelector('.practice-link');
        
        // Σύνδεσε τα events
        this.checkBtn.addEventListener('click', this.handleCheck.bind(this));
        this.startGameBtn.addEventListener('click', this.startGame.bind(this)); // Για το "Ξανά Παιχνίδι"

        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // --- ΝΕΑ ΑΛΛΑΓΗ v9 ---
        // Listener για το "cheat key"
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        // --- ΤΕΛΟΣ ΑΛΛΑΓΗΣ ---

        // Αρχικοποίηση του Modal Πληροφοριών
        this.initAboutModal();

        // Ξεκίνα το παιχνίδι αμέσως
        this.startGame();

        // Αρχικοποίηση του Αιωρούμενου Αριθμητικού Πληκτρολογίου
        this.initFloatingNumpad();
    },

    // 2.1 Modal Πληροφοριών (About / Credits)
    
    /**
     * Δημιουργεί και ρυθμίζει το modal πληροφοριών ενιαία για όλες τις σελίδες
     */
    initAboutModal: function() {
        const aboutBtn = document.getElementById('aboutBtn');

        // Δημιουργία του modal στο DOM αν δεν προϋπάρχει
        let modal = document.getElementById('aboutModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'aboutModal';
            modal.className = 'modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'modalAppTitle');
            modal.innerHTML = `
                <div class="modal-card">
                    <button type="button" class="modal-close-btn" id="modalCloseBtn" title="Κλείσιμο" aria-label="Κλείσιμο">&times;</button>
                    <h2 class="modal-title" id="modalAppTitle">Εξάσκηση στην Παραγοντοποίηση</h2>
                    <div class="modal-badge">Έκδοση: <span id="modalAppVersion">${APP_VERSION}</span></div>
                    <div class="modal-body">
                        <div class="modal-architect">Program Architect: <strong>George Petrakis</strong></div>
                        <div class="modal-copyright">Copyright: &copy; George Petrakis 2025</div>
                        <div class="modal-license">
                            Άδεια χρήσης: 
                            <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer">GNU GPLv3</a>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            const versionEl = modal.querySelector('#modalAppVersion');
            if (versionEl) {
                versionEl.textContent = APP_VERSION;
            }
        }

        this.aboutModal = modal;

        // Άνοιγμα modal με κλικ στο κουμπί πληροφοριών
        if (aboutBtn) {
            aboutBtn.addEventListener('click', () => this.openAboutModal());
        }

        // Κλείσιμο με το κουμπί '×'
        const closeBtn = modal.querySelector('#modalCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAboutModal());
        }

        // Κλείσιμο με κλικ έξω από την κάρτα (στο overlay)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeAboutModal();
            }
        });

        // Κλείσιμο με το πλήκτρο Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.aboutModal && this.aboutModal.classList.contains('active')) {
                this.closeAboutModal();
            }
        });
    },

    openAboutModal: function() {
        if (this.aboutModal) {
            this.aboutModal.classList.add('active');
            const closeBtn = this.aboutModal.querySelector('#modalCloseBtn');
            if (closeBtn) {
                closeBtn.focus();
            }
        }
    },

    closeAboutModal: function() {
        if (this.aboutModal) {
            this.aboutModal.classList.remove('active');
            const aboutBtn = document.getElementById('aboutBtn');
            if (aboutBtn) {
                aboutBtn.focus();
            }
        }
    },

    // 2.2 Αιωρούμενο & Μετακινούμενο Αριθμητικό Πληκτρολόγιο (Floating & Draggable Numpad)

    /**
     * Εισάγει τα CSS styles του αιωρούμενου πληκτρολογίου ενιαία στο <head>
     */
    injectNumpadStyles: function() {
        if (document.getElementById('floatingNumpadStyles')) return;
        const style = document.createElement('style');
        style.id = 'floatingNumpadStyles';
        style.textContent = `
            .floating-numpad {
                position: fixed;
                top: 20px;
                left: 20px;
                width: 268px;
                max-width: calc(100vw - 16px);
                background-color: #ffffff;
                border: 1px solid #c5ddf5;
                border-radius: 12px;
                box-shadow: 0 12px 30px rgba(0, 45, 90, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08);
                z-index: 900;
                overflow: hidden;
                user-select: none;
                -webkit-user-select: none;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                box-sizing: border-box;
                display: none;
            }
            .floating-numpad.open {
                display: block;
            }
            .numpad-header {
                background-color: #005a9c;
                color: #ffffff;
                padding: 9px 10px 9px 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                cursor: grab;
                touch-action: none;
            }
            .numpad-header.dragging {
                cursor: grabbing;
            }
            .numpad-title-wrap {
                display: flex;
                align-items: center;
                gap: 7px;
                font-size: 0.9rem;
                font-weight: 600;
                letter-spacing: 0.01em;
                pointer-events: none;
            }
            .numpad-grip {
                display: inline-flex;
                align-items: center;
                opacity: 0.85;
            }
            .numpad-close-btn {
                width: 30px;
                height: 30px;
                padding: 0;
                border: none;
                border-radius: 6px;
                background-color: rgba(255, 255, 255, 0.15);
                color: #ffffff;
                font-size: 1.35rem;
                font-weight: 700;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                touch-action: manipulation;
                transition: background-color 0.15s ease;
                flex-shrink: 0;
            }
            .numpad-close-btn:hover {
                background-color: #d9534f;
            }
            .numpad-body {
                padding: 10px;
                background-color: #f4f7f6;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .numpad-utils,
            .numpad-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
            }
            .numpad-key {
                min-height: 52px;
                padding: 0;
                border: 1px solid #d2dde8;
                border-radius: 8px;
                background-color: #ffffff;
                color: #1f2d3d;
                font-family: "Courier New", Courier, monospace;
                font-size: 1.35rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                touch-action: manipulation;
                user-select: none;
                -webkit-user-select: none;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
                transition: background-color 0.1s ease, border-color 0.1s ease, transform 0.08s ease;
            }
            .numpad-key:hover:not(:disabled) {
                background-color: #f0f7ff;
                border-color: #007bff;
            }
            .numpad-key.pressed:not(:disabled),
            .numpad-key:active:not(:disabled) {
                background-color: #d6e9ff;
                border-color: #007bff;
                transform: scale(0.96);
            }
            .numpad-key.util-nav {
                background-color: #e6f2ff;
                border-color: #bfd8f5;
                color: #005a9c;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 1.3rem;
            }
            .numpad-key.util-nav:hover:not(:disabled) {
                background-color: #d4e8ff;
            }
            .numpad-key.util-clear {
                background-color: #fdf0f0;
                border-color: #f1c6c4;
                color: #c9302c;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 1.15rem;
            }
            .numpad-key.util-clear:hover:not(:disabled) {
                background-color: #fae0df;
                border-color: #d9534f;
            }
            .numpad-key.util-backspace {
                background-color: #edf3f8;
                border-color: #c8d7e6;
                color: #005a9c;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 1.25rem;
            }
            .numpad-key:disabled {
                opacity: 0.42;
                cursor: not-allowed;
                background-color: #eceff2;
                color: #8c9aa8;
                border-color: #dce3ea;
                box-shadow: none;
                transform: none;
            }
            .numpad-action-btn {
                width: 100%;
                min-height: 52px;
                padding: 10px 14px;
                border: none;
                border-radius: 8px;
                background-color: #007bff;
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 1rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                touch-action: manipulation;
                user-select: none;
                -webkit-user-select: none;
                box-shadow: 0 2px 5px rgba(0, 123, 255, 0.22);
                transition: background-color 0.15s ease, transform 0.08s ease;
            }
            .numpad-action-btn:hover:not(:disabled) {
                background-color: #0056b3;
            }
            .numpad-action-btn.pressed:not(:disabled),
            .numpad-action-btn:active:not(:disabled) {
                background-color: #004a99;
                transform: scale(0.98);
            }
            .numpad-action-btn.apply-mode {
                background-color: #005a9c;
            }
            .numpad-action-btn.apply-mode:hover:not(:disabled) {
                background-color: #004578;
            }
            .numpad-action-btn:disabled {
                opacity: 0.48;
                cursor: not-allowed;
                box-shadow: none;
                transform: none;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Ανάγνωση και αποθήκευση προτιμήσεων στο localStorage (με try/catch)
     */
    loadNumpadPrefs: function() {
        try {
            const raw = localStorage.getItem(this.numpadStorageKey);
            if (!raw) return { open: false, pos: null };
            const parsed = JSON.parse(raw);
            const open = Boolean(parsed && parsed.open === true);
            const pos = (parsed && parsed.pos &&
                typeof parsed.pos.left === 'number' && !isNaN(parsed.pos.left) &&
                typeof parsed.pos.top === 'number' && !isNaN(parsed.pos.top))
                ? { left: parsed.pos.left, top: parsed.pos.top }
                : null;
            return { open, pos };
        } catch (err) {
            return { open: false, pos: null };
        }
    },

    saveNumpadPrefs: function(partial) {
        try {
            const current = this.loadNumpadPrefs();
            const next = {
                open: (typeof partial.open === 'boolean') ? partial.open : current.open,
                pos: (partial.pos !== undefined) ? partial.pos : current.pos
            };
            localStorage.setItem(this.numpadStorageKey, JSON.stringify(next));
        } catch (err) {
            // Αγνόηση σφαλμάτων localStorage (π.χ. ιδιωτική περιήγηση)
        }
    },

    /**
     * Αρχικοποιεί το αιωρούμενο αριθμητικό πληκτρολόγιο καθολικά για όλες τις σελίδες
     */
    initFloatingNumpad: function() {
        this.injectNumpadStyles();
        this.numpadToggleBtn = document.getElementById('numpadToggleBtn');

        let pad = document.getElementById('floatingNumpad');
        if (!pad) {
            pad = document.createElement('div');
            pad.id = 'floatingNumpad';
            pad.className = 'floating-numpad';
            pad.setAttribute('role', 'region');
            pad.setAttribute('aria-label', 'Αριθμητικό Πληκτρολόγιο');
            pad.innerHTML = `
                <div class="numpad-header" id="numpadDragHandle">
                    <div class="numpad-title-wrap">
                        <span class="numpad-grip" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="4" cy="3" r="1.4"></circle>
                                <circle cx="10" cy="3" r="1.4"></circle>
                                <circle cx="4" cy="8" r="1.4"></circle>
                                <circle cx="10" cy="8" r="1.4"></circle>
                                <circle cx="4" cy="13" r="1.4"></circle>
                                <circle cx="10" cy="13" r="1.4"></circle>
                            </svg>
                        </span>
                        <span>Πληκτρολόγιο</span>
                    </div>
                    <button type="button" class="numpad-close-btn" id="numpadCloseBtn" title="Κλείσιμο" aria-label="Κλείσιμο πληκτρολογίου" tabindex="-1">&times;</button>
                </div>
                <div class="numpad-body">
                    <div class="numpad-utils">
                        <button type="button" class="numpad-key util-nav" data-action="prev" title="Προηγούμενο κελί" aria-label="Προηγούμενο κελί" tabindex="-1">&larr;</button>
                        <button type="button" class="numpad-key util-clear" data-action="clear" title="Καθαρισμός ενεργού κελιού" aria-label="Καθαρισμός ενεργού κελιού" tabindex="-1">C</button>
                        <button type="button" class="numpad-key util-nav" data-action="next" title="Επόμενο κελί" aria-label="Επόμενο κελί" tabindex="-1">&rarr;</button>
                    </div>
                    <div class="numpad-grid">
                        <button type="button" class="numpad-key" data-digit="7" tabindex="-1">7</button>
                        <button type="button" class="numpad-key" data-digit="8" tabindex="-1">8</button>
                        <button type="button" class="numpad-key" data-digit="9" tabindex="-1">9</button>
                        <button type="button" class="numpad-key" data-digit="4" tabindex="-1">4</button>
                        <button type="button" class="numpad-key" data-digit="5" tabindex="-1">5</button>
                        <button type="button" class="numpad-key" data-digit="6" tabindex="-1">6</button>
                        <button type="button" class="numpad-key" data-digit="1" tabindex="-1">1</button>
                        <button type="button" class="numpad-key" data-digit="2" tabindex="-1">2</button>
                        <button type="button" class="numpad-key" data-digit="3" tabindex="-1">3</button>
                        <button type="button" class="numpad-key" id="numpadDotBtn" data-action="dot" title="Τελεία" aria-label="Τελεία" tabindex="-1" disabled>.</button>
                        <button type="button" class="numpad-key" data-digit="0" tabindex="-1">0</button>
                        <button type="button" class="numpad-key util-backspace" data-action="backspace" title="Διαγραφή" aria-label="Διαγραφή τελευταίου ψηφίου" tabindex="-1">&#9003;</button>
                    </div>
                    <button type="button" class="numpad-action-btn" id="numpadActionBtn" tabindex="-1">Έλεγχος</button>
                </div>
            `;
            document.body.appendChild(pad);
        }

        this.numpadEl = pad;
        this.numpadActionBtn = pad.querySelector('#numpadActionBtn');
        this.numpadDotBtn = pad.querySelector('#numpadDotBtn');

        // Κουμπί ενεργοποίησης στην επάνω δεξιά γωνία του .container
        if (this.numpadToggleBtn) {
            this.numpadToggleBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
            this.numpadToggleBtn.addEventListener('click', () => {
                this.toggleNumpad();
            });
        }

        // Κουμπί κλεισίματος × (δεν ξεκινάει drag)
        const closeBtn = pad.querySelector('#numpadCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });
            closeBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeNumpad();
            });
        }

        // Ρύθμιση Drag & Drop με Pointer Events
        this.setupNumpadDragging(pad.querySelector('#numpadDragHandle'));

        // Αποτροπή κλοπής focus από το ενεργό <input> κατά το πάτημα του pad
        const numpadBody = pad.querySelector('.numpad-body');
        if (numpadBody) {
            numpadBody.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
            numpadBody.addEventListener('pointerdown', (e) => {
                const btn = e.target.closest('button');
                if (!btn) {
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                if (btn.disabled) return;

                btn.classList.add('pressed');
                const releasePressed = () => btn.classList.remove('pressed');
                setTimeout(releasePressed, 140);

                if (btn.hasAttribute('data-digit')) {
                    this.insertIntoActiveInput(btn.getAttribute('data-digit'));
                } else if (btn.id === 'numpadActionBtn') {
                    this.handleNumpadAction();
                } else {
                    const action = btn.getAttribute('data-action');
                    if (action === 'dot') {
                        this.insertIntoActiveInput('.');
                    } else if (action === 'backspace') {
                        this.backspaceActiveInput();
                    } else if (action === 'clear') {
                        this.clearActiveInput();
                    } else if (action === 'prev') {
                        this.navigateActiveInput(-1);
                    } else if (action === 'next') {
                        this.navigateActiveInput(1);
                    }
                }
            });
        }

        // Παρακολούθηση focus στα πεδία εισαγωγής της σελίδας
        document.addEventListener('focusin', (e) => {
            if (this.isEditableAppInput(e.target)) {
                this.setNumpadActiveInput(e.target);
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target === this.mainNumberInput && this.mainNumberDirty) {
                this.commitMainNumberChange();
            }
            if (e.target === this.numpadActiveInput) {
                const next = e.relatedTarget;
                const staysInPad = next && this.numpadEl && this.numpadEl.contains(next);
                const movesToEditable = this.isEditableAppInput(next);
                if (!staysInPad && !movesToEditable) {
                    this.clearNumpadActiveInput();
                }
            }
        });

        // Καθαρισμός παλιών κλάσεων σωστού/λάθους και σε πληκτρολόγηση από φυσικό πληκτρολόγιο
        if (this.problemContainer) {
            this.problemContainer.addEventListener('input', (e) => {
                if (e.target && e.target.classList && e.target.classList.contains('quiz-input')) {
                    e.target.classList.remove('wrong', 'correct');
                }
            });
        }

        // Περιορισμός θέσης εντός viewport σε window.resize
        window.addEventListener('resize', () => {
            if (this.numpadOpen && this.numpadEl) {
                const rect = this.numpadEl.getBoundingClientRect();
                const clamped = this.clampNumpadPosition(rect.left, rect.top);
                this.numpadEl.style.left = clamped.left + 'px';
                this.numpadEl.style.top = clamped.top + 'px';
            }
        });

        // Επαναφορά αποθηκευμένης κατάστασης (κλειστό εξ ορισμού)
        const prefs = this.loadNumpadPrefs();
        if (prefs.open) {
            this.openNumpad(true);
        } else {
            this.numpadOpen = false;
            this.updateNumpadToggleUI();
            this.syncNumpadActionButton();
        }
    },

    /**
     * Ρυθμίζει το σύρσιμο του πληκτρολογίου με Pointer Events
     */
    setupNumpadDragging: function(handle) {
        if (!handle || !this.numpadEl) return;

        let dragState = null;

        handle.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.numpad-close-btn')) return;
            if (typeof e.button === 'number' && e.button !== 0) return;

            e.preventDefault();
            const rect = this.numpadEl.getBoundingClientRect();
            dragState = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                origLeft: rect.left,
                origTop: rect.top
            };

            handle.classList.add('dragging');
            try {
                handle.setPointerCapture(e.pointerId);
            } catch (err) {
                // Αγνόηση αν δεν υποστηρίζεται capture
            }
        });

        handle.addEventListener('pointermove', (e) => {
            if (!dragState || e.pointerId !== dragState.pointerId) return;
            e.preventDefault();

            const nextLeft = dragState.origLeft + (e.clientX - dragState.startX);
            const nextTop = dragState.origTop + (e.clientY - dragState.startY);
            const clamped = this.clampNumpadPosition(nextLeft, nextTop);

            this.numpadEl.style.left = clamped.left + 'px';
            this.numpadEl.style.top = clamped.top + 'px';
        });

        const endDrag = (e) => {
            if (!dragState || e.pointerId !== dragState.pointerId) return;

            handle.classList.remove('dragging');
            try {
                if (handle.hasPointerCapture && handle.hasPointerCapture(e.pointerId)) {
                    handle.releasePointerCapture(e.pointerId);
                }
            } catch (err) {
                // Αγνόηση
            }

            const rect = this.numpadEl.getBoundingClientRect();
            const clamped = this.clampNumpadPosition(rect.left, rect.top);
            this.numpadEl.style.left = clamped.left + 'px';
            this.numpadEl.style.top = clamped.top + 'px';
            this.saveNumpadPrefs({ pos: clamped });

            dragState = null;
        };

        handle.addEventListener('pointerup', endDrag);
        handle.addEventListener('pointercancel', endDrag);
    },

    clampNumpadPosition: function(left, top) {
        const margin = 8;
        const padW = this.numpadEl ? (this.numpadEl.offsetWidth || 268) : 268;
        const padH = this.numpadEl ? (this.numpadEl.offsetHeight || 390) : 390;
        const maxLeft = Math.max(margin, window.innerWidth - padW - margin);
        const maxTop = Math.max(margin, window.innerHeight - padH - margin);
        return {
            left: Math.round(Math.min(Math.max(margin, left), maxLeft)),
            top: Math.round(Math.min(Math.max(margin, top), maxTop))
        };
    },

    computeSmartNumpadPosition: function() {
        const margin = 12;
        const gap = 16;
        const padW = this.numpadEl ? (this.numpadEl.offsetWidth || 268) : 268;
        const padH = this.numpadEl ? (this.numpadEl.offsetHeight || 390) : 390;
        const container = document.querySelector('.container');

        if (container) {
            const cRect = container.getBoundingClientRect();
            // 1. Έλεγχος χώρου δεξιά από το .container
            if (cRect.right + gap + padW + margin <= window.innerWidth) {
                return this.clampNumpadPosition(cRect.right + gap, cRect.top);
            }
            // 2. Έλεγχος χώρου αριστερά από το .container
            if (cRect.left - gap - padW >= margin) {
                return this.clampNumpadPosition(cRect.left - gap - padW, cRect.top);
            }
        }

        // 3. Εναλλακτικά στην κάτω δεξιά γωνία
        return this.clampNumpadPosition(
            window.innerWidth - padW - margin,
            window.innerHeight - padH - margin
        );
    },

    toggleNumpad: function() {
        if (this.numpadOpen) {
            this.closeNumpad();
        } else {
            this.openNumpad(false);
        }
    },

    openNumpad: function(skipSave) {
        if (!this.numpadEl) return;
        this.numpadOpen = true;
        this.numpadEl.classList.add('open');
        this.updateNumpadToggleUI();

        const prefs = this.loadNumpadPrefs();
        const pos = prefs.pos
            ? this.clampNumpadPosition(prefs.pos.left, prefs.pos.top)
            : this.computeSmartNumpadPosition();

        this.numpadEl.style.left = pos.left + 'px';
        this.numpadEl.style.top = pos.top + 'px';

        this.syncAllInputModes();

        // Αν υπάρχει ήδη εστιασμένο επεξεργάσιμο πεδίο, επισήμανέ το
        if (this.isEditableAppInput(document.activeElement)) {
            this.setNumpadActiveInput(document.activeElement);
        } else {
            this.syncNumpadDotButton();
            this.syncNumpadActionButton();
        }

        if (!skipSave) {
            this.saveNumpadPrefs({ open: true });
        }
    },

    closeNumpad: function() {
        if (!this.numpadEl) return;
        this.numpadOpen = false;
        this.numpadEl.classList.remove('open');
        this.updateNumpadToggleUI();
        this.clearNumpadActiveInput();
        this.syncAllInputModes();
        this.saveNumpadPrefs({ open: false });
    },

    updateNumpadToggleUI: function() {
        if (!this.numpadToggleBtn) return;
        this.numpadToggleBtn.classList.toggle('active', this.numpadOpen);
        this.numpadToggleBtn.setAttribute('aria-pressed', this.numpadOpen ? 'true' : 'false');
    },

    /**
     * Διαχείριση inputmode="none" όσο το pad είναι ανοιχτό και επαναφορά όταν κλείνει
     */
    applyInputModeToElement: function(input, disableOSKeyboard) {
        if (!input || input.tagName !== 'INPUT') return;
        if (disableOSKeyboard) {
            if (!input.hasAttribute('data-orig-inputmode')) {
                const orig = input.getAttribute('inputmode');
                input.setAttribute('data-orig-inputmode', orig === null ? '__NONE__' : orig);
            }
            input.setAttribute('inputmode', 'none');
        } else if (input.hasAttribute('data-orig-inputmode')) {
            const orig = input.getAttribute('data-orig-inputmode');
            if (orig === '__NONE__') {
                input.removeAttribute('inputmode');
            } else {
                input.setAttribute('inputmode', orig);
            }
            input.removeAttribute('data-orig-inputmode');
        }
    },

    syncAllInputModes: function() {
        const inputs = document.querySelectorAll('.container input');
        inputs.forEach((input) => {
            this.applyInputModeToElement(input, this.numpadOpen);
        });
    },

    /**
     * Έλεγχος και επιλογή ενεργών πεδίων εισαγωγής
     */
    isPracticePage: function() {
        return Boolean(this.practiceModeBtn);
    },

    isEditableAppInput: function(el) {
        if (!el || el.tagName !== 'INPUT') return false;
        if (el === this.mainNumberInput && !this.isPracticePage()) return false;
        if (el.disabled || el.readOnly) return false;
        if (!el.closest('.container')) return false;
        if (el.closest('.hidden')) return false;
        return el.offsetParent !== null;
    },

    getSolvingInputs: function() {
        if (!this.problemContainer || this.problemContainer.classList.contains('hidden')) {
            return [];
        }
        return Array.from(this.problemContainer.querySelectorAll('.quiz-input'))
            .filter((el) => this.isEditableAppInput(el));
    },

    getEditableInputs: function() {
        const list = [];
        if (this.isEditableAppInput(this.mainNumberInput)) {
            list.push(this.mainNumberInput);
        }
        return list.concat(this.getSolvingInputs());
    },

    inputAllowsDot: function(input) {
        if (!input) return false;
        if (input.dataset && (input.dataset.allowDecimal === 'true' || input.dataset.allowDot === 'true')) {
            return true;
        }
        const step = input.getAttribute('step');
        if (step && (step === 'any' || step.includes('.'))) {
            return true;
        }
        return false;
    },

    setNumpadActiveInput: function(input) {
        if (this.numpadActiveInput && this.numpadActiveInput !== input) {
            this.numpadActiveInput.classList.remove('numpad-active-input');
        }
        this.numpadActiveInput = this.isEditableAppInput(input) ? input : null;
        if (this.numpadActiveInput && this.numpadOpen) {
            this.numpadActiveInput.classList.add('numpad-active-input');
        }
        this.syncNumpadDotButton();
        this.syncNumpadActionButton();
    },

    clearNumpadActiveInput: function() {
        if (this.numpadActiveInput) {
            this.numpadActiveInput.classList.remove('numpad-active-input');
        }
        this.numpadActiveInput = null;
        this.numpadSelectAllTarget = null;
        this.syncNumpadDotButton();
        this.syncNumpadActionButton();
    },

    ensureActiveInput: function() {
        if (this.numpadActiveInput &&
            document.body.contains(this.numpadActiveInput) &&
            this.isEditableAppInput(this.numpadActiveInput)) {
            if (document.activeElement !== this.numpadActiveInput) {
                this.numpadActiveInput.focus();
            }
            if (this.numpadOpen) {
                this.numpadActiveInput.classList.add('numpad-active-input');
            }
            return this.numpadActiveInput;
        }

        // Αυτόματη εστίαση στο πρώτο κενό κελί επίλυσης
        const solving = this.getSolvingInputs();
        let target = solving.find((el) => el.value === '') || solving[0] || null;
        if (!target && this.isEditableAppInput(this.mainNumberInput)) {
            target = this.mainNumberInput;
        }

        if (target) {
            target.focus();
            this.setNumpadActiveInput(target);
        }
        return target;
    },

    syncNumpadDotButton: function() {
        if (!this.numpadDotBtn) return;
        const allows = this.inputAllowsDot(this.numpadActiveInput);
        this.numpadDotBtn.disabled = !allows;
    },

    syncNumpadActionButton: function() {
        if (!this.numpadActionBtn) return;

        const editingMainNumber = this.numpadActiveInput &&
            this.numpadActiveInput === this.mainNumberInput &&
            this.isEditableAppInput(this.mainNumberInput);

        if (editingMainNumber) {
            this.numpadActionBtn.textContent = 'Εφαρμογή';
            this.numpadActionBtn.classList.add('apply-mode');
            this.numpadActionBtn.disabled = false;
            return;
        }

        this.numpadActionBtn.classList.remove('apply-mode');
        if (this.checkBtn && !this.checkBtn.classList.contains('hidden')) {
            this.numpadActionBtn.textContent = this.checkBtn.textContent || 'Έλεγχος';
            this.numpadActionBtn.disabled = false;
        } else {
            this.numpadActionBtn.textContent = (this.checkBtn && this.checkBtn.textContent) ? this.checkBtn.textContent : 'Έλεγχος';
            this.numpadActionBtn.disabled = true;
        }
    },

    /**
     * Εισαγωγή, διαγραφή, καθαρισμός και πλοήγηση από το pad
     */
    insertIntoActiveInput: function(char) {
        const input = this.ensureActiveInput();
        if (!input) return;
        if (char === '.' && !this.inputAllowsDot(input)) return;

        // Αφαίρεση παλιών κλάσεων σωστού/λάθους μόλις ξεκινήσει διόρθωση
        input.classList.remove('wrong', 'correct');

        if (input === this.mainNumberInput && this.numpadSelectAllTarget === input) {
            input.value = char;
            this.numpadSelectAllTarget = null;
        } else if (input.type !== 'number' && typeof input.selectionStart === 'number') {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const val = input.value || '';
            input.value = val.slice(0, start) + char + val.slice(end);
            const pos = start + char.length;
            input.setSelectionRange(pos, pos);
        } else {
            if (char === '.' && (input.value || '').includes('.')) return;
            input.value = (input.value || '') + char;
        }

        if (input === this.mainNumberInput) {
            this.mainNumberDirty = true;
        }
    },

    backspaceActiveInput: function() {
        const input = this.ensureActiveInput();
        if (!input) return;

        input.classList.remove('wrong', 'correct');
        this.numpadSelectAllTarget = null;

        if (input.type !== 'number' && typeof input.selectionStart === 'number') {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const val = input.value || '';
            if (start !== end) {
                input.value = val.slice(0, start) + val.slice(end);
                input.setSelectionRange(start, start);
            } else if (start > 0) {
                input.value = val.slice(0, start - 1) + val.slice(end);
                input.setSelectionRange(start - 1, start - 1);
            }
        } else {
            const val = input.value || '';
            if (val.length > 0) {
                input.value = val.slice(0, -1);
            }
        }

        if (input === this.mainNumberInput) {
            this.mainNumberDirty = true;
        }
    },

    clearActiveInput: function() {
        const input = this.ensureActiveInput();
        if (!input) return;

        input.classList.remove('wrong', 'correct');
        this.numpadSelectAllTarget = null;
        input.value = '';

        if (input === this.mainNumberInput) {
            this.mainNumberDirty = true;
        }
    },

    commitMainNumberChange: function(force) {
        if (this.isInGameMode) {
            this.mainNumberDirty = false;
            return;
        }
        if (!this.mainNumberDirty && !force) return;
        this.mainNumberDirty = false;
        this.handleNumberChange();
    },

    navigateActiveInput: function(direction) {
        // Αν επεξεργαζόμαστε τον αρχικό αριθμό και υπάρχουν εκκρεμείς αλλαγές, εφάρμοσέ τες πρώτα
        if (this.numpadActiveInput === this.mainNumberInput && this.mainNumberDirty) {
            this.commitMainNumberChange();
            const solvingAfterCommit = this.getSolvingInputs();
            if (solvingAfterCommit.length > 0) {
                const target = direction > 0 ? solvingAfterCommit[0] : solvingAfterCommit[solvingAfterCommit.length - 1];
                target.focus();
                this.setNumpadActiveInput(target);
            }
            return;
        }

        const inputs = this.getEditableInputs();
        if (inputs.length === 0) return;

        const currentIndex = inputs.indexOf(this.numpadActiveInput);
        let nextInput = null;

        if (currentIndex === -1) {
            const solving = this.getSolvingInputs();
            nextInput = solving.find((el) => el.value === '') || solving[0] || inputs[0];
        } else {
            const targetIndex = Math.max(0, Math.min(inputs.length - 1, currentIndex + direction));
            nextInput = inputs[targetIndex];
        }

        if (nextInput) {
            nextInput.focus();
            this.setNumpadActiveInput(nextInput);
        }
    },

    handleNumpadAction: function() {
        if (this.numpadActiveInput === this.mainNumberInput && this.isEditableAppInput(this.mainNumberInput)) {
            this.commitMainNumberChange(true);
            const solving = this.getSolvingInputs();
            if (solving.length > 0) {
                solving[0].focus();
                this.setNumpadActiveInput(solving[0]);
            } else {
                this.mainNumberInput.blur();
                this.clearNumpadActiveInput();
            }
            return;
        }

        if (this.checkBtn && !this.checkBtn.classList.contains('hidden')) {
            this.handleCheck();
        }
    },
    
    // 3. Βοηθητικές Συναρτήσεις (is... format... keydown...)

    handleBeforeUnload: function(e) {
        if (this.isInGameMode) {
            const confirmationMessage = 'Έχετε µη αποθηκευµένη πρόοδο. Είστε σίγουροι ότι θέλετε να φύγετε;';
            e.preventDefault();
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    },
    
    // --- ΝΕΑ ΑΛΛΑΓΗ v9 ---
    /**
     * Χειρίζεται το πάτημα πλήκτρων (ψάχνει για PageUp)
     */
    handleKeyDown: function(e) {
        // Αν πατήθηκε το PageUp (σε Practice Mode ή Game Mode) και υπάρχει ενεργό πρόβλημα
        const isModalOpen = this.aboutModal && this.aboutModal.classList.contains('active');
        const hasActiveProblem = this.currentOriginalNumber > 1 &&
            this.problemContainer &&
            !this.problemContainer.classList.contains('hidden');

        if (e.key === 'PageUp' && !isModalOpen && hasActiveProblem) {
            e.preventDefault(); // Σταμάτα το default scrolling
            this.fillCorrectAnswers(); // Συμπλήρωσε τις απαντήσεις
        }
    },
    
    /**
     * Συμπληρώνει αυτόματα τον πίνακα με τη σωστή (canonical) λύση
     */
    fillCorrectAnswers: function() {
        // 1. Βρες τη σωστή λύση (με τον μικρότερο πρώτο)
        const { steps } = this.calculateFactorization(this.currentOriginalNumber);
        
        // 2. Πάρε όλα τα κελιά εισαγωγής από τον τρέχοντα πίνακα
        const quotientInputs = this.problemContainer.querySelectorAll('.quiz-input.quotient');
        const divisorInputs = this.problemContainer.querySelectorAll('.quiz-input.divisor');

        // 3. Συμπλήρωσε τον πρώτο διαιρέτη
        if (divisorInputs[0] && steps[0]) {
            divisorInputs[0].value = steps[0].divisor;
        }

        // 4. Συμπλήρωσε τα υπόλοιπα κελιά
        for (let i = 1; i < steps.length; i++) {
            if (quotientInputs[i - 1]) {
                quotientInputs[i - 1].value = steps[i].number;
            }
            if (divisorInputs[i]) {
                divisorInputs[i].value = steps[i].divisor;
            }
        }
    },
    // --- ΤΕΛΟΣ ΑΛΛΑΓΗΣ ---

    isPrime: function(num) {
        if (num <= 1) return false;
        if (num === 2) return true;
        if (num % 2 === 0) return false;
        for (let i = 3; (i * i) <= num; i += 2) {
            if (num % i === 0) return false;
        }
        return true;
    },
    
    formatFactors: function(factors, originalNum) {
        let resultParts = [];
        const sortedBases = Object.keys(factors).sort((a, b) => a - b);
        for (const base of sortedBases) {
            const exponent = factors[base];
            if (exponent === 1) {
                resultParts.push(base);
            } else {
                resultParts.push(`${base}<sup>${exponent}</sup>`); 
            }
        }
        
        if (sortedBases.length === 1 && factors[sortedBases[0]] === 1 && sortedBases[0] == originalNum) {
            return `${sortedBases[0]} (Πρώτος αριθμός)`;
        }
        return resultParts.join(' &middot; ');
    },

    // 4. Κύρια Λογική Ελέγχου
    
    handleCheck: function() {
        // Αφαίρεση focus και μπλε highlight πριν τον έλεγχο ώστε να φαίνονται καθαρά πράσινο/κόκκινο
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
            document.activeElement.blur();
        }
        this.clearNumpadActiveInput();

        const { allCorrect, correctCellsThisRound, userReportedSteps } = this.validateCurrentProblem(); 
        
        if (this.isInGameMode) {
            this.gameCorrectCells += correctCellsThisRound;
            this.gameReportData.push({
                problemNumber: this.currentOriginalNumber,
                correctFactors: {...this.currentProblemFactors},
                wasCorrect: allCorrect,
                userSteps: userReportedSteps 
            });
            
            this.gameCurrentProblemIndex++;
            if (this.gameCurrentProblemIndex < 5) {
                this.loadGameProblem(this.gameCurrentProblemIndex);
            } else {
                this.showFinalScore();
            }
        } else {
            this.displayResultString(this.currentProblemFactors, this.currentOriginalNumber, allCorrect);
        }

        this.syncNumpadActionButton();
    },
    
    validateCurrentProblem: function() {
        let allCorrect = true;
        let currentNumber = this.currentOriginalNumber;
        let correctCellsThisRound = 0;
        const userReportedSteps = []; 

        const rows = this.problemContainer.querySelectorAll('tbody tr');
        
        for (let i = 0; i < rows.length - 1; i++) {
            const row = rows[i];
            const divisorInput = row.querySelector('.quiz-input.divisor');
            const quotientInput = (i > 0) ? rows[i].querySelector('.quiz-input.quotient') : null;

            if (!this.isInGameMode) { 
                divisorInput.classList.remove('wrong', 'correct');
                if (quotientInput) quotientInput.classList.remove('wrong', 'correct');
            }

            let studentQuotient = quotientInput ? parseInt(quotientInput.value, 10) : null;
            if (i > 0 && isNaN(studentQuotient)) studentQuotient = 0; 
            
            let studentDivisor = parseInt(divisorInput.value, 10);
            if (isNaN(studentDivisor)) studentDivisor = 0; 

            let quotientIsCorrect = false;
            let divisorIsCorrect = false;

            if (i > 0) {
                if (studentQuotient === currentNumber) {
                    if (!this.isInGameMode) quotientInput.classList.add('correct');
                    correctCellsThisRound++;
                    quotientIsCorrect = true;
                } else {
                    if (!this.isInGameMode) quotientInput.classList.add('wrong');
                    allCorrect = false;
                    currentNumber = NaN; 
                }
            }

            if (isNaN(currentNumber)) { 
                 if (!this.isInGameMode) divisorInput.classList.add('wrong');
                 allCorrect = false;
            } else if (studentDivisor === 0 || !this.isPrime(studentDivisor) || currentNumber % studentDivisor !== 0) {
                if (!this.isInGameMode) divisorInput.classList.add('wrong');
                allCorrect = false;
            } else {
                if (!this.isInGameMode) divisorInput.classList.add('correct');
                correctCellsThisRound++; 
                divisorIsCorrect = true;
                currentNumber = currentNumber / studentDivisor; 
            }
            
            userReportedSteps.push({
                quotient: studentQuotient, 
                divisor: studentDivisor, 
                quotientIsCorrect: quotientIsCorrect, 
                divisorIsCorrect: divisorIsCorrect 
            });
        }
        
        if (allCorrect && currentNumber !== 1) {
           allCorrect = false;
           if (!this.isInGameMode) {
               const lastDivisorInput = rows[rows.length - 2]?.querySelector('.quiz-input.divisor');
               if (lastDivisorInput) { 
                   lastDivisorInput.classList.remove('correct');
                   lastDivisorInput.classList.add('wrong');
               }
           }
        }
        
        return { allCorrect, correctCellsThisRound, userReportedSteps };
    },

    // 5. Λογική Δημιουργίας Προβλήματος (Game & Practice)
    
    startGame: function() {
        this.isInGameMode = true; 
        this.gameProblems = [];
        this.gameCurrentProblemIndex = 0;
        this.gameTotalCells = 0;
        this.gameCorrectCells = 0;
        this.gameReportData = [];

        // UI
        this.mainNumberInput.disabled = true;
        if (this.practiceLink) this.practiceLink.classList.add('hidden'); 
        if (this.startGameBtn) this.startGameBtn.classList.add('hidden'); 
        this.checkBtn.classList.remove('hidden');
        this.checkBtn.textContent = "Έλεγχος & Επόμενο";
        this.problemContainer.classList.remove('hidden');
        this.resultContainer.classList.remove('visible');
        this.gameProgress.classList.remove('hidden');

        while (this.gameProblems.length < 5) {
            let num;
            let isPrimeCheck = true;
            while (isPrimeCheck) {
                num = Math.floor(Math.random() * (500 - 40 + 1)) + 40;
                if (!this.isPrime(num) && !this.gameProblems.includes(num)) {
                    isPrimeCheck = false;
                }
            }
            this.gameProblems.push(num);
        }
        
        this.loadGameProblem(0);
    },
    
    loadGameProblem: function(index) {
        const num = this.gameProblems[index];
        this.gameProgress.textContent = `Πρόβλημα ${index + 1} από 5`; 
        this.mainNumberInput.value = num;
        this.clearNumpadActiveInput();
        
        const { steps } = this.buildProblemUI(num); 
        
        const cellsForThisProblem = (steps.length - 1) + steps.length;
        this.gameTotalCells += cellsForThisProblem;
        
        if (index === 4) {
            this.checkBtn.textContent = "Τέλος & Βαθμολογία";
        }
        this.syncNumpadActionButton();
    },

    generatePracticeProblem: function() {
        this.isInGameMode = false;
        this.mainNumberDirty = false;
        this.mainNumberInput.disabled = false;
        this.problemContainer.classList.remove('hidden');
        this.checkBtn.classList.remove('hidden');
        this.checkBtn.textContent = "Έλεγχος";
        this.resultContainer.classList.remove('visible');
        this.clearNumpadActiveInput();
        
        let isPrimeCheck = true;
        let num;
        while (isPrimeCheck) {
            num = Math.floor(Math.random() * (500 - 40 + 1)) + 40;
            if (!this.isPrime(num)) isPrimeCheck = false;
        }
        
        this.mainNumberInput.value = num;
        this.buildProblemUI(num);
        this.syncNumpadActionButton();
    },
    
    handleNumberChange: function() {
         if (this.isInGameMode) return; 
         this.mainNumberDirty = false;
         const num = parseInt(this.mainNumberInput.value, 10);
         this.buildProblemUI(num);
         this.syncNumpadActionButton();
    },
    
    // 6. Λογική Δημιουργίας UI (Πίνακας & Αποτελέσματα)
    
    buildProblemUI: function(num) {
        if (this.resultContainer) this.resultContainer.classList.remove('visible');
        this.problemContainer.innerHTML = '';

        if (isNaN(num) || num <= 1) {
            this.problemContainer.innerHTML = '<p style="color: red; font-weight: bold;">Παρακαλώ εισάγετε αριθμό μεγαλύτερο του 1.</p>';
            this.currentOriginalNumber = 0;
            this.currentProblemFactors = {};
            return { steps: [], factors: {} };
        }
        
        const { steps, factors } = this.calculateFactorization(num);
        
        this.currentOriginalNumber = num;
        this.currentProblemFactors = factors;
        
        this.displayProblemTable(num, steps.length);
        return { steps, factors };
    },

    calculateFactorization: function(num) {
        let n = num;
        const steps = [];       
        const factors = {};     
        let divisor = 2; 

        while (n > 1) {
            if (n % divisor === 0) {
                steps.push({ number: n, divisor: divisor });
                factors[divisor] = (factors[divisor] || 0) + 1;
                n = n / divisor;
            } else {
                divisor = (divisor === 2) ? 3 : divisor + 2; 
                if (divisor * divisor > n && n > 1) {
                    steps.push({ number: n, divisor: n });
                    factors[n] = (factors[n] || 0) + 1;
                    break; 
                }
            }
        }
        return { steps, factors };
    },

    displayProblemTable: function(originalNumber, stepCount) {
        const table = document.createElement('table');
        table.className = 'steps-table';
        const tbody = document.createElement('tbody');

        const trFirst = document.createElement('tr');
        trFirst.innerHTML = `<td>${originalNumber}</td>
                             <td><input type="number" class="quiz-input divisor"></td>`;
        tbody.appendChild(trFirst);
        
        for(let i = 0; i < stepCount - 1; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><input type="number" class="quiz-input quotient"></td>
                            <td><input type="number" class="quiz-input divisor"></td>`;
            tbody.appendChild(tr);
        }
        
        const trLast = document.createElement('tr');
        trLast.innerHTML = `<td>1</td><td></td>`;
        tbody.appendChild(trLast);

        table.appendChild(tbody);
        this.problemContainer.appendChild(table);
        this.syncAllInputModes();
    },

    showFinalScore: function() {
        this.isInGameMode = false; 
        this.clearNumpadActiveInput();

        const score = (this.gameTotalCells > 0) ? Math.round((this.gameCorrectCells / this.gameTotalCells) * 100) : 0;

        // UI
        this.problemContainer.classList.add('hidden');
        this.checkBtn.classList.add('hidden');
        this.gameProgress.classList.add('hidden');
        
        if (this.startGameBtn) this.startGameBtn.classList.remove('hidden');
        if (this.practiceLink) this.practiceLink.classList.remove('hidden');
        this.mainNumberInput.disabled = false;
        this.syncAllInputModes();
        this.syncNumpadActionButton();
        
        const scoreHTML = `<h2>Τέλος Παιχνιδιού!</h2>
                           <p>Η τελική σου βαθμολογία: <strong>${score}%</strong></p>
                           <p>(${this.gameCorrectCells} σωστά κελιά από ${this.gameTotalCells} σύνολο)</p>`;
        
        const reportHTML = this.buildReportHTML(this.gameReportData);

        this.resultContainer.innerHTML = scoreHTML + reportHTML;
        this.resultContainer.classList.add('visible');
    },
    
    buildReportHTML: function(reportData) {
        let html = '<div class="report-section"><h2>Αναλυτική Αναφορά</h2>';
        
        reportData.forEach((item, index) => {
            const statusClass = item.wasCorrect ? 'correct' : 'incorrect';
            const statusIcon = item.wasCorrect ? '&#9989;' : '&#10060;'; 
            
            html += `<div class="report-item ${statusClass}">
                        <h4>${statusIcon} Πρόβλημα ${index + 1}: ${item.problemNumber}</h4>`;
            
            // --- Πίνακας Εισόδου Χρήστη ---
            html += '<strong>Η προσπάθειά σου:</strong><table class="report-steps-table">';
            
            // Ασφάλεια: Έλεγχος αν υπάρχουν βήματα
            if(item.userSteps && item.userSteps.length > 0) {
                let firstStep = item.userSteps[0];
                html += `<tr>
                            <td class="correct">${item.problemNumber}</td>
                            <td class="${firstStep.divisorIsCorrect ? 'correct' : 'wrong'}">${firstStep.divisor}</td>
                         </tr>`;
                
                for (let i = 1; i < item.userSteps.length; i++) {
                    const step = item.userSteps[i];
                    html += `<tr>
                                <td class="${step.quotientIsCorrect ? 'correct' : 'wrong'}">${step.quotient}</td>
                                <td class="${step.divisorIsCorrect ? 'correct' : 'wrong'}">${step.divisor}</td>
                             </tr>`;
                }
            }
            
            html += '<tr><td>1</td><td></td></tr>';
            html += '</table>';
            
            if (!item.wasCorrect) {
                const factorsString = this.formatFactors(item.correctFactors, item.problemNumber);
                html += `<p style="margin-top: 10px;"><strong>Σωστή Ανάλυση:</strong> ${item.problemNumber} = ${factorsString}</p>`;
            }
            
            html += `</div>`;
        });
        
        html += '</div>';
        return html;
    },
    
    displayResultString: function(factors, originalNumber, allCorrect) {
        if (originalNumber === 0) return; 

        const factorsString = this.formatFactors(factors, originalNumber);
        
        let resultHTML = '';
        if (allCorrect) {
            resultHTML = '<strong>Συγχαρητήρια!</strong><br>';
        } else {
             resultHTML = '<strong>Προσπάθησε ξανά. Η σωστή ανάλυση (με δυνάμεις) είναι:</strong><br>';
        }
        
        if (Object.keys(factors).length === 1 && Object.keys(factors)[0] == originalNumber) {
             resultHTML = '<strong>Σωστά! Ο αριθμός είναι πρώτος.</strong><br>';
        }

        this.resultContainer.innerHTML = `${resultHTML} ${originalNumber} = ${factorsString}`;
        this.resultContainer.classList.add('visible');
    }
};
