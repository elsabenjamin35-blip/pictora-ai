/* =========================================
   PICTORA AI
   MAIN APPLICATION
========================================= */

const API_BASE = "";


// =========================================
// PROJECT DATA
// =========================================

let project = {

    title: "",

    author: "",

    story: "",

    style: "cinematic illustrated",

    characters: [],

    scenes: []

};


let currentPage = 0;


// =========================================
// SHORTCUT
// =========================================

const $ = id => document.getElementById(id);


// =========================================
// TOAST
// =========================================

function showToast(message) {

    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    toast.style.display = "block";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}


// =========================================
// MOBILE MENU
// =========================================

const mobileMenuBtn =
    $("mobileMenuBtn");

const menuCloseBtn =
    $("menuCloseBtn");

const menuOverlay =
    $("menuOverlay");

const sidebar =
    document.querySelector(".sidebar");


function openMobileMenu() {

    if (!sidebar) return;

    sidebar.classList.add("open");

    menuOverlay?.classList.add("active");

    if (mobileMenuBtn) {

        mobileMenuBtn.textContent = "×";

        mobileMenuBtn.setAttribute(
            "aria-label",
            "Close menu"
        );

    }

}


function closeMobileMenu() {

    if (!sidebar) return;

    sidebar.classList.remove("open");

    menuOverlay?.classList.remove("active");

    if (mobileMenuBtn) {

        mobileMenuBtn.textContent = "☰";

        mobileMenuBtn.setAttribute(
            "aria-label",
            "Open menu"
        );

    }

}


function toggleMobileMenu() {

    if (
        sidebar &&
        sidebar.classList.contains("open")
    ) {

        closeMobileMenu();

    } else {

        openMobileMenu();

    }

}


// IMPORTANT:
// Prevent the menu button from submitting anything.
mobileMenuBtn?.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        event.stopPropagation();

        toggleMobileMenu();

    }
);


// IMPORTANT:
// This button ONLY closes the menu.
// It does NOT reload or close the app.
menuCloseBtn?.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        event.stopPropagation();

        closeMobileMenu();

    }
);


menuOverlay?.addEventListener(
    "click",
    function () {

        closeMobileMenu();

    }
);


// =========================================
// NAVIGATION
// =========================================

function openSection(sectionName) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const target =
        $(sectionName);


    if (target) {

        target.classList.add("active");

    }


    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            button.classList.remove("active");

        });


    const activeButton =
        document.querySelector(
            `[data-section="${sectionName}"]`
        );


    if (activeButton) {

        activeButton.classList.add("active");

    }


    // THIS IS THE IMPORTANT FIX.
    // Selecting a page closes the mobile menu.
    closeMobileMenu();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


document
    .querySelectorAll("[data-section]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openSection(
                    this.dataset.section
                );

            }
        );

    });


// =========================================
// START WRITING
// =========================================

$("startWritingBtn")?.addEventListener(
    "click",
    function () {

        openSection("storyEditor");

    }
);


// =========================================
// NEW PROJECT
// =========================================

$("newProjectBtn")?.addEventListener(
    "click",
    createNewProject
);


function createNewProject() {

    const confirmed =
        confirm(
            "Create a new project? Your current project will be cleared."
        );


    if (!confirmed) return;


    project = {

        title: "",

        author: "",

        story: "",

        style: "cinematic illustrated",

        characters: [],

        scenes: []

    };


    currentPage = 0;


    $("storyTitle").value = "";

    $("storyAuthor").value = "";

    $("storyText").value = "";

    $("storyStyle").value =
        "cinematic illustrated";


    updateWordCount();

    renderCharacters();

    renderScenes();

    renderAnalysis();

    renderPreview();

    saveProject();

    closeMobileMenu();

    showToast(
        "New Pictora project created."
    );

}


// =========================================
// STORY INPUT
// =========================================

$("storyTitle")?.addEventListener(
    "input",
    function () {

        project.title = this.value;

        saveProject();

    }
);


$("storyAuthor")?.addEventListener(
    "input",
    function () {

        project.author = this.value;

        saveProject();

    }
);


$("storyText")?.addEventListener(
    "input",
    function () {

        project.story = this.value;

        updateWordCount();

        saveProject();

    }
);


$("storyStyle")?.addEventListener(
    "change",
    function () {

        project.style = this.value;

        saveProject();

    }
);


function updateWordCount() {

    const text =
        $("storyText")?.value || "";


    const words =
        text
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if ($("wordCount")) {

        $("wordCount").textContent =
            `${words.length} words`;

    }

}


// =========================================
// CLEAR STORY
// =========================================

$("clearStoryBtn")?.addEventListener(
    "click",
    function () {

        $("storyText").value = "";

        project.story = "";

        updateWordCount();

        saveProject();

        showToast(
            "Story text cleared."
        );

    }
);


// =========================================
// AI STORY ANALYSIS
// =========================================

$("analyzeStoryBtn")?.addEventListener(
    "click",
    analyzeStoryWithAI
);


async function analyzeStoryWithAI() {

    const story =
        $("storyText").value.trim();


    if (!story) {

        showToast(
            "Write or paste your story first."
        );

        return;

    }


    if (story.length < 20) {

        showToast(
            "Please provide a longer story."
        );

        return;

    }


    project.title =
        $("storyTitle").value.trim() ||
        "Untitled Story";


    project.author =
        $("storyAuthor").value.trim() ||
        "Unknown Author";


    project.story = story;


    const button =
        $("analyzeStoryBtn");


    button.disabled = true;

    button.textContent =
        "⏳ AI is analyzing...";


    updateAIStatus(
        "Analyzing your story...",
        "Pictora AI is identifying characters and scenes."
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/api/analyze-story`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title:
                            project.title,

                        author:
                            project.author,

                        story:
                            project.story,

                        style:
                            project.style

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "AI analysis failed."
            );

        }


        project.characters =
            data.characters || [];


        project.scenes =
            data.scenes || [];


        currentPage = 0;


        renderAnalysis();

        renderCharacters();

        renderScenes();

        renderPreview();

        saveProject();


        updateAIStatus(
            "Analysis complete",
            `${project.scenes.length} scenes and ${project.characters.length} characters detected.`
        );


        showToast(
            "Story successfully analyzed."
        );

    }

    catch (error) {

        console.error(error);


        updateAIStatus(
            "AI analysis failed",
            error.message
        );


        showToast(
            error.message
        );

    }

    finally {

        button.disabled = false;

        button.textContent =
            "✨ Analyze Story with AI";

    }

}


// =========================================
// AI STATUS
// =========================================

function updateAIStatus(
    title,
    message
) {

    const status =
        $("aiStatus");


    if (!status) return;


    status.innerHTML = `

        <div class="status-icon">
            ✨
        </div>

        <div>

            <strong>
                ${escapeHTML(title)}
            </strong>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


// =========================================
// ANALYSIS DISPLAY
// =========================================

function renderAnalysis() {

    const container =
        $("analysisContent");


    if (!container) return;


    if (!project.scenes.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✨
                </div>

                <h3>
                    Nothing analyzed yet
                </h3>

                <p>
                    Your AI story analysis will
                    appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="ai-summary">

            <h3>
                Story Analysis Complete
            </h3>

            <p>
                ${escapeHTML(
                    project.summary ||
                    "Your story has been prepared for illustration."
                )}
            </p>

        </div>

        <div class="ai-summary">

            <h3>
                Story Structure
            </h3>

            <p>
                Pictora AI identified
                <strong>
                    ${project.characters.length}
                </strong>
                characters and
                <strong>
                    ${project.scenes.length}
                </strong>
                visual scenes.
            </p>

        </div>

    `;

}


// =========================================
// CHARACTERS
// =========================================

function renderCharacters() {

    const container =
        $("characterList");


    if (!container) return;


    if (!project.characters.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ♙
                </div>

                <h3>
                    No characters yet
                </h3>

                <p>
                    Analyze your story to identify
                    its characters.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        project.characters
            .map((character, index) => {

                const name =
                    character.name ||
                    `Character ${index + 1}`;


                const appearance =
                    character.appearance ||
                    "No appearance description.";


                const personality =
                    character.personality ||
                    "No personality description.";


                const anchor =
                    character.visual_anchor ||
                    "";


                return `

                    <div class="character-card">

                        <div class="character-avatar">
                            ${escapeHTML(
                                name.charAt(0)
                            )}
                        </div>

                        <div class="character-info">

                            <h3>
                                ${escapeHTML(name)}
                            </h3>

                            <p>
                                ${escapeHTML(appearance)}
                            </p>

                            <small>
                                ${escapeHTML(personality)}
                            </small>

                            ${
                                anchor
                                ?
                                `
                                <small>
                                    <br>
                                    <strong>
                                        Visual Anchor:
                                    </strong>
                                    ${escapeHTML(anchor)}
                                </small>
                                `
                                :
                                ""
                            }

                        </div>

                    </div>

                `;

            })
            .join("");

}


// =========================================
// SCENES
// =========================================

function renderScenes() {

    const container =
        $("sceneList");


    if (!container) return;


    if (!project.scenes.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🎬
                </div>

                <h3>
                    No scenes yet
                </h3>

                <p>
                    Analyze your story first.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        project.scenes
            .map((scene, index) => {

                return `

                    <article class="scene-card">

                        <div class="scene-number">
                            ${index + 1}
                        </div>


                        <div class="scene-content">

                            <h3>
                                ${escapeHTML(
                                    scene.title ||
                                    `Scene ${index + 1}`
                                )}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    scene.text || ""
                                )}
                            </p>


                            <div class="scene-image">

                                ${
                                    scene.image
                                    ?
                                    `
                                    <img
                                        src="${scene.image}"
                                        alt="Scene illustration"
                                    >
                                    `
                                    :
                                    `
                                    <div class="illustration-placeholder">

                                        <span>
                                            🎨
                                        </span>

                                        <p>
                                            Illustration not generated
                                        </p>

                                    </div>
                                    `
                                }

                            </div>


                            <div class="scene-actions">

                                <button
                                    type="button"
                                    onclick="generateSceneImage(${index})"
                                >
                                    ${
                                        scene.image
                                        ?
                                        "↻ Regenerate Illustration"
                                        :
                                        "🎨 Generate Illustration"
                                    }
                                </button>

                            </div>


                            <details>

                                <summary>
                                    AI Visual Prompt
                                </summary>

                                <textarea
                                    onchange="updateScenePrompt(
                                        ${index},
                                        this.value
                                    )"
                                >${escapeHTML(
                                    scene.visualPrompt || ""
                                )}</textarea>

                            </details>

                        </div>

                    </article>

                `;

            })
            .join("");

}


// =========================================
// UPDATE SCENE PROMPT
// =========================================

function updateScenePrompt(
    index,
    value
) {

    if (!project.scenes[index]) return;


    project.scenes[index].visualPrompt =
        value;


    saveProject();

}


// =========================================
// GENERATE ONE IMAGE
// =========================================

async function generateSceneImage(index) {

    const scene =
        project.scenes[index];


    if (!scene) return;


    if (!scene.visualPrompt) {

        showToast(
            "This scene does not have an image prompt."
        );

        return;

    }


    const sceneButton =
        document.querySelectorAll(
            ".scene-actions button"
        )[index];


    if (sceneButton) {

        sceneButton.disabled = true;

        sceneButton.textContent =
            "⏳ Generating...";

    }


    showToast(
        `Generating Scene ${index + 1}...`
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/api/generate-image`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        prompt:
                            scene.visualPrompt,

                        style:
                            project.style

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Image generation failed."
            );

        }


        scene.image =
            data.image;


        renderScenes();

        renderPreview();

        saveProject();


        showToast(
            `Scene ${index + 1} illustration ready.`
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            error.message
        );

    }

}


// =========================================
// GENERATE ALL IMAGES
// =========================================

$("generateAllBtn")?.addEventListener(
    "click",
    generateAllImages
);


async function generateAllImages() {

    if (!project.scenes.length) {

        showToast(
            "Analyze the story first."
        );

        return;

    }


    const button =
        $("generateAllBtn");


    button.disabled = true;

    button.textContent =
        "⏳ Generating...";


    for (
        let i = 0;
        i < project.scenes.length;
        i++
    ) {

        await generateSceneImage(i);

    }


    button.disabled = false;

    button.textContent =
        "🎨 Generate All";


    showToast(
        "All available illustrations generated."
    );

}


// =========================================
// BOOK PREVIEW
// =========================================

function renderPreview() {

    const page =
        $("bookPage");


    if (!page) return;


    const indicator =
        $("pageIndicator");


    if (!project.scenes.length) {

        page.innerHTML = `

            <div class="book-cover">

                <div class="cover-star">
                    ✦
                </div>

                <h1>
                    ${escapeHTML(
                        project.title ||
                        "Pictora AI"
                    )}
                </h1>

                <p>
                    ${escapeHTML(
                        project.author ||
                        "Your illustrated storybook"
                    )}
                </p>

                <span>
                    Analyze your story to begin.
                </span>

            </div>

        `;


        if (indicator) {

            indicator.textContent =
                "0 / 0";

        }


        return;

    }


    if (
        currentPage < 0 ||
        currentPage >= project.scenes.length
    ) {

        currentPage = 0;

    }


    const scene =
        project.scenes[currentPage];


    page.innerHTML = `

        <article class="story-page">

            ${
                scene.image
                ?
                `
                <img
                    class="story-illustration"
                    src="${scene.image}"
                    alt="${escapeHTML(
                        scene.title || ""
                    )}"
                >
                `
                :
                `
                <div class="story-image-placeholder">

                    <span>
                        🎨
                    </span>

                    <p>
                        Generate an illustration
                        for this scene.
                    </p>

                </div>
                `
            }


            <div class="story-text">

                <h2>
                    ${escapeHTML(
                        scene.title ||
                        `Scene ${currentPage + 1}`
                    )}
                </h2>

                <p>
                    ${escapeHTML(
                        scene.text || ""
                    )}
                </p>

            </div>

        </article>

    `;


    if (indicator) {

        indicator.textContent =
            `${currentPage + 1} / ${project.scenes.length}`;

    }

}


// =========================================
// BOOK NAVIGATION
// =========================================

$("nextPageBtn")?.addEventListener(
    "click",
    function () {

        if (!project.scenes.length)
            return;


        if (
            currentPage <
            project.scenes.length - 1
        ) {

            currentPage++;

            renderPreview();

        }

    }
);


$("previousPageBtn")?.addEventListener(
    "click",
    function () {

        if (
            currentPage > 0
        ) {

            currentPage--;

            renderPreview();

        }

    }
);


// =========================================
// SAVE
// =========================================

function saveProject() {

    try {

        localStorage.setItem(
            "pictoraProject",
            JSON.stringify(project)
        );

    }

    catch (error) {

        console.warn(
            "Could not save project:",
            error
        );

    }

}


// =========================================
// LOAD
// =========================================

function loadProject() {

    try {

        const saved =
            localStorage.getItem(
                "pictoraProject"
            );


        if (!saved) return;


        const parsed =
            JSON.parse(saved);


        project = {

            ...project,

            ...parsed

        };


        $("storyTitle").value =
            project.title || "";


        $("storyAuthor").value =
            project.author || "";


        $("storyText").value =
            project.story || "";


        $("storyStyle").value =
            project.style ||
            "cinematic illustrated";


        updateWordCount();


        renderAnalysis();

        renderCharacters();

        renderScenes();

        renderPreview();

    }

    catch (error) {

        console.warn(
            "Could not load project:",
            error
        );

    }

}


// =========================================
// ESCAPE KEY
// =========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeMobileMenu();

        }

    }
);


// =========================================
// HTML ESCAPING
// =========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =========================================
// INITIALIZE
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProject();

        updateWordCount();

        renderAnalysis();

        renderCharacters();

        renderScenes();

        renderPreview();

    }
);


// =========================================
// GLOBAL FUNCTIONS
// =========================================

window.openSection =
    openSection;

window.closeMobileMenu =
    closeMobileMenu;

window.generateSceneImage =
    generateSceneImage;

window.generateAllImages =
    generateAllImages;

window.updateScenePrompt =
    updateScenePrompt;

window.createNewProject =
    createNewProject;