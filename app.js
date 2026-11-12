// ============================================================================
// ΕΚΔΟΣΗ ΕΦΑΡΜΟΓΗΣ (APPLICATION VERSION)
// Τροποποιήστε την παρακάτω σταθερά για ενημέρωση της έκδοσης της εφαρμογής
// ============================================================================
const APP_VERSION = "1.0.0";

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

    // State
    currentProblemFactors: {},
    currentOriginalNumber: 0,
    isInGameMode: false,
    gameProblems: [],
    gameCurrentProblemIndex: 0,
    gameTotalCells: 0,
    gameCorrectCells: 0,
    gameReportData: [],

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
        this.mainNumberInput.addEventListener('focus', function(e) {
            e.target.select();
        });
        this.mainNumberInput.addEventListener('click', function(e) {
            e.target.select();
        });

        // Αρχικοποίηση του Modal Πληροφοριών
        this.initAboutModal();

        // Φόρτωσε το πρώτο πρόβλημα εξάσκησης
        this.generatePracticeProblem();
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
        // Αν είμαστε σε game mode ΚΑΙ πατήθηκε το PageUp (κωδικός 'PageUp')
        if (this.isInGameMode && e.key === 'PageUp') {
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
        
        const { steps } = this.buildProblemUI(num); 
        
        const cellsForThisProblem = (steps.length - 1) + steps.length;
        this.gameTotalCells += cellsForThisProblem;
        
        if (index === 4) {
            this.checkBtn.textContent = "Τέλος & Βαθμολογία";
        }
    },

    generatePracticeProblem: function() {
        this.isInGameMode = false;
        this.mainNumberInput.disabled = false;
        this.problemContainer.classList.remove('hidden');
        this.checkBtn.classList.remove('hidden');
        this.checkBtn.textContent = "Έλεγχος";
        this.resultContainer.classList.remove('visible');
        
        let isPrimeCheck = true;
        let num;
        while (isPrimeCheck) {
            num = Math.floor(Math.random() * (500 - 40 + 1)) + 40;
            if (!this.isPrime(num)) isPrimeCheck = false;
        }
        
        this.mainNumberInput.value = num;
        this.buildProblemUI(num);
    },
    
    handleNumberChange: function() {
         if (this.isInGameMode) return; 
         const num = parseInt(this.mainNumberInput.value, 10);
         this.buildProblemUI(num);
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
    },

    showFinalScore: function() {
        this.isInGameMode = false; 

        const score = (this.gameTotalCells > 0) ? Math.round((this.gameCorrectCells / this.gameTotalCells) * 100) : 0;

        // UI
        this.problemContainer.classList.add('hidden');
        this.checkBtn.classList.add('hidden');
        this.gameProgress.classList.add('hidden');
        
        if (this.startGameBtn) this.startGameBtn.classList.remove('hidden');
        if (this.practiceLink) this.practiceLink.classList.remove('hidden');
        this.mainNumberInput.disabled = false;
        
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
