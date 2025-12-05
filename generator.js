// --- 1. CORE DATA STRUCTURES (Converted to JavaScript Object) ---
const QA_TEMPLATES = {
    "Recall": {
        "templates": [
            "Define the term **{concept}**.",
            "What is the main function of **{concept}** in the system?",
            "List the safety prerequisites for using **{concept}**."
        ],
        "answer_hints": ["Provide the precise definition.", "State the primary role.", "List 3-5 necessary safety steps."],
        "description": "Tests basic definitions, safety, and function."
    },
    "Procedure": {
        "templates": [
            "Describe the step-by-step process for performing **{concept}**.",
            "What is the correct sequence of tools required to complete **{concept}**?",
            "Justify the need for step 3 when executing **{concept}**."
        ],
        "answer_hints": ["Outline 5-7 numbered steps.", "List tools in order, with justification.", "Explain the technical or safety reason."],
        "description": "Tests knowledge of sequences, steps, and process justification."
    },
    "Troubleshooting": {
        "templates": [
            "If a system fails to initiate after performing **{concept}**, what are the first three checks you would perform?",
            "A client reports a common issue related to **{concept}**. Explain a logical diagnostic pathway.",
            "What potential hazards or errors are introduced if the tolerance for **{concept}** is ignored?"
        ],
        "answer_hints": ["List three logical steps for fault isolation.", "Outline a flow chart of checks.", "Identify the specific risk."],
        "description": "Tests fault diagnosis, logical thinking, and risk assessment."
    }
};

// --- 2. CORE GENERATION LOGIC ---
function generateQASet(concepts, level, numQuestions) {
    /**
     * Generates Q&A based on concepts, level, and count.
     */
    
    // Validate inputs
    if (!QA_TEMPLATES[level] || concepts.length === 0 || numQuestions <= 0) {
        return [];
    }

    const templatesData = QA_TEMPLATES[level];
    const templates = templatesData.templates;
    const hints = templatesData.answer_hints;
    const qaSets = [];

    // Helper function to pick a random item from an array
    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    // Select templates randomly, matching the number of questions requested
    const templateIndices = [];
    for (let i = 0; i < numQuestions; i++) {
        templateIndices.push(Math.floor(Math.random() * templates.length));
    }

    for (let i = 0; i < numQuestions; i++) {
        const index = templateIndices[i];
        const template = templates[index];
        const hint = hints[index];
        const concept = getRandomItem(concepts);
        
        // Simple string replacement for {concept}
        const finalQuestion = template.replace("{concept}", concept);
        
        qaSets.push({
            Q: finalQuestion,
            A: hint
        });
    }
            
    return qaSets;
}

// --- 3. UI HANDLER FUNCTION ---
function handleSubmit(event) {
    // Prevent the default form submission (which reloads the page)
    event.preventDefault(); 
    
    const conceptsInput = document.getElementById('concepts').value;
    const levelSelect = document.getElementById('level');
    const level = levelSelect.value;
    const numQuestionsInput = document.getElementById('num_questions').value;

    const resultsContainer = document.getElementById('qa-results-container');
    const errorMessageDiv = document.getElementById('error-message');
    
    resultsContainer.innerHTML = ''; // Clear previous results
    errorMessageDiv.innerHTML = ''; // Clear previous errors

    try {
        // Parse and validate inputs
        const concepts = conceptsInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
        const numQuestions = parseInt(numQuestionsInput, 10);

        if (concepts.length === 0) {
            errorMessageDiv.innerHTML = "<p class='error'>Please enter at least one concept.</p>";
            return;
        }
        if (isNaN(numQuestions) || numQuestions <= 0) {
            errorMessageDiv.innerHTML = "<p class='error'>Number of questions must be a positive number.</p>";
            return;
        }

        // Generate Q&A
        const qaResults = generateQASet(concepts, level, numQuestions);

        // Render results to HTML
        let html = `<h2>Generated Q&A Set (${level})</h2>`;
        html += '<button onclick="copyResults()" style="margin-bottom: 15px;">Copy All Q&A</button>';

        qaResults.forEach((qa, index) => {
            html += `
                <div class="qa-item">
                    <strong>Question ${index + 1}:</strong> ${qa.Q}
                    <strong>Answer Hint:</strong> ${qa.A}
                </div>
            `;
        });
        resultsContainer.innerHTML = html;

    } catch (e) {
        errorMessageDiv.innerHTML = `<p class='error'>An unexpected error occurred: ${e.message}</p>`;
    }
}

// --- 4. COPY RESULTS FUNCTION (To improve usability) ---
function copyResults() {
    let textToCopy = "Generated Q&A Set:\n\n";
    
    const qaItems = document.querySelectorAll('.qa-item');
    qaItems.forEach((item, index) => {
        // Extract plain text from strong tags (Question/Hint labels) and the rest of the div content
        const qText = item.innerHTML.match(/Question \d+:(.*?)<strong>Answer Hint:/s)[1].trim();
        const aText = item.innerHTML.match(/Answer Hint:<\/strong>(.*)/s)[1].trim();

        textToCopy += (index + 1) + ". Q: " + qText + "\n   A: " + aText + "\n---\n";
    });

    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Questions and Answers copied to clipboard!");
    }).catch(err => {
        console.error('Could not copy text: ', err);
        alert("Failed to copy. Please manually select and copy the text.");
    });
}


// --- 5. INITIAL SETUP (Attaching the handler to the form) ---
document.addEventListener('DOMContentLoaded', () => {
    // Populate the Level select box dynamically
    const levelSelect = document.getElementById('level');
    for (const level in QA_TEMPLATES) {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = `${level} - ${QA_TEMPLATES[level].description}`;
        levelSelect.appendChild(option);
    }
    
    // Attach the main submission function to the form
    const form = document.getElementById('qa-form');
    form.addEventListener('submit', handleSubmit);
});
