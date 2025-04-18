//globals for ui.js
var raceSelected = false;
var curRace;
var nameEntered = false;
var raceButtons = []; // now storing "card" divs instead of p5 buttons
var goButton;
var nameInput;

// Array of build option objects

function updateResponsiveDesign() {
    // Update positions for the name input and "Go" button
    const inputWidth = 220; // as defined in style
    const spacing = 20;


    // Update race card widths responsively
    let newCardWidth = constrain(width * 0.15, 150, 300);
    raceButtons.forEach((card) => {
        card.style("width", newCardWidth + "px");
    });

    // Optionally update the race title font size for better scaling
    raceTitle?.style("font-size", "calc(1.5vw + 24px)");

    dirtBagUI.pos = createVector(width - 180 - 10, height - 186 - 10);

    timerDiv.position(width / 2 - 50, 10);
}

function hideRaceSelect() {
    // Hide UI elements during gameplay
    nameInput.hide();
    goButton.hide();
    raceButtons.forEach((card) => {
        card.hide();
    });
    race_back_button.hide()
    raceContainer.style("display", "none"); // Hide the container
    // If using raceTitle, hide it as well
    raceTitle.style("display", "none");
}

let serverList = JSON.parse(localStorage.getItem("servers")) || [

    { ip: "api.holesgame.com", name: "Holes Offical", status: "Online" },
    { ip: "localhost", name: "Local Server", status: "Online" },
    { ip: "dig.holesgame.com", name: "Remote Server", status: "Online" },
];

let selectedServer = null;
let serverBrowserContainer, inputName, inputIP, inputStatus, addServerButton, serverListDiv;
let renderedserverBrowserContainer = false;

function saveServers() {
    localStorage.setItem("servers", JSON.stringify(serverList));
}

let linksRendered = false; // Flag to prevent duplicate rendering
let linkContainer, settingsContainer, settingsToggle, toggleButton, titleImage, markee; // Store references for hiding

let markeeText = [
    " This game is made with Hate not ♥ !!!",
    " DIG DIG DIG there is nothing else ",
    "Your advert here , we gotta pay that AWS bill some how ",
    "Learn to Code &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ... OR ELSE",
    "Kill John's Lemons",
    "Buy Gold Buy",
    "According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible. ",
    "This game probably cures cancer ",
    "Remember V the Media Lies",
    "If the government could be trusted Jesus would have died of natural causes",
    "The Simpson's did it !",


]
// Function to render buttons instead of links
function renderLinks() {
    if (linksRendered) return; // Prevent duplicate rendering

    // draw title image 

    titleImage = createImg("./images/ui/title.png");

    // Apply styles to the image using .style()
    titleImage.style("width", "28dvw"); // Set the width of the image
    titleImage.style("height", "13dvw"); // Automatically adjust the height
    titleImage.style("border", "5px solid #000"); // Add a border
    titleImage.style("display", "block"); // Make it a block element (to prevent inline styling)
    titleImage.style("margin", "20px auto");
    titleImage.style("padding-bottom", "40px auto");
    titleImage.style("top", "0")
    titleImage.style("position", "absolute"); let randItem1 = Math.floor(Math.random() * markeeText.length);
    // Suppose we want 5 distinct random items
    let chosenItems = [];
    while (chosenItems.length < markeeText.length) {
        let r = Math.floor(Math.random() * markeeText.length);
        if (!chosenItems.includes(r)) chosenItems.push(r);
    }
    // Now join them with a spacer or delimiter
    let marqueeContent = chosenItems
        .map(i => markeeText[i]).join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")


    markee = createElement("marquee", marqueeContent);
    markee.style("position", "fixed");
    markee.style("bottom", "0px");
    markee.style("width", "80%");

    markee.style("margin-right", "4%");

    markee.style("font-size", "1.5rem");
    markee.style("color", "white");

    markee.style("scrolldelay", "0");

    // Parent container for buttons (Bottom Right)
    linkContainer = createDiv();
    linkContainer.class("container")

    applyStyle(linkContainer, {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        zIndex: "1000",
    });

    // Create individual buttons
    createLinkButton(linkContainer, "👾 Play On Itch.io", "https://polypikzel.itch.io/");
    createLinkButton(linkContainer, "🖳 GitHub", "https://github.com/PolyPixels");
    createLinkButton(linkContainer, "🗪 Discord", "https://discord.gg/Quhy52U5ae");

    // Parent container for settings (Bottom Left)
    settingsToggle = createDiv();
    settingsToggle.class("container")
    applyStyle(settingsToggle, {
        position: "fixed",
        bottom: "10px",
        left: "10px",
        zIndex: "1000",
    });

    // Create settings button
    let settingsButton = createButton("⚙ Settings").parent(settingsToggle);
    styleButton(settingsButton);
    settingsButton.mousePressed(() => toggleSettings());

    titleImage.parent(document.body)
    // Append elements to body
    linkContainer.parent(document.body);
    settingsToggle.parent(document.body);

    linksRendered = true; // Set flag to true
}

// 🎯 Helper Function to Create Buttons
function createLinkButton(parent, text, url) {
    let button = createButton(text).parent(parent);
    styleButton(button);
    button.mousePressed(() => window.open(url, "_blank"));
}

// 🎮 Styling for Buttons
function styleButton(button) {
    applyStyle(button, {
        padding: "10px 15px",
        fontSize: "16px",
        borderRadius: "5px",
        backgroundColor: "#333",
        color: "white",
        cursor: "pointer",
        transition: "0.3s ease-in-out",
    });

    button.mouseOver(() => button.style("box-shadow", "0 0 10px cyan"));
    button.mouseOut(() => button.style("box-shadow", "none"));
    addGlitchEffect(button);
}

// ⚡ Apply Glitch Effect
function addGlitchEffect(element) {
    element.mouseOver(() => element.style("animation", "glitch 0.3s infinite"));
    element.mouseOut(() => element.style("animation", "none"));
}

// 🎨 Apply Style Utility Function
function applyStyle(element, styles) {
    Object.entries(styles).forEach(([key, value]) => element.style(key, value));
}


// Helper function to create a link
function createLinkItem(parent, text, url, emoji) {
    let link = createA(url, `${emoji} ${text}`, "_blank");
    link.style("padding", "10px 15px");
    link.style("font-size", "16px");
    link.style("border-radius", "5px");
    link.style("background-color", "#333");
    link.style("color", "white");
    link.style("text-decoration", "none");
    link.style("display", "inline-block");
    link.style("transition", "0.3s");

    // Hover effect
    link.mouseOver(() => link.style("background-color", "#555"));
    link.mouseOut(() => link.style("background-color", "#333"));

    link.parent(parent);
}

// Toggle function to show/hide links
function hideLinks() {
    if (renderLinks) {
        if (linkContainer.style("display") === "none") {
            linkContainer.style("display", "flex");
            settingsToggle.style("display", "flex")
            markee.style("display", "flex")
            titleImage.style("display", "flex");
        } else {
            linkContainer.style("display", "none");
            markee.style("display", "none")
            titleImage.style("display", "none");
            settingsToggle.style("display", "none")
            renderLinks = false
        }
    }
}

// Helper function to create a link
function createLinkItem(parent, text, url, emoji) {
    let link = createA(url, `${emoji} ${text}`, "_blank");
    link.style("padding", "10px 15px");
    link.style("font-size", "16px");
    link.style("border-radius", "5px");
    link.style("background-color", "#333");
    link.style("color", "white");
    link.style("text-decoration", "none");
    link.style("display", "inline-block");
    link.style("transition", "0.3s");

    // Hover effect
    link.mouseOver(() => link.style("background-color", "#555"));
    link.mouseOut(() => link.style("background-color", "#333"));

    link.parent(parent);
}

function renderServerBrowser() {
    if (!renderedserverBrowserContainer) {
        renderedserverBrowserContainer = true;

        serverBrowserContainer = createDiv();
        serverBrowserContainer.id("serverBrowserContainer");
        serverBrowserContainer.class("container");
        serverBrowserContainer.style("overflow-y", "scroll")
        // Main container styling
        serverBrowserContainer.style("width", "50dvw");
        serverBrowserContainer.style("max-height", "60dvh");
        serverBrowserContainer.style("overflow-y", "hide");
        serverBrowserContainer.style("padding", "25px");
        serverBrowserContainer.style("margin-top", "25px");
        serverBrowserContainer.style("border-radius", "15px");
        serverBrowserContainer.style("color", "#fff");
        serverBrowserContainer.style("font-family", "Arial, sans-serif");
        serverBrowserContainer.style("box-shadow", "0px 8px 16px rgba(0, 0, 0, 0.4)");

        // Position the container in the center
        serverBrowserContainer.style("position", "fixed");
        serverBrowserContainer.style("top", "58%");
        serverBrowserContainer.style("left", "50%");
        serverBrowserContainer.style("transform", "translate(-50%, -50%)");

        // Title
        let title = createDiv("Select A Server");
        title.style("font-size", "2.5em");
        title.style("font-weight", "bold");
        title.style("margin-bottom", "15px");
        title.style("text-align", "center");
        title.parent(serverBrowserContainer);

        serverListDiv = createDiv();
        serverListDiv.parent(serverBrowserContainer);
        // Render the server list
        renderServerList();

        // ─────────────────────────────────────────────────────────
        //  ADD NEW SERVER (COLLAPSIBLE / DROPDOWN)
        // ─────────────────────────────────────────────────────────

        // Parent section that holds the "Add New Server" header and collapsible content
        let addServerSection = createDiv();
        addServerSection.style("margin-top", "100px");
        addServerSection.style("padding", "15px");
        addServerSection.style("background", "#2a2a2a");
        addServerSection.style("border-radius", "10px");

        // ➕ Add Server Title (CLICKABLE)
        // Use a downward arrow (▼) or "V" to indicate it's a dropdown
        let addServerTitle = createDiv("Add New Server ▼");

        addServerTitle.style("font-weight", "bold");
        addServerTitle.style("font-size", "1.8em");
        addServerTitle.style("margin-bottom", "10px");
        addServerTitle.style("text-align", "center");
        addServerTitle.style("cursor", "pointer"); // Indicate it can be clicked
        addServerTitle.parent(addServerSection);

        // Collapsible content container (initially hidden)
        let addServerContent = createDiv();
        addServerContent.style("display", "none");  // Hide by default
        addServerContent.parent(addServerSection);

        // Server Name Input
        inputName = createInput("").attribute("placeholder", " Server Name");
        inputName.parent(addServerContent);
        inputName.style("width", "90%");
        inputName.style("margin-bottom", "8px");
        inputName.style("padding", "10px");
        inputName.style("border-radius", "5px");

        // Server IP Input
        inputIP = createInput("").attribute("placeholder", " Server IP");
        inputIP.parent(addServerContent);
        inputIP.style("width", "90%");
        inputIP.style("margin-bottom", "8px");
        inputIP.style("padding", "10px");
        inputIP.style("border-radius", "5px");

        // Add Server Button
        addServerButton = createButton("ADD");
        addServerButton.parent(addServerContent);
        addServerButton.style("width", "80%");
        addServerButton.style("padding", "10px");
        addServerButton.style("cursor", "pointer");
        addServerButton.style("color", "#fff");
        addServerButton.style("border", "none");
        addServerButton.style("border-radius", "5px");

        // Functionality for the Add button
        addServerButton.mousePressed(() => {
            let newServer = {
                name: inputName.value(),
                ip: inputIP.value(),
            };
            if (newServer.name && newServer.ip) {
                serverList.push(newServer);
                saveServers();
                renderServerList();

                inputName.value("");
                inputIP.value("");
                alert("✅ Server Added Successfully!");
            } else {
                alert("⚠️ Please enter both a server name and IP.");
            }
        });

        // Toggle display of addServerContent on header click
        let dropdownOpen = false;
        addServerTitle.mousePressed(() => {
            dropdownOpen = !dropdownOpen;
            addServerContent.style("display", dropdownOpen ? "block" : "none");
            // Optionally change the arrow: "▼" for open or "►" for closed
            addServerTitle.html(dropdownOpen ? "Add New Server ▼" : "Add New Server ►");
        });

        // ─────────────────────────────────────────────────────────
        //  CONNECT BUTTON
        // ─────────────────────────────────────────────────────────
        let connectButton = createButton("▶ Connect");
        connectButton.parent(serverBrowserContainer);
        connectButton.style("width", "80%");
        connectButton.style("height", "5dvw");

        connectButton.style("font-size", "2rem");
        connectButton.style("margin-top", "20px");
        connectButton.style("padding", "12px");
        connectButton.style("background", "#4CAF50");
        connectButton.style("color", "#fff");
        connectButton.style("border", "none");
        connectButton.style("border-radius", "5px");

        addServerSection.parent(serverBrowserContainer);
        connectButton.mousePressed(() => {
            if (selectedServer) {
                //console.log(getServerUrl(selectedServer))
                socket = io.connect(getServerUrl(selectedServer));
                socketSetup();
                testMap = new Map();
                ghostBuild = createObject("Wall", 0, 0, 0, 0, " ", " ");
                //console.log("Connected to " + selectedServer, socket);
                hideServerBrowser();
                gameState = "race_selection";
                renderedserverBrowserContainer = false;
            } else {
                alert("⚠️ Please select a server first.");
            }
        });
    }
}

function getServerUrl(server) {
    const isLocal = isLocalAddress(server.ip);
    // Use HTTP with port 3000 for local, otherwise HTTPS with no extra port for production
    const scheme = isLocal ? "http" : "https";
    const port = isLocal ? ":3000" : "";
    return `${scheme}://${server.ip}${port}`;
}

function isLocalAddress(ipOrHost) {
    // Exact matches for localhost or loopback
    if (ipOrHost === 'localhost' || ipOrHost === '127.0.0.1') {
        return true;
    }

    // A simple regex for IPv4 addresses (it doesn't enforce 0-255 on each octet, but is sufficient for a basic check)
    return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(ipOrHost);

}

function fetchServerStatus(server, callback) {
    const url = getServerUrl(server) + "/status";
    fetch(url)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => {
            console.error(`Error fetching status from ${server.ip}:`, error);
            callback({ status: "Offline", playerCount: 0 });
        });
}

function renderServerList() {
    let oldEntries = selectAll(".serverEntry");
    for (let e of oldEntries) {
        e.remove();
    }

    serverList.forEach((server, index) => {
        let serverEntry = createDiv();
        serverEntry.class("serverEntry");

        // Basic layout styling
        serverEntry.style("font-size", "2rem");
        serverEntry.style("padding", "12px");
        serverEntry.style("margin-bottom", "12px");
        serverEntry.style("background-color", "var(--color-dirt-dark)");
        serverEntry.style("cursor", "pointer");
        serverEntry.style("display", "flex");
        serverEntry.style("align-items", "center"); // align items horizontally centered
        serverEntry.style("gap", "12px");
        serverEntry.style("transition", "transform 0.15s ease-in-out");

        // === Logo Container ===
        let logoContainer = createDiv();
        logoContainer.style("width", "100px");
        logoContainer.style("height", "100px");
        logoContainer.style("display", "flex");
        logoContainer.style("border-radius", "8px"); // blocky-pixel style instead of circular
        logoContainer.style("overflow", "hidden");
        logoContainer.style("border", "2px solid var(--color-dirt-clay)");

        let serverLogo = createImg(server.image);
        serverLogo.style("width", "100%");
        serverLogo.style("height", "100%");
        serverLogo.style("object-fit", "cover");
        serverLogo.parent(logoContainer);
        logoContainer.parent(serverEntry);

        // === Text Details Container ===
        let textContainer = createDiv();
        textContainer.style("display", "flex");
        textContainer.style("flex-direction", "column");
        textContainer.style("justify-content", "center");
        textContainer.style("flex-grow", "1");
        textContainer.style("font-size", "1.2rem");

        // Server Name
        let serverName = createDiv(server.name);
        serverName.style("font-weight", "bold");
        serverName.style("color", "white");
        serverName.style("margin-bottom", "20px");
        serverName.parent(textContainer);

        // IP
        let serverIP = createDiv(`IP: ${server.ip}`);
        serverIP.style("color", "yellow");
        serverIP.style("margin-bottom", "15px");
        serverIP.parent(textContainer);

        // Status
        let serverStatus = createDiv("Status: Loading...");
        serverStatus.style("color", "var(--color-gold)");
        serverStatus.style("margin-bottom", "15px");
        serverStatus.parent(textContainer);

        // Player Count
        let playerCount = createDiv("Players: Loading...");
        playerCount.style("color", "#00ffff"); // neon cyan stands out nicely
        playerCount.style("margin-bottom", "5px")
        playerCount.parent(textContainer);

        textContainer.parent(serverEntry);


        // Fetch server status
        fetchServerStatus(server, (data) => {
            serverStatus.html(`Status: ${data.status}`);
            serverStatus.style("color", data.status === "Online" ? "#4CAF50" : "#F44336");
            serverName.html(data.name || "Unnamed Server")
            playerCount.html(`Players: ${data.playerCount}`);
            serverLogo.attribute("src", data.image);



            // Optionally, adjust opacity to signal a disabled state
            serverEntry.style("opacity", data.status === "Online" ? "1" : "0.5");

            // server entry can not be clicked if status is not online 
            serverEntry.style("pointer-events", data.status === "Online" ? "auto" : "none");
        });

        // Remove server button
        let removeButton = createButton(" &#x20E0; &nbsp; Remove ");
        removeButton.parent(serverEntry);
        removeButton.style("margin-left", "10px");
        removeButton.style("padding", "15px");
        removeButton.style("background-color", "#F44336");
        removeButton.style("color", "#fff");
        removeButton.style("border", "none");
        removeButton.style("border-radius", "3px");
        removeButton.style("cursor", "pointer");


        removeButton.style("pointer-events", "auto");


        removeButton.mousePressed(() => {
            serverList.splice(index, 1);
            saveServers();
            renderServerList();
            //renderServerList();
        });

        // Select a server
        serverEntry.mousePressed(() => {
            let entries = selectAll(".serverEntry");
            for (let e of entries) {
                e.style("background-color", "#404040");
            }
            serverEntry.style("background-color", "#4CAF50");
            selectedServer = server;
            //console.log("Server selected:", selectedServer);
        });

        serverEntry.parent(serverListDiv);
    });
}


// --- Function to Hide or Remove the Server Browser ---
function hideServerBrowser() {
    let serverBrowserContainer = document.getElementById("serverBrowserContainer"); // Adjust selector accordingly
    if (serverBrowserContainer) {
        serverBrowserContainer.remove(); // Remove the element
        console.log("Server browser container removed."); // Debugging output
    } else {
        console.warn("Server browser container not found.");
    }
}
// Show the selection UI elements
function drawSelection() {
    raceContainer.style("display", "flex");
    // ---------------------------------------------------
    //  Create Title (centered, larger & responsive)
    // ---------------------------------------------------
    raceTitle.id("raceTitle");
    raceTitle.elt.innerHTML = "Select Your Race"
    raceTitle.style("position", "absolute");
    raceTitle.style("top", "min(25%, 30dvh)");

    raceTitle.style("left", "50%");
    raceTitle.style("transform", "translateX(-50%)");
    raceTitle.style("max-width", "90vw");
    raceTitle.style("white-space", "normal");

    // Responsive font size (combining viewport and fixed pixels)
    raceTitle.style("font-size", "calc(1.5vw + 12px)");
    if (window.innerWidth < 480) {
        raceTitle.style("font-size", "calc(1vw + 10px)");
    }

    raceTitle.style("font-weight", "bold");
    raceTitle.style("color", "#fff");
    raceTitle.style("text-shadow", "1px 1px 2px #000");
    raceTitle.style("padding", "10px 20px");
    raceTitle.style("background-color", "rgba(0, 0, 0, 0.3)");
    raceTitle.style("border-radius", "10px");
    raceTitle.style("text-align", "center");

    nameInput.show();
    goButton.show();


    //back to server selection button
    race_back_button.innerHTML = " <- Back"

    race_back_button.style("font-size", "20px");
    race_back_button.style("color", "#fff");
    race_back_button.style("border", "none");
    race_back_button.style("border-radius", "8px");
    race_back_button.style("position", "absolute");
    race_back_button.style("top", "50dvh");

    race_back_button.mousePressed(() => {
        //console.log("pressed")
        hideRaceSelect()
        gameState = "initial"
    })

    race_back_button.show();
    race_back_button.parent(raceContainer);
    raceButtons.forEach((card) => {
        card.show();
    });
    // Enable the "Go" button only when a race is selected and a name is entered

}

let timerDiv;

function setupUI() {
    // ----------------------------
    // (Socket setup and raceImages flipping omitted for brevity)
    // ----------------------------

    // Flip right images to create left images
    for (let raceName in raceImages) {
        raceImages[raceName].left = [];
        for (let i = 0; i < raceImages[raceName].right.length; i++) {
            raceImages[raceName].left[i] = flipImage(raceImages[raceName].right[i]);
        }
    }

    defineInvUI();
    definePauseUI();
    defineBuildUI();
    togglePlayerStatusTable();
    defineTeamPickUI();
    defineSwapInvUI();
    defineCraftingUI();
    defineDeathUI();

    timerDiv = createDiv("⏳ 15:00");
    timerDiv.position(width / 2 - 50, 10); // adjust as needed
    timerDiv.style("font-size", "32px");
    timerDiv.style("color", "white");
    timerDiv.style("text-align", "center");
    timerDiv.style("width", "100px");
    timerDiv.style("z-index", "10");
    timerDiv.hide();
    raceTitle = createDiv();
    // ---------------------------------------------------
    //  Create a container for race selection cards (centered)
    // ---------------------------------------------------
    raceContainer = createDiv();
    race_back_button = createButton("<- Back")
    raceContainer.id("raceContainer");
    raceContainer.style("position", "absolute");
    raceContainer.style("top", "40dvh");
    raceContainer.style("left", "50%");
    raceContainer.style("transform", "translateX(-50%)");
    raceContainer.style("display", "none");
    raceContainer.style("flex-wrap", "wrap");
    raceContainer.style("justify-content", "center");
    raceContainer.style("align-items", "center");
    raceContainer.style("gap", "30px");
    raceContainer.style("padding", "0px");
    raceContainer.style("border-radius", "10px");
    raceContainer.style("min-width", "100dvw")
    // ---------------------------------------------------
    //  Create cards for each race (with responsive sizing)
    // Allowed stats to display
    const allowedStats = ["hp", "mhp", "regen", "attack", "magic", "magicResistance", "hearing"];

    // Iterate over each race in the races array
    races.forEach((raceName, i) => {
        var selectedItem = i;
        //console.log(selectedItem, i, raceName)
        // Create the card container for the race
        let card = createDiv();
        card.class("raceCard");
        card.style("display", "flex");
        card.style("flex-direction", "column");
        card.style("align-items", "center");

        // Responsive card width: based on canvas width, constrained between 150 and 300px
        let cardWidth = constrain(width * 0.15, 150, 400);
        card.style("width", cardWidth + "px");
        card.style("border-radius", "10px");
        card.style("padding", "25px");
        card.style("cursor", "pointer");
        card.selected = false; // custom property for selection

        // Create a race name label
        let raceLbl = createP(raceName.toUpperCase());
        raceLbl.style("font-size", "calc(0.5vw + 16px)");
        raceLbl.style("font-weight", "bold");
        raceLbl.style("margin", "10px 0 0 0");
        raceLbl.style("text-align", "center");


        raceLbl.parent(card);
        // Create an image element for the race portrait
        let raceImgPath = `images/characters/${raceName}/${raceName}_portrait.png`;
        let raceImg = createImg(raceImgPath, `${raceName} image`);
        raceImg.style("max-width", "15dvw");
        raceImg.style("height", "15dvh");
        raceImg.style("image-rendering", "pixelated");
        raceImg.parent(card);

        // Retrieve stats from BASE_STATS (assumes the same order as races)
        let raceStats = BASE_STATS[i];
        // Build a text string for only the allowed stats
        let statsText = allowedStats
            .map(stat => `${stat}: ${raceStats[stat]}`)
            .join(" <br/><br/> ");

        // Create a label for the stats
        let raceStatsLbl = createP(statsText);
        raceStatsLbl.style("font-size", "calc(0.6vw + 2px)");
        raceStatsLbl.style("font-weight", "bold");
        raceStatsLbl.style("margin", "0");
        raceStatsLbl.style("align-self", "flex-end");
        raceStatsLbl.style("text-align", "right");
        raceStatsLbl.parent(card);

        // Hover out styling
        card.mouseOut(() => {
            card.style("transform", "scale(1)");
            card.style("box-shadow", "none");

            card.style("background-color", card.selected ? "#4CAF50" : "#222");
        });

        // On click: deselect all cards, select only this one
        card.mousePressed(() => {
            //console.log(selectedItem, i, raceName);

            // Deselect all cards
            raceButtons.forEach((c) => {
                c.selected = false;
                c.style("background-color", "#222"); // reset background for all
            });

            // Select this card
            card.selected = true;
            card.style("background-color", "#4CAF50");

            raceSelected = true;
            curRace = selectedItem;

            //console.log("Race selected:", races[selectedItem]);
        });


        // Hide the card initially (only shown in the race selection state)
        card.hide();
        card.parent(raceContainer);
        raceButtons.push(card);
    });

    race_back_button.hide()

    // ---------------------------------------------------
    //   Name Input Field (centered, larger & responsive)
    // ---------------------------------------------------
    nameInput = createInput("");
    nameInput.hide();
    let inputWidth = constrain(width * 0.5, 100, 200); // Responsive width
    let inputX = (width - inputWidth) / 2;
    let inputY = height * 0.86;
    nameInput.size(inputWidth, AUTO); // Auto height from padding
    nameInput.position(inputX, inputY);

    // Responsive base styling
    nameInput.style("font-size", width < 500 ? "14px" : "18px");
    nameInput.style("border-radius", "8px");
    nameInput.style("padding", "10px");
    nameInput.style("outline", "none");
    nameInput.style("transition", "border 0.2s, box-shadow 0.2s");
    nameInput.style("width", inputWidth + "px");
    nameInput.attribute("placeholder", "Name :");
    nameInput.style("border", "2px solid #ccc"); // base border

    // Focus style
    nameInput.elt.addEventListener("focus", () => {
        nameInput.style("border", "2px solid var(--color-gold)");
        nameInput.style("box-shadow", "0 0 6px rgba(255, 215, 0, 0.6)");


        nameInput.attribute("placeholder", "");
    });

    // Revert on blur
    nameInput.elt.addEventListener("blur", () => {
        nameInput.style("border", "2px solid #ccc");
        nameInput.style("box-shadow", "none");
    });


    // Optional shadow or backdrop (optional UX polish)
    nameInput.style("background-color", "rgba(255, 255, 255, 0.9)");
    nameInput.style("box-shadow", "2px 2px 4px rgba(0, 0, 0, 0.3)");


    nameInput.style("padding", "10px");
    nameInput.style("outline", "none");
    nameInput.attribute('placeholder', 'Name :');
    nameInput.style("transition", "border 0.2s");
    nameInput.input(() => {
        checkName();
    });
    nameInput.mouseOver(() => {
        nameInput.style("border", "3px black #4CAF50");
    });
    nameInput.mouseOut(() => {
        nameInput.style("border", "3px solid #ccc");
    });
    nameInput.elt.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            startGame();
        }
    });


    // ---------------------------------------------------
    //   "Go" Button (centered, larger & responsive)
    // ---------------------------------------------------
    goButton = createButton("Go");
    goButton.hide();
    // Position near the name input with a fixed offset
    goButton.style("position", "absolute");
    goButton.style("left", "calc(50% + 130px)");
    goButton.style("top", "85dvh"); // or "80%" if more stable


    goButton.style("font-size", "20px");
    goButton.style("color", "#fff");
    goButton.style("border", "none");
    goButton.style("border-radius", "8px");
    goButton.style("padding", "10px 20px");

    goButton.style("margin-left", "20px");
    goButton.style("cursor", "pointer");
    goButton.style("transition", "background-color 0.2s, transform 0.2s");

    goButton.mouseOver(() => {
        goButton.style("transform", "scale(1.05)");
    });
    goButton.mouseOut(() => {
        goButton.style("transform", "scale(1)");
    });

    goButton.mousePressed(() => {
        startGame();
    })

}


// Global variables for chat UI elements and player count display
let chatContainer, chatMessagesBox, chatInput, chatSendButton;
let chatRendered = false;
let toggleChatButton; // Button to collapse/expand chat
let inputContainer;   // Reference to hide/show input container
let isChatOpen = true; // Track whether the chat is currently open or collapsed

function renderChatUI() {
    if (chatRendered) return;
    chatRendered = true;

    // Create chat container positioned at bottom-left
    chatContainer = createDiv();
    chatContainer.class("container");
    chatContainer.style("position", "fixed");
    chatContainer.style("bottom", "0dvh");
    chatContainer.style("left", "0dvw");
    chatContainer.style("z-index", "10");
    chatContainer.style("min-width", "10dvw");
    chatContainer.style("background", "rgba(34, 34, 34, 0.8)"); // Semi-transparent dark background
    chatContainer.style("padding", "10px");
    chatContainer.style("border-radius", "8px");
    chatContainer.style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.4)"); // Soft shadow
    chatContainer.style("backdrop-filter", "blur(5px)"); // Blurred background (if supported)
    chatContainer.style("pointer-events", "auto"); // Ensure clicks go through

    // ─────────────────────────────────────────────────────────
    // Toggle Button (Collapses/Expands the chat area)
    // ─────────────────────────────────────────────────────────

    toggleChatButton = createButton("");
    toggleChatButton.id("chatToggle")
    toggleChatButton.parent(chatContainer);
    toggleChatButton.style("width", "100%");
    toggleChatButton.style("background", "#555");
    toggleChatButton.style("color", "#fff");
    toggleChatButton.style("border", "none");
    toggleChatButton.style("border-radius", "5px");
    toggleChatButton.style("cursor", "pointer");
    toggleChatButton.style("margin-bottom", "5px");
    toggleChatButton.style("padding", "6px");
    toggleChatButton.mousePressed(toggleChatDropdown);

    // Update the button text immediately on creation
    updateToggleChatButtonText();

    // ─────────────────────────────────────────────────────────
    // Container for messages
    // ─────────────────────────────────────────────────────────

    chatMessagesBox = createDiv();
    chatMessagesBox.style("height", "15dvh");
    chatMessagesBox.style("overflow-y", "auto");
    chatMessagesBox.style("background-color", "#333");
    chatMessagesBox.style("color", "#fff");
    chatMessagesBox.style("padding", "8px");
    chatMessagesBox.style("border-radius", "5px");
    chatMessagesBox.style("margin-bottom", "10px");
    chatMessagesBox.style("justify-content", "left");

    // ─────────────────────────────────────────────────────────
    // Input Field
    // ─────────────────────────────────────────────────────────

    chatInput = createInput("");
    chatInput.attribute("placeholder", "Type your message...");
    chatInput.style("flex", "1");
    chatInput.style("padding", "3px");
    chatInput.style("border-radius", "5px");
    chatInput.style("outline", "none");
    chatInput.style("color", "#fff");
    chatInput.style("background-color", "#222");
    chatInput.style("margin-right", "5px");
    chatInput.mousePressed(() => {
        lastGameState = gameState+"";
        gameState = "chating";
    });
    chatInput.elt.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            sendChatMessage();
            gameState = lastGameState;
        }
    });

    // ─────────────────────────────────────────────────────────
    // Send Button
    // ─────────────────────────────────────────────────────────

    chatSendButton = createButton("Send");
    chatSendButton.style("padding", "8px 14px");
    chatSendButton.style("border", "none");
    chatSendButton.style("border-radius", "5px");
    chatSendButton.style("background-color", "#4caf50");
    chatSendButton.style("color", "#fff");
    chatSendButton.style("cursor", "pointer");

    chatSendButton.style("min-width", "5dvw");
    chatSendButton.mousePressed(() => {
        blurActiveElement();
        sendChatMessage();
        gameState = lastGameState;
    });

    // ─────────────────────────────────────────────────────────
    // Input Container (holds input + button)
    // ─────────────────────────────────────────────────────────

    inputContainer = createDiv();
    inputContainer.style("display", "flex");
    inputContainer.style("align-items", "center");
    inputContainer.child(chatInput);
    inputContainer.child(chatSendButton);

    // Append everything to the main chat container
    chatContainer.child(chatMessagesBox);
    chatContainer.child(inputContainer);

    // Finally, append chat container to the document body
    chatContainer.parent(document.body);
}

// ─────────────────────────────────────────────────────────
// Toggle Function: Collapses/Expands the Chat
// ─────────────────────────────────────────────────────────

function toggleChatDropdown() {
    if (isChatOpen) {
        // Hide the messages box and input
        chatMessagesBox.hide();
        inputContainer.hide();
    } else {
        // Show the messages box and input
        chatMessagesBox.show();
        inputContainer.show();
    }
    isChatOpen = !isChatOpen;
    // Update the button text after toggling
    updateToggleChatButtonText();
}


function startGame() {
    //console.log(raceSelected, "sasd")
    if (!selectedServer) {
        alert("Issue with server retry.");
        return;
    }
    if (!raceSelected) {
        alert("Pick a race.");
        //console.log("SDSD")
        return;
    }

    if (!nameEntered) {
        alert("Pick a name.");
        return;
    }

    // 1) Pull the value from the name input.
    const nameVal = nameInput.value().trim();

    // 2) Check length
    if (nameVal.length === 0) {
        alert("Name cannot be empty.");
        return;
    }
    if (nameVal.length > 20) {
        alert("Name is too long (max 20 chars).");
        return;
    }

    // 3) Disallow spaces
    if (/\s/.test(nameVal)) {
        alert("Name cannot contain spaces.");
        return;
    }

    // 4) Letters and digits only
    if (!/^[A-Za-z0-9]+$/.test(nameVal)) {
        alert("Name can only contain letters and digits.");
        return;
    }

    // 5) Check forbidden words
    const badWords = ["badword", "someoffensiveword"];
    for (let badWord of badWords) {
        if (nameVal.toLowerCase().includes(badWord)) {
            alert("Name contains forbidden content.");
            return;
        }
    }

    // If all checks pass, make their character and send it to the server
    curPlayer = new Player(
        200, //random(-200*TILESIZE, 200*TILESIZE)
        200, //random(-200*TILESIZE, 200*TILESIZE)
        undefined,
        curID,
        0,
        curRace,
        nameVal
    ); // Default race index 0

    camera.pos = createVector(curPlayer.pos.x, curPlayer.pos.y);

    //load in some chunks for easy start
    let chunkPos = testMap.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
    for (let yOff = -2; yOff < 3; yOff++) {
        for (let xOff = -2; xOff < 3; xOff++) {
            testMap.getChunk(chunkPos.x + xOff, chunkPos.y + yOff);
        }
    }

    giveDefaultItems();

    document.getElementById("canvas-container").style.display = "block";
    socket.emit("new_player", curPlayer);
    gameState = "playing";
    hideRaceSelect();

    // Clear a small area around the player (example logic)
    for (let y = -5; y < 5; y++) {
        for (let x = -5; x < 5; x++) {
            dig(curPlayer.pos.x + x * TILESIZE, curPlayer.pos.y + y * TILESIZE, 1, false);
        }
    }
}

// ─────────────────────────────────────────────────────────
// Update the toggle button text (includes player count)
// ─────────────────────────────────────────────────────────

function updateToggleChatButtonText() {
    // Calculate player count
    const playerCount = Object.keys(players).length + 1;
    // Set arrow and text depending on state
    const arrow = isChatOpen ? "▼" : "▲";
    toggleChatButton.html(`Chat (Players: ${playerCount}) ${arrow}`);
}

// Function to update the player count display when players change
function updatePlayerCount() {

    const playerCount = Object.keys(players).length + 1;

    const arrow = isChatOpen ? "▼" : "▲";
    toggleChatButton.html(`Chat (Players: ${playerCount}) ${arrow}`);

}

// Function to send a chat message via socket
function sendChatMessage() {
    let message = chatInput.value();
    if (message.trim() === "") return; // Avoid sending empty messages

    // Retrieve player position (adjust if you store the player's position differently)
    let x = curPlayer && curPlayer.pos ? curPlayer.pos.x : 0;
    let y = curPlayer && curPlayer.pos ? curPlayer.pos.y : 0;

    // Format data: "x,y,message"
    let data = `${x},${y},${message}`;

    // Emit the chat message to the server
    if (socket) {
        socket.emit("send_message", data);
    }

    // Clear the input after sending
    chatInput.value("");
}


// Function to send a chat message via socket
function sendChatMessage() {
    let message = chatInput.value();
    if (message.trim() === "") return; // Avoid sending empty messages

    // Retrieve player position (adjust if you store the player's position differently)
    let x = curPlayer && curPlayer.pos ? curPlayer.pos.x : 0;
    let y = curPlayer && curPlayer.pos ? curPlayer.pos.y : 0;

    // Format data: "x,y,message"
    let data = `${x},${y},${message}`;

    // Emit the chat message to the server
    if (socket) {
        socket.emit("send_message", data);
    }
    // Clear the input after sending
    chatInput.value("");
}

// Helper function to add a chat message to the messages box
function addChatMessage(chatMsg) {
    if (!chatContainer) return

    //console.log(chatMsg)

    if (!chatMsg.user) {
        chatMsg.user = "SERVER"
    }
    // If your 'chatMsg' object doesn't have a time property, you can generate one:
    // let timeString = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    // Otherwise, if 'chatMsg.time' is already set, you can do:
    const timeString = chatMsg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Create a container for the entire message (text + time)
    let msgContainer = createDiv();
    msgContainer.style("display", "flex");
    msgContainer.style("align-items", "center");
    msgContainer.style("margin-bottom", "6px");

    // Create a text container with the user & message
    let textContainer = createDiv(`<strong>${chatMsg.user}:</strong> ${chatMsg.message}`);
    textContainer.style("color", "#fff");
    textContainer.style("background-color", "#333");
    textContainer.style("padding", "6px 8px");
    textContainer.style("border-radius", "5px 0 0 5px"); // Rounded left corners
    textContainer.style("flex", "1"); // Let this container expand
    textContainer.style("font-size", "0.9em");

    // Create a time container in a smaller box
    let timeDiv = createDiv(timeString);
    timeDiv.style("background-color", "#555");
    timeDiv.style("color", "#ccc");
    timeDiv.style("padding", "6px 8px");
    timeDiv.style("border-radius", "0 5px 5px 0"); // Rounded right corners
    timeDiv.style("margin-left", "4px");
    timeDiv.style("font-size", "0.8em");
    timeDiv.style("white-space", "nowrap"); // Ensure the time doesn't wrap to a new line

    // Add both containers to the main message container
    msgContainer.child(textContainer);
    msgContainer.child(timeDiv);

    // Add the message container to the messages box
    chatMessagesBox.child(msgContainer);

    // Scroll to the bottom of the messages box
    chatMessagesBox.elt.scrollTop = chatMessagesBox.elt.scrollHeight;
}

var invDiv;
var itemListDiv;
var curItemDiv;
var allTag;
var toolsTag;
var weaponsTag;
var equipmentTag;
var consumablesTag;
var spaceBarDiv;
function defineInvUI() {
    // Main inventory container
    invDiv = createDiv();
    invDiv.id("inventory");
    invDiv.class("container");
    // Bring swapInvDiv above other elements
    invDiv.style("z-index", "50");
    // Minimal inline styles – rely on CSS for the main visuals
    applyStyle(invDiv, {
        position: "absolute",
        top: "45%",
        left: "55%",
        transform: "translate(-50%, -50%)",
        display: "none",

    });

    let topBar = createDiv().parent(invDiv);

    applyStyle(topBar, {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    });

    let invTitle = createP("Inventory").parent(topBar);
    invTitle.class("inventory-title");
    invTitle.style("color", "yellow");

    let craftingTitle = createP("Crafting").parent(topBar);
    craftingTitle.class("inventory-title");
    craftingTitle.mousePressed(() => {
        gameState = "crafting";
        craftDiv.show();
        updateCraftList();
        invDiv.hide();
    });
    craftingTitle.style("cursor", "pointer");

    let tagBar = createDiv().parent(invDiv);
    tagBar.class("tag-bar");

    const categories = ["All", "Tools/Seeds", "Weapons", "Equipment", "Consumables"];
    let categoryButtons = {};

    categories.forEach((category) => {
        let button = createButton(category).parent(tagBar);
        button.class("tag-button");
        // If you want minimal inline styles:
        // applyStyle(button, { width: "120px" });

        button.mousePressed(() => {
            curPlayer.invBlock.curTag = category;
            updateItemList();

            // Highlight the selected button
            Object.values(categoryButtons).forEach((btn) => {
                btn.removeClass("selected");
            });
            button.addClass("selected");
        });

        categoryButtons[category] = button;
    });

    // Default selection highlight
    categoryButtons["All"].addClass("selected");

    // Bottom area (item list + details)
    let bottomDiv = createDiv().parent(invDiv);
    bottomDiv.class("bottom-area");

    // Item list
    itemListDiv = createDiv().parent(bottomDiv);
    itemListDiv.class("item-list");

    // Current item details
    curItemDiv = createDiv().parent(bottomDiv);
    curItemDiv.class("item-details");

    // Spacebar Hotkey Div
    spaceBarDiv = createDiv("").parent(invDiv);
    spaceBarDiv.class("spacebar-hotkey");
    spaceBarDiv.html("Hotkey: Space");

    spaceBarDiv.mousePressed(() => {
        curPlayer.invBlock.hotbarItem(curPlayer.invBlock.curItem, curPlayer.invBlock.selectedHotBar);
    });

    spaceBarDiv.hide();

    // Close Button
    let closeButton = createButton("X").parent(topBar);
    closeButton.class("close-button"); // Style it in CSS
    applyStyle(closeButton, {
        marginLeft: "auto",  // Pushes it to the right
        position: "absolute",
        fontSize: "18px",
        right: "0",
        color: "white",
        cursor: "pointer",
        background: "none",
        border: "none",
    });

    closeButton.mousePressed(() => {
        gameState = "playing"
        invDiv.hide(); // Hides the inventory when clicked
    });

    // Finally, populate items
    updateItemList();
    updatecurItemDiv();
}



function updateItemList() {
    if (curPlayer == undefined) return;

    itemListDiv.html("");
    //create a div for each item in the inventory
    let arr = Object.keys(curPlayer.invBlock.items);
    arr = arr.filter((itemName) => {
        if (curPlayer.invBlock.curTag == "All") {
            return true;
        }
        else if (curPlayer.invBlock.curTag == "Tools/Seeds") {
            if (curPlayer.invBlock.items[itemName].type == "Shovel" || curPlayer.invBlock.items[itemName].type == "Seed") {
                return true;
            }
        }
        else if (curPlayer.invBlock.curTag == "Weapons") {
            if (curPlayer.invBlock.items[itemName].type == "Melee" || curPlayer.invBlock.items[itemName].type == "Ranged") {
                return true;
            }
        }
        else if (curPlayer.invBlock.curTag == "Equipment") {
            if (curPlayer.invBlock.items[itemName].type == "Equipment") {
                return true;
            }
        }
        else if (curPlayer.invBlock.curTag == "Consumables") {
            if (curPlayer.invBlock.items[itemName].type == "Food" || curPlayer.invBlock.items[itemName].type == "Potion") {
                return true;
            }
        }

        return false;
    });

    for (let i = 0; i < arr.length; i++) {
        let itemName = arr[i];
        let itemDiv = createDiv();
        itemDiv.style("width", "100%");
        itemDiv.style("height", "50px");
        itemDiv.style("display", "flex");
        itemDiv.style("align-items", "center");
        itemDiv.style("justify-content", "center");
        itemDiv.style("border-bottom", "2px solid black");
        if (curPlayer.invBlock.curItem == itemName) itemDiv.style("background-color", "rgb(120, 120, 120)");
        if (curPlayer.invBlock.curItem == itemName) itemDiv.style("font-style", "italic");
        itemDiv.style("cursor", "pointer");
        itemDiv.parent(itemListDiv);
        itemDiv.mousePressed(() => {
            curPlayer.invBlock.curItem = itemName;
            updateItemList();
            updatecurItemDiv();
        });

        let itemInfoDiv = createDiv();
        itemInfoDiv.style("width", "80%");
        itemInfoDiv.style("height", "50px");
        itemInfoDiv.style("display", "flex");
        itemInfoDiv.style("align-items", "center");
        itemInfoDiv.style("justify-content", "space-between");
        itemInfoDiv.parent(itemDiv);

        let itemNameP = createP((itemName == curPlayer.invBlock.curItem ? "* " : "") + itemName);
        itemNameP.style("font-size", "20px");
        itemNameP.style("color", "white");
        itemNameP.parent(itemInfoDiv);

        let itemAmount = createP(curPlayer.invBlock.items[itemName].amount);
        itemAmount.style("font-size", "20px");
        itemAmount.style("color", "white");
        itemAmount.parent(itemInfoDiv);
    }
}

function updatecurItemDiv() {
    if (curPlayer == undefined) return;

    //clear the div
    curItemDiv.html("");

    if (curPlayer.invBlock.curItem == "") {
        let curItemNone = createP("No Selected Item");
        curItemNone.parent(curItemDiv);
        curItemNone.class("inventory-title");
        applyStyle(curItemNone, {
            paddingTop: "7%",
            textDecoration: "none"
        });
        return;
    };

    let itemCardDiv = createDiv();
    itemCardDiv.style("width", "100%");
    itemCardDiv.style("height", "30%");
    itemCardDiv.style("display", "flex");
    itemCardDiv.style("margin-bottom", "20px");
    itemCardDiv.parent(curItemDiv);

    let itemImgDiv = createDiv();
    itemImgDiv.style("width", "50%");
    itemImgDiv.style("height", "100%");
    itemImgDiv.style("border", "2px solid black");
    itemImgDiv.style("border-radius", "10px");
    //console.log(itemImgPaths[curPlayer.invBlock.items[curPlayer.invBlock.curItem].imgNum][0]);
    itemImgDiv.style("background-image", "url(" + itemImgPaths[curPlayer.invBlock.items[curPlayer.invBlock.curItem].imgNum][0] + ")");
    itemImgDiv.style("background-size", "contain");
    itemImgDiv.style("background-repeat", "no-repeat");
    itemImgDiv.style("background-position", "center");
    itemImgDiv.style("image-rendering", "pixelated");
    itemImgDiv.parent(itemCardDiv);

    let itemNameDescDiv = createDiv();
    itemNameDescDiv.style("width", "calc(50% - 8px)");
    itemNameDescDiv.style("height", "100%");
    itemNameDescDiv.parent(itemCardDiv);

    let itemNameDiv = createDiv();
    itemNameDiv.style("width", "100%");
    itemNameDiv.style("height", "20%");
    itemNameDiv.style("border", "2px solid black");
    itemNameDiv.style("border-radius", "10px");
    itemNameDiv.parent(itemNameDescDiv);

    let itemNameP = createP(curPlayer.invBlock.curItem);
    itemNameP.style("font-size", "20px");
    itemNameP.style("color", "white");
    itemNameP.style("margin", "5px");
    itemNameP.parent(itemNameDiv);

    //create a div for the description
    let itemDescDiv = createDiv();
    itemDescDiv.style("width", "100%");
    itemDescDiv.style("height", "calc(80% - 5px)");
    itemDescDiv.style("border", "2px solid black");
    itemDescDiv.style("border-radius", "10px");
    itemDescDiv.parent(itemNameDescDiv);

    let itemDescP = createP(curPlayer.invBlock.items[curPlayer.invBlock.curItem].desc);
    itemDescP.style("font-size", "20px");
    itemDescP.style("color", "white");
    itemDescP.style("margin", "5px");
    itemDescP.parent(itemDescDiv);

    let itemStatsDiv = createDiv();
    itemStatsDiv.style("width", "100%");
    itemStatsDiv.style("height", "calc(70% - 10px)");
    itemStatsDiv.parent(curItemDiv);

    if (curPlayer.invBlock.items[curPlayer.invBlock.curItem].type != "Simple") {
        let durabilityDiv = createDiv();
        durabilityDiv.style("width", "calc(100% - 14px)");
        durabilityDiv.style("height", "10%");
        durabilityDiv.style("padding", "5px");
        durabilityDiv.style("border", "2px solid black");
        durabilityDiv.style("border-radius", "10px");
        durabilityDiv.style("display", "flex");
        durabilityDiv.style("align-items", "center");
        durabilityDiv.style("justify-content", "center");
        durabilityDiv.style("margin-bottom", "5px");
        durabilityDiv.parent(itemStatsDiv);

        let durabilityText = createP("Durability:");
        durabilityText.style("font-size", "20px");
        durabilityText.style("color", "white");
        durabilityText.parent(durabilityDiv);

        let durabilityBar = createDiv();
        durabilityBar.style("width", "80%");
        durabilityBar.style("height", "20px");
        durabilityBar.style("background-color", "red");
        durabilityBar.style("border", "2px solid black");
        durabilityBar.style("border-radius", "10px");
        durabilityBar.parent(durabilityDiv);

        let durabilityFill = createDiv();
        durabilityFill.style("width", ((curPlayer.invBlock.items[curPlayer.invBlock.curItem].durability / curPlayer.invBlock.items[curPlayer.invBlock.curItem].maxDurability) * 100) + "%");
        durabilityFill.style("height", "100%");
        durabilityFill.style("background-color", "green");
        durabilityFill.style("border-radius", "10px");
        durabilityFill.parent(durabilityBar);
    }

    let statsText = createDiv("Stats");
    statsText.style("font-size", "20px");
    statsText.style("color", "white");
    statsText.style("text-align", "center");
    statsText.style("border", "2px solid black");
    statsText.style("border-radius", "10px");
    statsText.style("padding", "10px");
    statsText.style("margin-bottom", "5px");
    statsText.parent(itemStatsDiv);

    let statsList = createDiv();
    statsList.style("width", "100%");
    statsList.style("height", "calc(90% - 10px)");
    statsList.style("overflow-y", "auto");
    statsList.parent(itemStatsDiv);

    let stats = curPlayer.invBlock.items[curPlayer.invBlock.curItem].getStats();
    stats.forEach(stat => {
        if (stat[0] == "Durability") { }
        else {
            let statDiv = createDiv();
            statDiv.style("width", "100%");
            statDiv.style("height", "20px");
            statDiv.style("display", "flex");
            statDiv.style("margin-bottom", "12px");
            statDiv.parent(statsList);

            let statNameDiv = createDiv(stat[0] + ":");
            statNameDiv.style("width", "50%");
            statNameDiv.style("height", "100%");
            statNameDiv.style("color", "white");
            statNameDiv.style("text-align", "center");
            statNameDiv.style("font-size", "20px");
            statNameDiv.style("border", "2px solid black");
            statNameDiv.style("border-radius", "10px");
            statNameDiv.style("padding", "5px");
            statNameDiv.parent(statDiv);

            let statNumDiv = createDiv(stat[1]);
            statNumDiv.style("width", "50%");
            statNumDiv.style("height", "100%");
            statNumDiv.style("color", "white");
            statNumDiv.style("text-align", "center");
            statNumDiv.style("font-size", "20px");
            statNumDiv.style("border", "2px solid black");
            statNumDiv.style("border-radius", "10px");
            statNumDiv.style("padding", "5px");
            statNumDiv.parent(statDiv);
        }
    });

    updateSpaceBarDiv();
}

function updateSpaceBarDiv() {
    if (curPlayer.invBlock.curItem == "") return;

    if (itemDic[curPlayer.invBlock.curItem].type == "Simple") {
        spaceBarDiv.hide();
    }
    else {
        spaceBarDiv.show();
        let msg = "";
        if (curPlayer.invBlock.curItem == curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]) {
            msg = "(SpaceBar) - remove from hotbar";
        }
        else {
            msg = "(SpaceBar) - put in hotbar";
        }
        spaceBarDiv.html(msg);
    }
}

function renderDirtBagUI() {
    // Dirt Inventory
    push();
    //should add an open and closed version

    if (dirtBagUI.shake.length > 0) {
        //dirt bag shake sound
        if (!dirtBagShakeSound.isLooping()) dirtBagShakeSound.loop();
        if (dirtBagUI.vel.mag() < 1) {
            dirtBagUI.vel.x = dirtBagUI.shake.intensity;
        }
        dirtBagUI.vel.setMag(dirtBagUI.vel.mag() + dirtBagUI.shake.intensity);
        if (dirtBagUI.vel.mag() > dirtBagUI.shake.intensity * 5) {
            dirtBagUI.vel.setMag(dirtBagUI.shake.intensity * 5);
        }
        dirtBagUI.vel.rotate(random(45, 180));
        dirtBagUI.shake.length -= 1;
    }
    else {
        //stop dirt bag shake sound
        dirtBagShakeSound.stop();
        dirtBagUI.shake.intensity = 0;
        dirtBagUI.vel.x = ((width - 180 - 10) - dirtBagUI.pos.x);
        dirtBagUI.vel.y = ((height - 186 - 10) - dirtBagUI.pos.y);
        dirtBagUI.vel.setMag(dirtBagUI.vel.mag() / 10);
    }
    dirtBagUI.pos.add(dirtBagUI.vel);

    let dirtBagOpen = true;
    if (curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar] == "") {
        if (dirtInv >= maxDirtInv - curPlayer.statBlock.stats.handDigSpeed) {
            dirtBagOpen = false;
        }
    }
    else if (curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].type == "Shovel") {
        if (dirtInv >= maxDirtInv - curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].digSpeed) {
            dirtBagOpen = false;
        }
    }
    else if (dirtInv >= maxDirtInv - DIGSPEED) {
        dirtBagOpen = false;
    }

    if (dirtBagOpen) image(dirtBagOpenImg, dirtBagUI.pos.x, dirtBagUI.pos.y, 180, 186);
    else image(dirtBagImg, dirtBagUI.pos.x, dirtBagUI.pos.y, 180, 186);

    fill("#70443C");
    rect(dirtBagUI.pos.x + 30, dirtBagUI.pos.y + 35 + (120 * (1 - (dirtInv / maxDirtInv))), 120, 120 * (dirtInv / maxDirtInv));

    if (!dirtBagOpen) {
        fill(255);
        stroke(0);
        strokeWeight(5);
        textAlign(CENTER, CENTER);
        textSize(50);
        text("Full", dirtBagUI.pos.x + 90, dirtBagUI.pos.y + 100);
    }
    pop();
}

var pauseDiv;
var resumeButton;
var serverSelectButton;
var optionsButton;



var player_status_container;


function styleButton(button) {
    button.style("width", "80%");
    button.style("padding", "10px");
    button.style("margin", "10px");
    button.style("font-size", "18px");
    button.style("border-radius", "5px");
    button.style("cursor", "pointer");
    button.style("color", "white");
}

function togglePlayerStatusTable() {
    // If the container doesn't exist, create and style it
    if (!player_status_container) {
        player_status_container = createDiv();
        player_status_container.id("player_status_container");
        player_status_container.class("container");
        player_status_container.style("position", "absolute");
        player_status_container.style("top", "50%");
        player_status_container.style("left", "50%");
        player_status_container.style("transform", "translate(-50%, -50%)");
        player_status_container.style("width", "30%");
        player_status_container.style("height", "40%");
        player_status_container.style("border", "2px solid black");
        player_status_container.style("border-radius", "10px");
        player_status_container.style("text-align", "center");
        player_status_container.style("padding", "20px");
        player_status_container.style("overflow", "hidden"); // clip if needed
        player_status_container.style("background-color", "#222");
        player_status_container.style("z-index", "999");
        player_status_container.hide();
    }

    // Toggle visibility
    const isVisible = player_status_container.style("display") !== "none";
    //console.log(isVisible)
    if (isVisible) {
        player_status_container.hide();
        return;
    }

    // Clear and fetch fresh data
    player_status_container.html("");

    const title = createP("Players").parent(player_status_container);
    title.style("font-size", "28px");
    title.style("font-weight", "bold");
    title.style("color", "white");
    title.style("text-decoration", "underline");

    if (gameState == "player_status") {
        fetch(getServerUrl(selectedServer) + "/playerinfo")
            .then(res => res.json())
            .then(players => {
                let tableWrapper = createDiv().parent(player_status_container);
                tableWrapper.style("overflow-y", "auto");
                tableWrapper.style("max-height", "70%");
                tableWrapper.style("margin-top", "10px");

                let table = createElement("table").parent(tableWrapper);
                table.style("width", "100%");
                table.style("color", "white");
                table.style("border-collapse", "collapse");
                table.style("font-size", "1rem");

                let thead = createElement("thead").parent(table);
                thead.html("<tr><th>Name</th><th>Kills</th><th>Ping</th></tr>");
                thead.elt.style.backgroundColor = "#333";

                let tbody = createElement("tbody").parent(table);
                players.forEach(p => {
                    const row = createElement("tr").parent(tbody);
                    row.html(`<td>${p.name}</td><td>${p.kills}</td><td>${p.ping}</td>`);
                    row.elt.style.borderBottom = "1px solid #444";
                });

                player_status_container.show();
            })
            .catch(err => {
                console.error("Failed to fetch player info:", err);
                player_status_container.html("❌ Failed to load player data.");
                player_status_container.show();
            });
    }
}



// Render build UI container
var buildDiv;


//   var buildOptions = [
//     { type: "Wall", key: 49, params: { color: curPlayer.color } },
//     { type: "Floor", key: 50, params: { color: curPlayer.color } },
//     { type: "Door", key: 51, params: { color: curPlayer.color } },
//     { type: "Rug", key: 52, params: { color: curPlayer.color } },
//     { type: "Mug", key: 53, params: { color: curPlayer.color } },
//     { type: "BearTrap", key: 54, params: { color: curPlayer.color } },
//     { type: "Turret", key: 55, params: { obj: curPlayer.obj } },
//     { type: "PlacedBomb", key: 56, params: { obj: curPlayer.obj } },
//   ];

// 1) Set up the container DIV
function defineBuildUI() {
    buildDiv = createDiv();
    buildDiv.class("container");
    buildDiv.style("position", "absolute");
    buildDiv.style("top", "40%");
    buildDiv.style("left", "90%");
    buildDiv.style("transform", "translate(-50%, -50%)");
    buildDiv.style("display", "none");
    buildDiv.style("width", "10%");
    buildDiv.style("height", "60%");
    buildDiv.style("border", "2px solid black");
    buildDiv.style("border-radius", "10px");
    buildDiv.style("padding", "20px");

    // If you wanted smaller text, use font-size instead of text-size-adjusted
    buildDiv.style("font-size", "80%");

    // Enable scrolling when content overflows
    buildDiv.style("overflow-y", "scroll");
}

// 2) Render your build options
function renderBuildOptions() {
    // Clear any previous content
    buildDiv.html('');

    // Create an unordered list to hold build options
    const ul = createElement('ul');
    ul.style('list-style', 'none');
    ul.style('padding', '0');
    ul.style('margin', '0 auto');
    ul.parent(buildDiv);

    buildOptions.forEach(option => {
        const humanKey = keyCodeToHuman(option.key);

        // Main list item
        const li = createElement('li');
        li.class("buildOption");
        li.parent(ul);

        // This card wraps each build option
        const buildCard = createDiv();
        buildCard.style('display', 'flex');
        buildCard.style('align-items', 'flex-start');
        buildCard.style('background', 'rgba(0, 0, 0, 0.25)');
        buildCard.style('cursor', 'pointer'); // visually indicates it's clickable
        buildCard.parent(li);

        // If this item is currently selected, highlight the card
        if (ghostBuild.objName === option.objName) {
            buildCard.style('background-color', 'rgba(255, 255, 255, 0.2)');
            buildCard.style('box-shadow', '0 4px 10px rgba(0, 0, 0, 0.5)');
            buildCard.style('border', '3px solid #ffcc00');
        }

        // You can also adjust text size if you want
        buildCard.style('font-size', '0.9rem');

        // Left side: the image
        const imgDiv = createDiv();
        imgDiv.style('margin-right', '15px');
        imgDiv.parent(buildCard);

        const img = createImg(option.images[curPlayer.color % option.images.length], option.objName);
        img.style('width', '64px');
        img.style('height', '64px');
        img.style('image-rendering', 'pixelated');
        img.parent(imgDiv);

        // Right side: text info
        const infoDiv = createDiv();
        infoDiv.style('display', 'flex');
        infoDiv.style('flex-direction', 'column');
        infoDiv.style('flex-grow', '1');
        infoDiv.parent(buildCard);

        // Title row (key + object objName)
        const titleDiv = createDiv(`${humanKey}: ${option.objName}`);
        titleDiv.style('font-size', '1.1rem');
        titleDiv.style('font-weight', 'bold');
        titleDiv.style('margin-bottom', '8px');
        titleDiv.parent(infoDiv);

        // Check if player can build (enough materials)
        let canBuild = true;
        const costArray = objDic[option.objName].cost;
        // costArray example: [ ["dirt", 20], ["Rock", 5] ]

        // This div will list each required material
        const costsDetailsDiv = createDiv();
        costsDetailsDiv.style('font-size', '0.9rem');
        costsDetailsDiv.parent(infoDiv);

        costArray.forEach(([material, requiredAmount]) => {
            let playerHas = 0;
            if (material == "dirt") {
                playerHas = dirtInv.toFixed(1);
                //console.log(playerHas, material);
            }
            else if (curPlayer.invBlock.items[material] != undefined) {
                playerHas = curPlayer.invBlock.items[material].amount;
                //console.log(playerHas, curPlayer.invBlock.items[material], material);
            }
            // Create a line: "Material: X / Y"
            const line = createDiv(`${material}:  ${playerHas} / ${requiredAmount}`);

            // If not enough, color this line red, and set canBuild to false
            if (playerHas < requiredAmount) {
                line.style('color', 'red');
                canBuild = false;
            } else {
                line.style('color', 'white');
            }

            line.parent(costsDetailsDiv);
        });

        // If the player can’t afford ANY material, color the entire text red
        infoDiv.style('color', canBuild ? 'white' : 'red');

        // Click the card -> set ghostBuild to this object
        buildCard.mouseClicked(() => {
            // If you want to prevent selection when not enough materials, uncomment:
            // if (!canBuild) return;

            ghostBuild = createObject(option.objName, 0, 0, 0, 0, " ", " ");

            // Re-render to highlight the newly selected item
            renderBuildOptions();
        });
    });
}



// Helper function to translate key codes to human-friendly strings
function keyCodeToHuman(keyCode) {
    if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90)) {
        return String.fromCharCode(keyCode);
    }
    switch (keyCode) {
        case 32:
            return "Space";
        default:
            return keyCode.toString();
    }
}




function definePauseUI() {

    // Create a container div for the settings
    settingsContainer = createDiv();
    settingsContainer.class("container");
    settingsContainer.style("position", "absolute")
    // Style the container (similar to your CSS)
    settingsContainer.style("font-family", "Arial, sans-serif");
    settingsContainer.style("margin", "0 auto");
    settingsContainer.style("width", "300px");
    settingsContainer.style("background-color", "#222");
    settingsContainer.style("color", "white");
    settingsContainer.style("padding", "20px");
    settingsContainer.style("border-radius", "10px");
    settingsContainer.style("display", "none");
    settingsContainer.style("flex-direction", "column");
    settingsContainer.style("align-items", "center");
    settingsContainer.style("z-index", "999")

    // Title
    let title = createElement("h2", "Settings");
    title.parent(settingsContainer);

    // Create slider container
    let sliderContainer = createDiv();
    sliderContainer.parent(settingsContainer);
    sliderContainer.style("margin", "20px 0");

    // Label
    let volumeLabel = createElement("label", "Volume:");
    volumeLabel.parent(sliderContainer);
    volumeLabel.style("font-size", "16px");
    volumeLabel.style("margin-right", "10px");



    // p5 slider
    volumeSlider = createSlider(0, 100, 50)
    volumeSlider.style("width", "150px");
    volumeSlider.parent(sliderContainer)

    // Retrieve saved volume from localStorage
    const savedVolume = localStorage.getItem("volume");
    if (savedVolume) {
        volumeSlider.value(savedVolume);
    }


    removeData_button = createButton("Remove Data");
    removeData_button.parent(sliderContainer);
    removeData_button.class("button"); // For your reference, you can define .button in CSS if desired
    removeData_button.style("padding", "10px");
    removeData_button.style("margin-top", "20px");
    removeData_button.style("background-color", "#444");
    removeData_button.style("border", "none");
    removeData_button.style("color", "white");
    removeData_button.style("border-radius", "5px");
    removeData_button.style("cursor", "pointer");

    removeData_button.mousePressed(() => {
        // Save volume setting to localStorage
        localStorage.clear()
    });

    removeData_button.parent(sliderContainer)

    // Save button
    saveButton = createButton("Save");
    saveButton.class("button"); // For your reference, you can define .button in CSS if desired
    saveButton.style("padding", "10px");
    saveButton.style("margin-top", "20px");
    saveButton.style("background-color", "#444");
    saveButton.style("border", "none");
    saveButton.style("color", "white");
    saveButton.style("border-radius", "5px");
    saveButton.style("cursor", "pointer");

    saveButton.parent(settingsContainer);
    // Save button logic
    saveButton.mousePressed(() => {
        // Save volume setting to localStorage
        localStorage.setItem("volume", volumeSlider.value());

        // Update the volume of all sounds
        let keys = Object.keys(soundDic);
        for (let i = 0; i < keys.length; i++) {
            for (let j = 1; j < soundDic[keys[i]].sounds.length; j++) {
                soundDic[keys[i]].sounds[j].setVolume((j / 20) * soundDic[keys[i]].volume * (volumeSlider.value() / 100));
            }
        }
        toggleSettings()
    });

    pauseDiv = createDiv();
    pauseDiv.class("container")
    pauseDiv.style("position", "absolute");
    pauseDiv.style("top", "50%");
    pauseDiv.style("left", "50%");
    pauseDiv.style("transform", "translate(-50%, -50%)");
    pauseDiv.style("display", "none");
    pauseDiv.style("flex-direction", "column");
    pauseDiv.style("align-items", "center");
    pauseDiv.style("justify-content", "space-evenly");
    pauseDiv.style("width", "30%");
    pauseDiv.style("height", "40%");
    pauseDiv.style("border", "2px solid black");
    pauseDiv.style("border-radius", "10px");
    pauseDiv.style("text-align", "center");
    pauseDiv.style("padding", "20px");


    let pauseTitle = createP("Paused");
    pauseTitle.style("font-size", "28px");
    pauseTitle.style("font-weight", "bold");
    pauseTitle.style("color", "white");
    pauseTitle.style("text-decoration", "underline");
    pauseTitle.parent(pauseDiv);

    resumeButton = createButton("Resume");
    styleButton(resumeButton);
    resumeButton.mousePressed(() => {
        pauseDiv.hide();
        gameState = "playing";
    });
    resumeButton.parent(pauseDiv);

    settingsButton = createButton(" Settings");
    styleButton(settingsButton);
    settingsButton.mousePressed(toggleSettings);
    settingsButton.parent(pauseDiv);

    serverSelectButton = createButton("Disconnect");
    styleButton(serverSelectButton);
    serverSelectButton.mousePressed(() => {
        location.reload();
    });
    serverSelectButton.parent(pauseDiv);
}




var oldState = "";



// Toggle function for settings menu
function toggleSettings() {
    if (gameState === "settings") {
        // Hide settings (remove iframe and reset game state)
        settingsContainer.style('display', 'none');
        gameState = oldState;  // Restore to previous game state
    } else {
        // Show settings iframe and set game state to "settings"
        oldState = gameState;  // Store the current game state
        settingsContainer.style('display', 'block');  // Show the iframe
        gameState = "settings";  // Set game state to settings
    }
}

function renderPlayerCardUI() {
    push();
    fill(0);
    noStroke();
    rect(width - 530, 0, 510, 125);

    stroke(134);
    strokeWeight(4);
    rect(width - 530 + 6, -20, 510 - 12, 120 + 20 - 6, 10);

    strokeWeight(2);
    line(width - 30 - 115 + 6, 7, width - 30 - 115 + 6, 120 - 6);
    line(width - 530 + 6 + 5, 42, width - 30 - 115 + 6 - 5, 42);

    noStroke();
    fill(134);
    rect(width - 530 + 6 + 79, 52, 295, 21);
    rect(width - 530 + 6 + 79, 83, 295, 21);

    fill(112, 68, 60);
    rect(width - 30 - 115 + 6 + 7, 7, 98, 98);

    fill(0);
    rect(width - 530 + 91, 52, 36, 19);
    rect(width - 530 + 128, 52, 33, 19);
    rect(width - 530 + 163, 52, 34, 19);
    rect(width - 530 + 199, 52, 33, 19);
    rect(width - 530 + 233, 52, 35, 19);
    rect(width - 530 + 269, 52, 33, 19);
    rect(width - 530 + 304, 52, 34, 19);
    rect(width - 530 + 340, 52, 36, 19);

    rect(width - 530 + 91, 83, 36, 19);
    rect(width - 530 + 128, 83, 33, 19);
    rect(width - 530 + 163, 83, 34, 19);
    rect(width - 530 + 199, 83, 33, 19);
    rect(width - 530 + 233, 83, 35, 19);
    rect(width - 530 + 269, 83, 33, 19);
    rect(width - 530 + 304, 83, 34, 19);
    rect(width - 530 + 340, 83, 36, 19);

    image(hpBarImg, width - 530 + 93, 52, 281 * (curPlayer.statBlock.stats.hp / curPlayer.statBlock.stats.mhp), 14, 0, 0, 281 * (curPlayer.statBlock.stats.hp / curPlayer.statBlock.stats.mhp), 14);
    image(manaBarImg, width - 530 + 93, 83, 281 * (curPlayer.statBlock.stats.mp / curPlayer.statBlock.stats.mmp), 14, 0, 0, 281 * (curPlayer.statBlock.stats.mp / curPlayer.statBlock.stats.mmp), 14);

    let raceName = races[curPlayer.race];
    image(raceImages[raceName].portrait, width - 30 - 115 + 6 + 7, 7, 98, 98);

    textFont(gameUIFont);
    textSize(20);
    strokeWeight(1);
    fill(134);
    stroke(134);
    text("lvl", width - 530 + 6 + 10 + 10, 35);
    fill(0, 255, 0);
    stroke(0, 255, 0);
    text(curPlayer.statBlock.level, width - 530 + 6 + 30 + 10 + 5, 35);
    fill(255, 0, 0);
    stroke(255, 0, 0);
    text("HP:", width - 530 + 6 + 30, 70);
    // fill(0,255,255);
    // stroke(0,255,255);
    // text("MP:", width-530+6+30, 100);
    fill(255, 255, 0);
    stroke(255, 255, 0);
    text("AMMO:", width - 530 + 6 + 15, 100);
    //fill with team color
    fill(teamColors[curPlayer.color].r, teamColors[curPlayer.color].g, teamColors[curPlayer.color].b);
    stroke(teamColors[curPlayer.color].r, teamColors[curPlayer.color].g, teamColors[curPlayer.color].b);
    textAlign(CENTER, CENTER);
    text(curPlayer.name, width - 530 + 6 + 45 + (350 / 2), 19);

    let box = gameUIFont.textBounds(curPlayer.name, width - 530 + 6 + 45 + (350 / 2), 19);
    line(box.x, box.y + box.h + 4, box.x + box.w, box.y + box.h + 4);
    pop();
}

var teamPickDiv;

function defineTeamPickUI() {
    teamPickDiv = createDiv();
    teamPickDiv.class("container");
    teamPickDiv.id("teamPickDiv");
    teamPickDiv.style("position", "absolute");
    teamPickDiv.style("top", "50%");
    teamPickDiv.style("left", "50%");
    teamPickDiv.style("transform", "translate(-50%, -50%)");
    teamPickDiv.style("display", "none");
    // teamPickDiv.style("width", "25%");
    // teamPickDiv.style("height", "20%");
    teamPickDiv.style("border", "2px solid black");
    teamPickDiv.style("border-radius", "10px");
    teamPickDiv.style("text-align", "center");
    teamPickDiv.style("padding", "20px");

    updateTeamPickUI();
}

function updateTeamPickUI() {
    teamPickDiv.html("");

    let teamPickTitle = createP("Pick Team");
    teamPickTitle.style("font-size", "28px");
    teamPickTitle.style("font-weight", "bold");
    teamPickTitle.style("color", "white");
    teamPickTitle.style("text-decoration", "underline");
    teamPickTitle.style("margin", "0px");
    teamPickTitle.style("margin-bottom", "10px");
    teamPickTitle.parent(teamPickDiv);

    //turn the team colors into buttons
    for (let i = 0; i < teamColors.length; i++) {
        let teamButton = createButton("");

        teamButton.style("width", "50px");
        teamButton.style("height", "50px");
        teamButton.style("background-color", "rgb(" + teamColors[i].r + "," + teamColors[i].g + "," + teamColors[i].b + ")");
        teamButton.style("margin", "10px");
        teamButton.style("padding", "0px");
        teamButton.style("border-radius", "0px");
        teamButton.style("border", "2px solid black");
        teamButton.style("box-shadow", "0 0 0 4px rgb(128, 128, 128)");
        teamButton.style("cursor", "pointer");
        if (curPlayer == undefined) {
            if (i == 0) {
                teamButton.style("box-shadow", "0 0 0 4px rgb(128, 128, 128), 0 0 0 8px rgb(255, 255, 255)");
            }
        }
        else {
            if (curPlayer.color == i) {
                teamButton.style("box-shadow", "0 0 0 4px rgb(128, 128, 128), 0 0 0 8px rgb(255, 255, 255)");
            }
        }
        if (i == 0) {
            teamButton.style("background-color", "rgb(0,0,0)");
            teamButton.style("background-image", "url('images/ui/none.png')");
            teamButton.style("background-size", "contain");
            teamButton.style("background-repeat", "no-repeat");
            teamButton.style("background-position", "center");
        }

        teamButton.mousePressed(() => {
            curPlayer.color = i;
            socket.emit("update_player", {
                id: curPlayer.id,
                pos: curPlayer.pos,
                holding: curPlayer.holding,
                update_names: ["color"],
                update_values: [curPlayer.color]
            });
            updateTeamPickUI();
            teamPickDiv.hide();
            gameState = "playing";
        });
        teamButton.parent(teamPickDiv);
    }
}

var swapInvDiv;
var itemListDivLeft;
var itemListDivRight;
var curSwapItemDiv;

function defineSwapInvUI() {
    swapInvDiv = createDiv();
    swapInvDiv.id("inventory");
    swapInvDiv.class("container");
    swapInvDiv.style("position", "absolute");
    swapInvDiv.style("position", "absolute");
    swapInvDiv.style("top", "50%");
    swapInvDiv.style("left", "50%");
    swapInvDiv.style("transform", "translate(-50%, -50%)");

    swapInvDiv.style("z-index", "50");

    let swapInvTitleBar = createDiv();
    swapInvTitleBar.parent(swapInvDiv);
    applyStyle(swapInvTitleBar, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "15px",
        borderBottom: "2px solid black"
    });

    let swapInvYourInvTittle = createP("Your Inventory");
    swapInvYourInvTittle.parent(swapInvTitleBar);
    swapInvYourInvTittle.class("inventory-title");
    swapInvYourInvTittle.style("margin-left", "25px");

    let swapInvCurItemTittle = createP("Selected Item");
    swapInvCurItemTittle.parent(swapInvTitleBar);
    swapInvCurItemTittle.class("inventory-title");

    let swapInvOtherInvTittle = createP("Other Inventory");
    swapInvOtherInvTittle.parent(swapInvTitleBar);
    swapInvOtherInvTittle.class("inventory-title");
    swapInvOtherInvTittle.style("margin-right", "25px");

    let swapInvDivInnerds = createDiv();
    swapInvDivInnerds.parent(swapInvDiv);
    swapInvDivInnerds.style("display", "flex");
    swapInvDivInnerds.style("flex-direction", "row");
    swapInvDivInnerds.style("justify-content", "space-evenly");
    swapInvDivInnerds.style("align-items", "start");


    //Left Item list
    itemListDivLeft = createDiv().parent(swapInvDivInnerds);
    itemListDivLeft.class("item-list");

    // Current item details
    curSwapItemDiv = createDiv().parent(swapInvDivInnerds);
    curSwapItemDiv.class("item-details");

    let curSwapItemNone = createP("No Selected Item");
    curSwapItemNone.parent(curSwapItemDiv);
    curSwapItemNone.class("inventory-title");
    applyStyle(curSwapItemNone, {
        paddingTop: "7%",
        textDecoration: "none"
    });

    //Right Item list
    itemListDivRight = createDiv().parent(swapInvDivInnerds);
    itemListDivRight.class("item-list");
    itemListDivRight.style("border-left", "2px solid black");

    // Close Button
    let closeButton = createButton("X").parent(swapInvTitleBar);
    closeButton.class("close-button"); // Style it in CSS
    applyStyle(closeButton, {
        marginLeft: "auto",  // Pushes it to the right
        position: "absolute",
        fontSize: "18px",
        right: "0",
        color: "white",
        cursor: "pointer",
        background: "none",
        border: "none",
    });

    closeButton.mousePressed(() => {
        gameState = "playing"
        swapInvDiv.hide(); // Hides the inventory when clicked
    });

    swapInvDiv.hide();
}

function updateSwapItemLists(otherInv) {
    if (curPlayer == undefined) return;

    itemListDivLeft.html("");
    //create a div for each item in the inventory
    let arr = Object.keys(curPlayer.invBlock.items);

    for (let i = 0; i < arr.length; i++) {
        let itemName = arr[i];
        let itemDiv = createDiv();
        itemDiv.style("width", "100%");
        itemDiv.style("height", "50px");
        itemDiv.style("display", "flex");
        itemDiv.style("align-items", "center");
        itemDiv.style("justify-content", "center");
        itemDiv.style("border-bottom", "2px solid black");
        if (curPlayer.invBlock.curItem == itemName) itemDiv.style("background-color", "rgb(120, 120, 120)");
        if (curPlayer.invBlock.curItem == itemName) itemDiv.style("font-style", "italic");
        itemDiv.style("cursor", "pointer");
        itemDiv.parent(itemListDivLeft);
        itemDiv.mousePressed(() => {
            curPlayer.invBlock.curItem = itemName;
            otherInv.curItem = "";
            updateSwapItemLists(otherInv);
            updatecurSwapItemDiv(otherInv);
        });

        let itemInfoDiv = createDiv();
        itemInfoDiv.style("width", "80%");
        itemInfoDiv.style("height", "50px");
        itemInfoDiv.style("display", "flex");
        itemInfoDiv.style("align-items", "center");
        itemInfoDiv.style("justify-content", "space-between");
        itemInfoDiv.parent(itemDiv);

        let itemNameP = createP((itemName == curPlayer.invBlock.curItem ? "* " : "") + itemName);
        itemNameP.style("font-size", "20px");
        itemNameP.style("color", "white");
        itemNameP.parent(itemInfoDiv);

        let itemAmount = createP(curPlayer.invBlock.items[itemName].amount);
        itemAmount.style("font-size", "20px");
        itemAmount.style("color", "white");
        itemAmount.parent(itemInfoDiv);
    }

    itemListDivRight.html("");
    arr = Object.keys(otherInv.items);
    for (let i = 0; i < arr.length; i++) {
        let itemName = arr[i];
        let itemDiv = createDiv();
        itemDiv.style("width", "100%");
        itemDiv.style("height", "50px");
        itemDiv.style("display", "flex");
        itemDiv.style("align-items", "center");
        itemDiv.style("justify-content", "center");
        itemDiv.style("border-bottom", "2px solid black");
        if (otherInv.curItem == itemName) itemDiv.style("background-color", "rgb(120, 120, 120)");
        if (otherInv.curItem == itemName) itemDiv.style("font-style", "italic");
        itemDiv.style("cursor", "pointer");
        itemDiv.parent(itemListDivRight);
        itemDiv.mousePressed(() => {
            curPlayer.invBlock.curItem = "";
            otherInv.curItem = itemName;
            updateSwapItemLists(otherInv);
            updatecurSwapItemDiv(otherInv);
        });

        let itemInfoDiv = createDiv();
        itemInfoDiv.style("width", "80%");
        itemInfoDiv.style("height", "50px");
        itemInfoDiv.style("display", "flex");
        itemInfoDiv.style("align-items", "center");
        itemInfoDiv.style("justify-content", "space-between");
        itemInfoDiv.parent(itemDiv);

        let itemNameP = createP((itemName == otherInv.curItem ? "* " : "") + itemName);
        itemNameP.style("font-size", "20px");
        itemNameP.style("color", "white");
        itemNameP.parent(itemInfoDiv);

        let itemAmount = createP(otherInv.items[itemName].amount);
        itemAmount.style("font-size", "20px");
        itemAmount.style("color", "white");
        itemAmount.parent(itemInfoDiv);
    }
}


function updatecurSwapItemDiv(otherInv) {
    if (curPlayer == undefined) return;
    let curSwapItem;
    if (curPlayer.invBlock.curItem != "") {
        curSwapItem = curPlayer.invBlock.items[curPlayer.invBlock.curItem];
    }
    else if (otherInv.curItem != "") {
        curSwapItem = otherInv.items[otherInv.curItem];
    }

    if (curSwapItem == undefined) return;

    //clear the div
    curSwapItemDiv.html("");

    let itemCardDiv = createDiv();
    itemCardDiv.style("width", "100%");
    itemCardDiv.style("height", "30%");
    itemCardDiv.style("display", "flex");
    itemCardDiv.style("margin-bottom", "20px");
    itemCardDiv.parent(curSwapItemDiv);

    let itemImgDiv = createDiv();
    itemImgDiv.style("width", "50%");
    itemImgDiv.style("border", "2px solid black");
    itemImgDiv.style("border-radius", "10px");
    //console.log(itemImgPaths[curSwapItem.imgNum][0]);
    itemImgDiv.style("background-image", "url(" + itemImgPaths[curSwapItem.imgNum][0] + ")");
    itemImgDiv.style("background-size", "contain");
    itemImgDiv.style("background-repeat", "no-repeat");
    itemImgDiv.style("background-position", "center");
    itemImgDiv.style("image-rendering", "pixelated");
    itemImgDiv.parent(itemCardDiv);

    let itemNameDescDiv = createDiv();
    itemNameDescDiv.style("width", "calc(50% - 8px)");
    itemNameDescDiv.style("height", "100%");
    itemNameDescDiv.parent(itemCardDiv);

    let itemNameDiv = createDiv();
    itemNameDiv.style("width", "100%");
    itemNameDiv.style("height", "20%");
    itemNameDiv.style("border", "2px solid black");
    itemNameDiv.style("border-radius", "10px");
    itemNameDiv.parent(itemNameDescDiv);

    let itemNameP = createP(curSwapItem.itemName);
    itemNameP.style("font-size", "20px");
    itemNameP.style("color", "white");
    itemNameP.style("margin", "5px");
    itemNameP.parent(itemNameDiv);

    //create a div for the description
    let itemDescDiv = createDiv();
    itemDescDiv.style("width", "100%");
    itemDescDiv.style("height", "calc(80% - 5px)");
    itemDescDiv.style("border", "2px solid black");
    itemDescDiv.style("border-radius", "10px");
    itemDescDiv.parent(itemNameDescDiv);

    let itemDescP = createP(curSwapItem.desc);
    itemDescP.style("font-size", "20px");
    itemDescP.style("color", "white");
    itemDescP.style("margin", "5px");
    itemDescP.parent(itemDescDiv);

    let itemStatsDiv = createDiv();
    itemStatsDiv.style("width", "100%");
    itemStatsDiv.style("height", "calc(70% - 10px)");
    itemStatsDiv.parent(curSwapItemDiv);

    if (curSwapItem.type != "Simple") {

        let durabilityDiv = createDiv();
        durabilityDiv.style("width", "calc(100% - 14px)");
        durabilityDiv.style("height", "10%");
        durabilityDiv.style("padding", "5px");
        durabilityDiv.style("border", "2px solid black");
        durabilityDiv.style("border-radius", "10px");
        durabilityDiv.style("display", "flex");
        durabilityDiv.style("align-items", "center");
        durabilityDiv.style("justify-content", "center");
        durabilityDiv.style("margin-bottom", "5px");
        durabilityDiv.parent(itemStatsDiv);

        let durabilityText = createP("Durability:");
        durabilityText.style("font-size", "20px");
        durabilityText.style("color", "white");
        durabilityText.parent(durabilityDiv);

        let durabilityBar = createDiv();
        durabilityBar.style("width", "80%");
        durabilityBar.style("height", "20px");
        durabilityBar.style("background-color", "red");
        durabilityBar.style("border", "2px solid black");
        durabilityBar.style("border-radius", "10px");
        durabilityBar.parent(durabilityDiv);

        let durabilityFill = createDiv();
        durabilityFill.style("width", ((curSwapItem.durability / curSwapItem.maxDurability) * 100) + "%");
        durabilityFill.style("height", "100%");
        durabilityFill.style("background-color", "green");
        durabilityFill.style("border-radius", "10px");
        durabilityFill.parent(durabilityBar);
    }

    let statsText = createDiv("Stats");
    statsText.style("font-size", "20px");
    statsText.style("color", "white");
    statsText.style("text-align", "center");
    statsText.style("border", "2px solid black");
    statsText.style("border-radius", "10px");
    statsText.style("padding", "10px");
    statsText.style("margin-bottom", "5px");
    statsText.parent(itemStatsDiv);

    let statsList = createDiv();
    statsList.style("width", "100%");
    statsList.style("height", "calc(90% - 10px)");
    statsList.style("overflow-y", "auto");
    statsList.parent(itemStatsDiv);

    let stats;
    if (curPlayer.invBlock.curItem != "") {
        stats = curPlayer.invBlock.getItemStats(curSwapItem.itemName);
    }
    else if (otherInv.curItem != "") {
        stats = otherInv.getItemStats(curSwapItem.itemName);
    }
    //console.log(curSwapItem.itemName);
    stats.forEach(stat => {
        if (stat[0] == "Durability") { }
        else {
            let statDiv = createDiv();
            statDiv.style("width", "100%");
            statDiv.style("height", "20px");
            statDiv.style("display", "flex");
            statDiv.style("margin-bottom", "12px");
            statDiv.parent(statsList);

            let statNameDiv = createDiv(stat[0] + ":");
            statNameDiv.style("width", "50%");
            statNameDiv.style("height", "100%");
            statNameDiv.style("color", "white");
            statNameDiv.style("text-align", "center");
            statNameDiv.style("font-size", "20px");
            statNameDiv.style("border", "2px solid black");
            statNameDiv.style("border-radius", "10px");
            statNameDiv.style("padding", "5px");
            statNameDiv.parent(statDiv);

            let statNumDiv = createDiv(stat[1]);
            statNumDiv.style("width", "50%");
            statNumDiv.style("height", "100%");
            statNumDiv.style("color", "white");
            statNumDiv.style("text-align", "center");
            statNumDiv.style("font-size", "20px");
            statNumDiv.style("border", "2px solid black");
            statNumDiv.style("border-radius", "10px");
            statNumDiv.style("padding", "5px");
            statNumDiv.parent(statDiv);
        }
    });

    updateSpaceBarDiv();
}

//render timer on the top of the screen 
let timerRemaining = 15 * 60; // in seconds
let lastUpdateTime = 0;

let timerDisplay = "15:00";
function setTimeUI(data) {
    timerRemaining = data.minutes * 60 + data.seconds;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const m = Math.floor(timerRemaining / 60).toString().padStart(2, '0');
    const s = (timerRemaining % 60).toString().padStart(2, '0');
    timerDisplay = `${m}:${s}`;
}

function renderTimeUI() {
    if (millis() - lastUpdateTime >= 1000) {
        if (timerRemaining > 0) {
            timerRemaining--;
            updateTimerDisplay();
        }
        lastUpdateTime = millis();
    }
    if (timerDiv) {
        timerDiv.html(" ⏳ " + timerDisplay);
        applyStyle(timerDiv, {
            position: "absolute",
            width: "auto"

        });
    }
}

var craftDiv;
var craftListDiv;
var curCraftItemDiv;

function defineCraftingUI() {
    // Main inventory container
    craftDiv = createDiv();
    craftDiv.id("inventory");
    craftDiv.class("container");

    swapInvDiv.style("z-index", "50");

    // Minimal inline styles – rely on CSS for the main visuals
    applyStyle(craftDiv, {
        position: "absolute",
        top: "45%",
        left: "55%",
        transform: "translate(-50%, -50%)",
        display: "none",

    });

    // Top bar (title area)
    let topBar = createDiv().parent(craftDiv);
    // Let CSS handle sizing and layout. 
    // We'll just give it an appropriate class if we want.
    // e.g., topBar.class("top-bar");
    applyStyle(topBar, {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    });

    // Inventory Title
    let invTitle = createP("Inventory").parent(topBar);
    invTitle.class("inventory-title");
    invTitle.mousePressed(() => {
        gameState = "inventory";
        invDiv.show();
        updateItemList();
        craftDiv.hide();
    });
    invTitle.style("cursor", "pointer");

    // Crafting Title
    let craftingTitle = createP("Crafting").parent(topBar);
    craftingTitle.class("inventory-title");
    craftingTitle.style("color", "yellow");

    // Tag Bar (Category Buttons)
    let tagBar = createDiv().parent(craftDiv);
    tagBar.class("tag-bar");
    // If you want minimal inline style:
    // applyStyle(tagBar, { gap: "5px", borderBottom: "2px solid black" });

    // Define categories
    const categories = ["All", "Tools/Seeds", "Weapons", "Equipment", "Consumables"];
    let categoryButtons = {};

    categories.forEach((category) => {
        let button = createButton(category).parent(tagBar);
        button.class("tag-button");
        // If you want minimal inline styles:
        // applyStyle(button, { width: "120px" });

        button.mousePressed(() => {
            curPlayer.invBlock.curTag = category;
            updateCraftList();

            // Highlight the selected button
            Object.values(categoryButtons).forEach((btn) => {
                btn.removeClass("selected");
            });
            button.addClass("selected");
        });

        categoryButtons[category] = button;
    });

    // Default selection highlight
    categoryButtons["All"].addClass("selected");

    // Bottom area (item list + details)
    let bottomDiv = createDiv().parent(craftDiv);
    bottomDiv.class("bottom-area");

    // Item list
    craftListDiv = createDiv().parent(bottomDiv);
    craftListDiv.class("item-list");

    // Current item details
    curCraftItemDiv = createDiv().parent(bottomDiv);
    curCraftItemDiv.class("item-details");
    let closeButton = createButton("X").parent(topBar);
    closeButton.class("close-button"); // Style it in CSS
    applyStyle(closeButton, {
        marginLeft: "auto",  // Pushes it to the right
        position: "absolute",
        right: "0",
        fontSize: "18px",
        cursor: "pointer",
        background: "none",
        color: "white",
        border: "none",
    });

    closeButton.mousePressed(() => {
        gameState = "playing"
        craftDiv.hide(); // Hides the inventory when clicked
    });
    // Finally, populate items
    updateCraftList();
    updatecurCraftItemDiv();
}

function updateCraftList() {
    if (curPlayer == undefined) return;

    craftListDiv.html("");
    //create a div for each item in the inventory
    let arr = JSON.parse(JSON.stringify(craftOptions));
    arr = arr.filter((item) => {
        if (curPlayer.invBlock.curTag == "All") {
            return true;
        }
        else if (curPlayer.invBlock.curTag == "Tools/Seeds") {
            if (item.type == "Shovel" || item.type == "Seed") {
                return true;
            }
        }
        else if (curPlayer.invBlock.curTag == "Weapons") {
            if (item.type == "Melee" || item.type == "Ranged") {
                return true;
            }
        }
        else if (curPlayer.invBlock.curTag == "Equipment") {
            if (item.type == "Equipment") {
                return true;
            }
        }
        else if (curPlayer.invBlock.curTag == "Consumables") {
            if (item.type == "Food" || item.type == "Potion") {
                return true;
            }
        }

        return false;
    });

    for (let i = 0; i < arr.length; i++) {
        let itemName = arr[i].itemName;
        let itemDiv = createDiv();
        itemDiv.style("width", "100%");
        itemDiv.style("height", "50px");
        itemDiv.style("display", "flex");
        itemDiv.style("align-items", "center");
        itemDiv.style("justify-content", "center");
        itemDiv.style("border-bottom", "2px solid black");
        if (curPlayer.invBlock.curItem == itemName) itemDiv.style("background-color", "rgb(120, 120, 120)");
        if (curPlayer.invBlock.curItem == itemName) itemDiv.style("font-style", "italic");
        itemDiv.style("cursor", "pointer");
        itemDiv.parent(craftListDiv);
        itemDiv.mousePressed(() => {
            curPlayer.invBlock.curItem = itemName;
            updateCraftList();
            updatecurCraftItemDiv();
        });

        let itemInfoDiv = createDiv();
        itemInfoDiv.style("width", "80%");
        itemInfoDiv.style("height", "50px");
        itemInfoDiv.style("display", "flex");
        itemInfoDiv.style("align-items", "center");
        itemInfoDiv.style("justify-content", "space-between");
        itemInfoDiv.parent(itemDiv);

        let itemNameP = createP((itemName == curPlayer.invBlock.curItem ? "* " : "") + itemName);
        itemNameP.style("font-size", "20px");
        itemNameP.style("color", "white");
        itemNameP.parent(itemInfoDiv);

        let craftCheckText = createP(curPlayer.invBlock.craftCheck(itemName) ? "✔" : "✘");
        craftCheckText.style("font-size", "20px");
        craftCheckText.style("color", "white");
        craftCheckText.parent(itemInfoDiv);
    }
}

function updatecurCraftItemDiv() {
    if (curPlayer == undefined) return;

    //clear the div
    curCraftItemDiv.html("");

    if (curPlayer.invBlock.curItem == "") {
        let curCraftItemNone = createP("No Selected Item");
        curCraftItemNone.parent(curCraftItemDiv);
        curCraftItemNone.class("inventory-title");
        applyStyle(curCraftItemNone, {
            paddingTop: "7%",
            textDecoration: "none"
        });
        return;
    };

    let itemCardDiv = createDiv();
    itemCardDiv.style("width", "100%");
    itemCardDiv.style("height", "30%");
    itemCardDiv.style("display", "flex");
    itemCardDiv.style("margin-bottom", "20px");
    itemCardDiv.parent(curCraftItemDiv);

    let itemImgDiv = createDiv();
    itemImgDiv.style("width", "50%");
    itemImgDiv.style("height", "100%");
    itemImgDiv.style("border", "2px solid black");
    itemImgDiv.style("border-radius", "10px");
    //console.log(itemImgPaths[itemDic[curPlayer.invBlock.curItem].img][0]);
    itemImgDiv.style("background-image", "url(" + itemImgPaths[itemDic[curPlayer.invBlock.curItem].img][0] + ")");
    itemImgDiv.style("background-size", "contain");
    itemImgDiv.style("background-repeat", "no-repeat");
    itemImgDiv.style("background-position", "center");
    itemImgDiv.style("image-rendering", "pixelated");
    itemImgDiv.parent(itemCardDiv);

    let itemNameDescDiv = createDiv();
    itemNameDescDiv.style("width", "calc(50% - 8px)");
    itemNameDescDiv.style("height", "100%");
    itemNameDescDiv.parent(itemCardDiv);

    let itemNameDiv = createDiv();
    itemNameDiv.style("width", "100%");
    itemNameDiv.style("height", "20%");
    itemNameDiv.style("border", "2px solid black");
    itemNameDiv.style("border-radius", "10px");
    itemNameDiv.parent(itemNameDescDiv);

    let itemNameP = createP(curPlayer.invBlock.curItem);
    itemNameP.style("font-size", "20px");
    itemNameP.style("color", "white");
    itemNameP.style("margin", "5px");
    itemNameP.parent(itemNameDiv);

    //create a div for the description
    let itemDescDiv = createDiv();
    itemDescDiv.style("width", "100%");
    itemDescDiv.style("height", "calc(80% - 5px)");
    itemDescDiv.style("border", "2px solid black");
    itemDescDiv.style("border-radius", "10px");
    itemDescDiv.parent(itemNameDescDiv);

    let itemDescP = createP(itemDic[curPlayer.invBlock.curItem].desc);
    itemDescP.style("font-size", "20px");
    itemDescP.style("color", "white");
    itemDescP.style("margin", "5px");
    itemDescP.parent(itemDescDiv);

    let itemCostDiv = createDiv();
    itemCostDiv.style("width", "100%");
    itemCostDiv.style("height", "calc(70% - 10px)");
    itemCostDiv.parent(curCraftItemDiv);

    let craftButton = createButton("Craft");
    craftButton.style("height", "15%");
    craftButton.style("font-size", "25px");
    craftButton.style("padding", "5px");
    craftButton.style("border", "2px solid black");
    craftButton.style("border-radius", "10px");
    craftButton.style("align-items", "center");
    craftButton.style("justify-content", "center");
    craftButton.style("margin-bottom", "5px");
    if (!curPlayer.invBlock.craftCheck(curPlayer.invBlock.curItem)) {
        craftButton.style("opacity", "0.5");
        craftButton.style("background-color", "red");
        craftButton.style("pointer-events", "none");
    }
    craftButton.parent(itemCostDiv);
    craftButton.mousePressed(() => {
        if (curPlayer.invBlock.craftCheck(curPlayer.invBlock.curItem)) {
            curPlayer.invBlock.addItem(curPlayer.invBlock.curItem, 1);
            for (let i = 0; i < itemDic[curPlayer.invBlock.curItem].cost.length; i++) {
                //console.log(itemDic[curPlayer.invBlock.curItem].cost[i]);
                if (itemDic[curPlayer.invBlock.curItem].cost[i][0] == "Dirt") {
                    dirtInv -= itemDic[curPlayer.invBlock.curItem].cost[i][1];
                }
                else {
                    curPlayer.invBlock.decreaseAmount(itemDic[curPlayer.invBlock.curItem].cost[i][0], itemDic[curPlayer.invBlock.curItem].cost[i][1]);
                }
            }

            updateCraftList();
            updatecurCraftItemDiv();
        }
    });

    let costText = createDiv("Cost");
    costText.style("font-size", "20px");
    costText.style("color", "white");
    costText.style("text-align", "center");
    costText.style("border", "2px solid black");
    costText.style("border-radius", "10px");
    costText.style("padding", "10px");
    costText.style("margin-bottom", "5px");
    costText.parent(itemCostDiv);

    let costList = createDiv();
    costList.style("width", "100%");
    costList.style("height", "calc(90% - 10px)");
    costList.style("overflow-y", "auto");
    costList.parent(itemCostDiv);

    for (let i = 0; i < itemDic[curPlayer.invBlock.curItem].cost.length; i++) {
        let costDiv = createDiv();
        costDiv.style("width", "100%");
        costDiv.style("height", "20px");
        costDiv.style("display", "flex");
        costDiv.style("margin-bottom", "12px");
        costDiv.parent(costList);

        let itemNameDiv = createDiv(itemDic[curPlayer.invBlock.curItem].cost[i][0] + ":");
        itemNameDiv.style("width", "50%");
        itemNameDiv.style("height", "100%");
        itemNameDiv.style("color", "white");
        itemNameDiv.style("text-align", "center");
        itemNameDiv.style("font-size", "20px");
        itemNameDiv.style("border", "2px solid black");
        itemNameDiv.style("border-radius", "10px");
        itemNameDiv.style("padding", "5px");
        itemNameDiv.parent(costDiv);

        let itemAmountDiv = createDiv(itemDic[curPlayer.invBlock.curItem].cost[i][1]);
        itemAmountDiv.style("width", "50%");
        itemAmountDiv.style("height", "100%");
        itemAmountDiv.style("color", "white");
        itemAmountDiv.style("text-align", "center");
        itemAmountDiv.style("font-size", "20px");
        itemAmountDiv.style("border", "2px solid black");
        itemAmountDiv.style("border-radius", "10px");
        itemAmountDiv.style("padding", "5px");
        itemAmountDiv.parent(costDiv);
    }
}

var deathDiv;

function defineDeathUI() {
    deathDiv = createDiv();
    deathDiv.id("deathDiv");
    deathDiv.class("container");
    deathDiv.style("position", "absolute");
    deathDiv.style("top", "50%");
    deathDiv.style("left", "50%");
    deathDiv.style("transform", "translate(-50%, -50%)");
    deathDiv.style("display", "none");
    deathDiv.style("width", "25%");
    deathDiv.style("height", "20%");
    deathDiv.style("border", "2px solid black");
    deathDiv.style("border-radius", "10px");
    deathDiv.style("text-align", "center");
    deathDiv.style("padding", "20px");

    let title = createP("Dead").parent(deathDiv);
    title.style("font-size", "28px");
    title.style("font-weight", "bold");
    title.style("color", "white");

    let respawnButton = createButton("Respawn").parent(deathDiv);
    styleButton(respawnButton);
    respawnButton.mousePressed(() => {
        curPlayer.pos.x = random(-200 * TILESIZE, 200 * TILESIZE);
        curPlayer.pos.y = random(-200 * TILESIZE, 200 * TILESIZE);

        //load in some chunks for easy start
        let chunkPos = testMap.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
        for (let yOff = -1; yOff < 2; yOff++) {
            for (let xOff = -1; xOff < 2; xOff++) {
                testMap.getChunk(chunkPos.x + xOff, chunkPos.y + yOff);
            }
        }
        // Clear a small area around the player
        for (let y = -5; y < 5; y++) {
            for (let x = -5; x < 5; x++) {
                dig(curPlayer.pos.x + x * TILESIZE, curPlayer.pos.y + y * TILESIZE, 1, false);
            }
        }

        curPlayer.statBlock.stats.hp = 100;

        socket.emit("update_pos", {
            id: curPlayer.id,
            pos: curPlayer.pos,
            holding: curPlayer.holding
        });
        socket.emit("update_player", {
            id: curPlayer.id,
            pos: curPlayer.pos,
            holding: curPlayer.holding,
            update_names: ["stats.hp"],
            update_values: [curPlayer.statBlock.stats.hp]
        });

        giveDefaultItems();

        gameState = "playing";
        deathDiv.hide();
    });

    //disconnect button
    let disconnectButton = createButton("Disconnect").parent(deathDiv);
    styleButton(disconnectButton);
    disconnectButton.mousePressed(() => {
        location.reload();
        deathDiv.hide();
    });
}