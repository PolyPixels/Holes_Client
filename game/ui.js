//globals for ui.js
var raceSelected = false;
var nameEntered = false;
var raceButtons = []; // now storing "card" divs instead of p5 buttons
var goButton;
var nameInput;

// Array of build option objects

function updateResponsiveDesign() {
    // Update positions for the name input and "Go" button
    const inputWidth = 220; // as defined in style
    const spacing = 20;

    nameInput?.position(width / 2 - inputWidth / 2, height * 0.7);
    goButton?.position(width / 2 + inputWidth / 2 + spacing, height * 0.7);

    // Update race card widths responsively
    let newCardWidth = constrain(width * 0.15, 150, 300);
    raceButtons.forEach((card) => {
        card.style("width", newCardWidth + "px");
    });

    // Optionally update the race title font size for better scaling
    raceTitle?.style("font-size", "calc(1.5vw + 24px)");
}

function hideRaceSelect(){
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
    { ip: "localhost", name: "Local Server", status: "Online" },
    { ip: "54.91.39.132", name: "Remote Server", status: "Online" },
];

let selectedServer = null;
let serverBrowserContainer, inputName, inputIP, inputStatus, addServerButton;
let renderedserverBrowserContainer = false;

function saveServers() {
    localStorage.setItem("servers", JSON.stringify(serverList));
}

let linksRendered = false; // Flag to prevent duplicate rendering
let linkContainer, settingsContainer, toggleButton; // Store references for hiding
// Function to render buttons instead of links
function renderLinks() {
    if (linksRendered) return; // Prevent duplicate rendering

    // Parent container for buttons (Bottom Right)
    linkContainer = createDiv();
    linkContainer.class("container")
    applyStyle(linkContainer, {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
        zIndex: "1000",
    });

    // Create individual buttons
    createLinkButton(linkContainer, "🔗 Itch.io", "https://polypikzel.itch.io/");
    createLinkButton(linkContainer, "🐙 GitHub", "https://github.com/PolyPixels");
    createLinkButton(linkContainer, "💬 Discord", "https://discord.gg/Quhy52U5ae");

    // Parent container for settings (Bottom Left)
    settingsContainer = createDiv();
    settingsContainer.class("container")
    applyStyle(settingsContainer, {
        position: "fixed",
        bottom: "10px",
        left: "10px",
        zIndex: "1000",
    });

    // Create settings button
    let settingsButton = createButton("⚙️ Settings").parent(settingsContainer);
    styleButton(settingsButton);
    settingsButton.mousePressed(() => openSettings());

    // Append elements to body
    linkContainer.parent(document.body);
    settingsContainer.parent(document.body);

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
        border: "2px solid cyan",
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
    if(renderLinks){
        if (linkContainer.style("display") === "none") {
            linkContainer.style("display", "flex");
            settingsContainer.style("display", "flex")
        } else {
            linkContainer.style("display", "none");
            settingsContainer.style("display", "none")
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

// Placeholder function for settings
function openSettings() {
    alert("Settings menu coming soon!"); // Replace with actual settings logic
}


function renderServerBrowser() {
    if (!renderedserverBrowserContainer) {
        renderedserverBrowserContainer = true;
        serverBrowserContainer = createDiv();
        serverBrowserContainer.id("serverBrowserContainer");
        serverBrowserContainer.class("container")

        // Main container styling
        serverBrowserContainer.style("width", "500px");
        serverBrowserContainer.style("max-height", "700px");
        serverBrowserContainer.style("overflow-y", "auto");
        serverBrowserContainer.style("background", "#1e1e1e");
        serverBrowserContainer.style("padding", "25px");
        serverBrowserContainer.style("border-radius", "15px");
        serverBrowserContainer.style("color", "#fff");
        serverBrowserContainer.style("font-family", "Arial, sans-serif");
        serverBrowserContainer.style("box-shadow", "0px 8px 16px rgba(0, 0, 0, 0.4)");

        // Position the container in the center
        serverBrowserContainer.style("position", "fixed");
        serverBrowserContainer.style("top", "50%");
        serverBrowserContainer.style("left", "50%");
        serverBrowserContainer.style("transform", "translate(-50%, -50%)");

        // 🎮 Server Selection Title
        let title = createDiv("🎮 Select a Server");
        title.style("font-size", "22px");
        title.style("font-weight", "bold");
        title.style("margin-bottom", "15px");
        title.style("text-align", "center");
        title.parent(serverBrowserContainer);

        renderServerList();

        // Separate section for adding new servers
        let addServerSection = createDiv();
        addServerSection.style("margin-top", "30px");
        addServerSection.style("padding", "15px");
        addServerSection.style("background", "#2a2a2a");
        addServerSection.style("border-radius", "10px");
        addServerSection.parent(serverBrowserContainer);

        // ➕ Add Server Title
        let addServerTitle = createDiv("➕ Add New Server");
        addServerTitle.style("font-size", "18px");
        addServerTitle.style("margin-bottom", "10px");
        addServerTitle.style("text-align", "center");
        addServerTitle.parent(addServerSection);

        // 🌐 Server Name Input
        inputName = createInput("").attribute("placeholder", "🌐 Server Name");
        inputName.parent(addServerSection);
        inputName.style("width", "90%");
        inputName.style("margin-bottom", "8px");
        inputName.style("padding", "10px");
        inputName.style("border-radius", "5px");

        // 📡 Server IP Input
        inputIP = createInput("").attribute("placeholder", "📡 Server IP");
        inputIP.parent(addServerSection);
        inputIP.style("width", "90%");
        inputIP.style("margin-bottom", "8px");
        inputIP.style("padding", "10px");
        inputIP.style("border-radius", "5px");

        // Add Server Button
        addServerButton = createButton("➕ Add Server");
        addServerButton.parent(addServerSection);
        addServerButton.style("width", "100%");
        addServerButton.style("padding", "12px");
        addServerButton.style("cursor", "pointer");
        addServerButton.style("background", "#007acc");
        addServerButton.style("color", "#fff");
        addServerButton.style("border", "none");
        addServerButton.style("border-radius", "5px");

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

        // 🖥️ Connect Button
        let connectButton = createButton("🖥️ Connect");
        connectButton.parent(serverBrowserContainer);
        connectButton.style("width", "100%");
        connectButton.style("margin-top", "20px");
        connectButton.style("padding", "12px");
        connectButton.style("background", "#4CAF50");
        connectButton.style("color", "#fff");
        connectButton.style("border", "none");
        connectButton.style("border-radius", "5px");

        connectButton.mousePressed(() => {
            if (selectedServer) {
                socket = io.connect("http://" + selectedServer.ip + ":3000");
                socketSetup();
                testMap = new Map();
                ghostBuild = createObject("Wall", 0,0,0, 0, " ", " ");
                console.log("Connected to " + selectedServer.ip);
                hideServerBrowser();
                gameState = "race_selection";
                renderedserverBrowserContainer = false;
            } else {
                alert("⚠️ Please select a server first.");
            }
        });
    }
}



function fetchServerStatus(server, callback) {
    fetch(`http://${server.ip}:3000/status`)
        .then(response => response.json())
        .then(data => {callback(data);})
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
        
        serverEntry.style("padding", "10px");
        serverEntry.style("margin-bottom", "10px");
        serverEntry.style("border-radius", "8px");
        serverEntry.style("background-color", "#404040");
        serverEntry.style("cursor", "pointer");
        serverEntry.style("display", "flex");
        serverEntry.style("align-items", "center"); // Align items vertically
        serverEntry.style("gap", "10px"); // Add spacing between elements
        serverEntry
        // Create a container for the logo
        let logoContainer = createDiv();
        logoContainer.style("width", "60px"); // Fixed width for uniformity
        logoContainer.style("height", "60px");
        logoContainer.style("display", "flex");
        logoContainer.style("align-items", "center");
        logoContainer.style("justify-content", "center");
        logoContainer.style("border-radius", "50%"); // Circular logo
        logoContainer.style("overflow", "hidden"); // Prevent overflow of the image
        
        let serverLogo = createImg(server.image);
        serverLogo.style("width", "100%");
        serverLogo.style("height", "100%");
        serverLogo.style("object-fit", "cover"); // Ensures it fits without distortion
        serverLogo.parent(logoContainer);
        logoContainer.parent(serverEntry);
      
        // Create a container for text details
        let textContainer = createDiv();
        textContainer.style("display", "flex");
        textContainer.style("flex-direction", "column");
        textContainer.style("justify-content", "center");
        textContainer.style("flex-grow", "1"); // Allows text to take available space
        
        let serverName = createDiv(server.name);
        serverName.style("font-size", "18px");
        serverName.style("font-weight", "bold");
        serverName.style("color", "#FFFFFF");
        serverName.parent(textContainer);
        
        let serverIP = createDiv(`IP: ${server.ip}`);
        serverIP.style("font-size", "14px");
        serverIP.style("color", "#AAAAAA");
        serverIP.parent(textContainer);
        
        let serverStatus = createDiv("Status: Loading...");
        serverStatus.style("font-size", "14px");
        serverStatus.style("color", "#FFD700");
        serverStatus.parent(textContainer);
        
        let playerCount = createDiv("Players: Loading...");
        playerCount.style("font-size", "14px");
        playerCount.style("color", "#00FFFF");
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
            serverEntry.style("opacity", data.status === "Online" ?"1": "0.5");
        });

        // Remove server button
        let removeButton = createButton("Remove");
        removeButton.parent(serverEntry);
        removeButton.style("margin-left", "10px");
        removeButton.style("padding", "5px");
        removeButton.style("background-color", "#F44336");
        removeButton.style("color", "#fff");
        removeButton.style("border", "none");
        removeButton.style("border-radius", "3px");
        removeButton.style("cursor", "pointer");




        removeButton.mousePressed(() => {
            serverList.splice(index, 1);
            saveServers();
            renderServerList();
        });

        // Select a server
        serverEntry.mousePressed(() => {
            let entries = selectAll(".serverEntry");
            for (let e of entries) {
                e.style("background-color", "#404040");
            }
            serverEntry.style("background-color", "#4CAF50");
            selectedServer = server;
            console.log("Server selected:", selectedServer);
        });

        serverEntry.parent(serverBrowserContainer);
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
    raceTitle.elt.innerHTML =  "Select Your Race"
    raceTitle.style("position", "absolute");
    raceTitle.style("top", "1dvw");
    raceTitle.style("left", "50%");
    raceTitle.style("transform", "translateX(-50%)");
    // Responsive font size (combining viewport and fixed pixels)
    raceTitle.style("font-size", "calc(1.5vw + 24px)");
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
    race_back_button.innerHTML = "Go Back"

    race_back_button.style("font-size", "20px");
    race_back_button.style("color", "#fff");
    race_back_button.style("border", "none");
    race_back_button.style("border-radius", "8px");

    race_back_button.style("position", "absolute");
    race_back_button.style("top", "35dvw");
  
    race_back_button.mousePressed(()=>{
        console.log("pressed")
        hideRaceSelect()
        gameState = "initial"
    })

    race_back_button.show();
    race_back_button.parent(raceContainer);
    raceButtons.forEach((card) => {
        card.show();
    });
    // Enable the "Go" button only when a race is selected and a name is entered
    if (raceSelected && nameEntered) {
        goButton.removeAttribute("disabled");
    } else {
        goButton.attribute("disabled", true);
    }
}

// ---------------------------------------------------
//  Responsive behavior on window resize
// ---------------------------------------------------


function setupUI(){
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
    definePlayerStatusDiv();
    raceTitle = createDiv();
    // ---------------------------------------------------
    //  Create a container for race selection cards (centered)
    // ---------------------------------------------------
    raceContainer = createDiv();
    race_back_button = createButton("go back")
    raceContainer.id("raceContainer");
    raceContainer.style("position", "absolute");
    raceContainer.style("top", "10dvw");
    raceContainer.style("left", "50%");
    raceContainer.style("transform", "translateX(-50%)");
    raceContainer.style("display", "none");
    raceContainer.style("flex-wrap", "wrap");
    raceContainer.style("justify-content", "center");
    raceContainer.style("align-items", "center");
    raceContainer.style("gap", "30px");
    raceContainer.style("background-color", "rgba(0, 0, 0, 0.3)");
    raceContainer.style("padding", "0px");
    raceContainer.style("border-radius", "10px");
    raceContainer.style("min-width","100dvw")
    // ---------------------------------------------------
    //  Create cards for each race (with responsive sizing)
    // Allowed stats to display
    const allowedStats = ["hp", "mhp", "regen", "attack", "magic", "magicResistance", "hearing"];

    // Iterate over each race in the races array
    races.forEach((raceName, i) => {
        // Create the card container for the race
        let card = createDiv();
        card.class("raceCard");
        card.style("display", "flex");
        card.style("flex-direction", "column");
        card.style("align-items", "center");

        // Responsive card width: based on canvas width, constrained between 150 and 300px
        let cardWidth = constrain(width * 0.15, 150, 300);
        card.style("width", cardWidth + "px");

        card.style("border", "3px solid #fff");
        card.style("border-radius", "10px");
        card.style("padding", "15px");
        card.style("cursor", "pointer");
        card.style("transition", "transform 0.2s, background-color 0.2s, box-shadow 0.2s");
        card.selected = false; // custom property for selection

        // Create an image element for the race portrait
        let raceImgPath = `images/characters/${raceName}/${raceName}_portrait.png`;
        let raceImg = createImg(raceImgPath, `${raceName} image`);
        raceImg.style("max-width", "10dvw");
        raceImg.style("height", "10dvh");
        raceImg.style("image-rendering", "pixelated");
        raceImg.parent(card);

        // Retrieve stats from BASE_STATS (assumes the same order as races)
        let raceStats = BASE_STATS[i];
        // Build a text string for only the allowed stats
        let statsText = allowedStats
            .map(stat => `${stat}: ${raceStats[stat]}`)
            .join(" <br> ");
    
        // Create a label for the stats
        let raceStatsLbl = createP(statsText);
        raceStatsLbl.style("color", "#fff");
        raceStatsLbl.style("font-size", "calc(0.5vw + 12px)");
        raceStatsLbl.style("font-weight", "bold");
        raceStatsLbl.style("margin", "0");
        raceStatsLbl.style("align-self", "flex-end");
        raceStatsLbl.style("text-align", "right");
        raceStatsLbl.parent(card);

        // Create a race name label
        let raceLbl = createP(raceName.toUpperCase());
        raceLbl.style("color", "#fff");
        raceLbl.style("font-size", "calc(0.5vw + 16px)");
        raceLbl.style("font-weight", "bold");
        raceLbl.style("margin", "10px 0 0 0");
        raceLbl.style("text-align", "center");
        raceLbl.parent(card);

        // Add a hover effect: subtle scale & shadow
        card.mouseOver(() => {
            card.style("background-color", "#525252");
            card.style("transform", "scale(1.03)");
            card.style("box-shadow", "0 8px 16px rgba(0,0,0,0.3)");
        });
        card.mouseOut(() => {
            card.style("transform", "scale(1)");
            card.style("box-shadow", "none");
            card.style("background-color", card.selected ? "#4CAF50" : "#404040");
        });

        // On click: deselect all cards, then select this one and update curPlayer
        card.mousePressed(() => {
            raceButtons.forEach((c) => {
                c.selected = false;
                c.style("background-color", "#404040");
            });
            card.selected = true;
            card.style("background-color", "#4CAF50");
            raceSelected = true;
            curPlayer.race = i; // Assuming a mapping by index
            console.log("Race selected:", races[i]);
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
    // Positioning using canvas width and a fixed width of 220px
    nameInput.position(width / 2 - 110, height * 0.7);
    nameInput.style("font-size", "20px");
    nameInput.style("border", "3px solid #ccc");
    nameInput.style("border-radius", "8px");
    nameInput.style("padding", "10px");
    nameInput.style("width", "220px");
    nameInput.style("outline", "none");
    nameInput.attribute('placeholder', 'Name :');
    nameInput.style("transition", "border 0.2s");
    nameInput.input(() => {
        checkName();
    });
    nameInput.mouseOver(() => {
        nameInput.style("border", "3px solid #4CAF50");
    });
    nameInput.mouseOut(() => {
        nameInput.style("border", "3px solid #ccc");
    });

    // ---------------------------------------------------
    //   "Go" Button (centered, larger & responsive)
    // ---------------------------------------------------
    goButton = createButton("Go");
    goButton.hide();
    // Position near the name input with a fixed offset
    goButton.position(width / 2 + 130, height * 0.7);
    goButton.attribute("disabled", true);
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
        if(!selectedServer) {
            alert("issue with server retry");
            return;
        } 
        if(!raceSelected) {
            alert("Pick a race");
            return;
        }

        if(!nameEntered) {
            alert("pick a name");
            return;
        }

        if(!curPlayer) return;
        curPlayer.name = nameInput.value();
        socket.emit("new_player", curPlayer);
        gameState = "playing";
        hideRaceSelect();

        // Clear a small area around the player (example logic)
        for (let y = -5; y < 5; y++) {
            for (let x = -5; x < 5; x++) {
                dig(curPlayer.pos.x + x * TILESIZE, curPlayer.pos.y + y * TILESIZE, 1);
            }
        }
        dirtInv = 0;
    });
}

// Global variables for chat UI elements and player count display
let chatContainer, chatMessagesBox, chatInput, chatSendButton;
let playerCountDiv; // New global variable for player count display
let chatRendered = false
function renderChatUI() {
  if(chatRendered) return
  chatRendered = true
  // Create chat container positioned at bottom left
  chatContainer = createDiv();
  chatContainer.class("container")
  chatContainer.style("position", "fixed");
  chatContainer.style("bottom", "10px");
  chatContainer.style("left", "10px");
  chatContainer.style("z-index", "1000");
  chatContainer.style("width", "300px");
  chatContainer.style("background-color", "rgba(0, 0, 0, 0.5)");
  chatContainer.style("padding", "10px");
  chatContainer.style("border-radius", "8px");
  chatContainer.style("pointer-events", "auto"); // Ensure clicks go through
  
  // Create messages box to display chat history
  chatMessagesBox = createDiv();
  chatMessagesBox.style("height", "150px");
  chatMessagesBox.style("overflow-y", "scroll");
  chatMessagesBox.style("background-color", "#222");
  chatMessagesBox.style("color", "#fff");
  chatMessagesBox.style("padding", "5px");
  chatMessagesBox.style("margin-bottom", "10px");
  chatMessagesBox.style("border-radius", "5px");
  
  // Create a player count display div
  // Adjust the text, position, and styles as desired
  playerCountDiv = createDiv("Players: " + (Object.keys(players).length + 1));
  playerCountDiv.style("position", "fixed");
  playerCountDiv.style("z-index", "1000");
  playerCountDiv.style("color", "#fff");
  playerCountDiv.style("background-color", "rgba(0, 0, 0, 0.5)");
  playerCountDiv.style("border-radius", "8px");
  playerCountDiv.style("margin-top", "-20px");
  playerCountDiv.parent(chatContainer);

  // Create chat input field
  chatInput = createInput("");
  chatInput.attribute("placeholder", "Type your message...");
  chatInput.style("width", "calc(100% - 60px)");
  chatInput.style("padding", "8px");
  chatInput.style("border", "none");
  chatInput.style("border-radius", "5px");
  chatInput.changed(() => {
    console.log("Chat input changed to:", chatInput.value());
  });
  chatInput.mousePressed(() => {
    gameState = "chating";
  });
  
  // Listen for the Enter key to send the chat message:
  chatInput.elt.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendChatMessage(); // Make sure this function emits your socket event
      gameState = "playing";
    }
  });
  
  // Create send button
  chatSendButton = createButton("Send");
  chatSendButton.style("padding", "8px 12px");
  chatSendButton.style("margin-left", "5px");
  chatSendButton.style("border", "none");
  chatSendButton.style("border-radius", "5px");
  chatSendButton.style("color", "#fff");
  chatSendButton.mousePressed(() => {
    sendChatMessage();
    gameState = "playing";
  });
  
  // Create a container for input and button
  let inputContainer = createDiv();
  inputContainer.style("display", "flex");
  inputContainer.child(chatInput);
  inputContainer.child(chatSendButton);
  
  // Append the messages box and input container to the chat container
  chatContainer.child(chatMessagesBox);
  chatContainer.child(inputContainer);
  
  // Append chat container to the document body
  chatContainer.parent(document.body);
  
}

// Function to update the player count display when players change
function updatePlayerCount() {
  if (playerCountDiv) {
    playerCountDiv.html("Players: " + (Object.keys(players).length + 1));
  }
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
  // Create a new div element with the message content
  let msgDiv = createDiv(`<strong>${chatMsg.user}:</strong> ${chatMsg.message}`);
  msgDiv.style("padding", "2px 0");
  chatMessagesBox.child(msgDiv);

  // Optionally, scroll to the bottom of the messages box
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
    invDiv = createDiv();
    invDiv.id("inventory");
    invDiv.class("container")
    
    // Center the div
    applyStyle(invDiv, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "none",
        width: "40%",
        height: "75%",
        border: "2px solid cyan",
        borderRadius: "10px",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
    });

    // Top Bar (Title)
    let topBar = createDiv().parent(invDiv);
    applyStyle(topBar, {
        width: "100%",
        height: "10%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    });

    let invTitle = createP("Inventory").parent(topBar);
    applyStyle(invTitle, {
        fontSize: "24px",
        fontWeight: "bold",
        color: "white",
        textDecoration: "underline",
        paddingRight: "10px",
    });

    let craftingTitle = createP("Crafting").parent(topBar);
    applyStyle(craftingTitle, {
        fontSize: "24px",
        fontWeight: "bold",
        color: "white",
        textDecoration: "underline",
        paddingLeft: "10px",
    });

    // Tag Bar (Category Buttons)
    let tagBar = createDiv().parent(invDiv);
    applyStyle(tagBar, {
        width: "100%",
        height: "10%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderBottom: "2px solid black",
        gap: "5px",
    });

    // Define categories
    const categories = ["All", "Tools/Seeds", "Weapons", "Equipment", "Consumables"];
    let categoryButtons = {};

    categories.forEach((category) => {
        let button = createButton(category).parent(tagBar);
        styleButton(button, "120px");

        button.mousePressed(() => {
            curPlayer.invBlock.curTag = category;
            updateItemList();

            // Highlight selected button
            Object.values(categoryButtons).forEach((btn) => btn.style("background-color", "rgb(80,80,80)"));
            button.style("background-color", "rgb(120,120,120)");
        });

        categoryButtons[category] = button;
    });

    // Default selection highlight
    categoryButtons["All"].style("background-color", "rgb(120,120,120)");

    // Bottom Area (Item List & Details)
    let bottomDiv = createDiv().parent(invDiv);
    applyStyle(bottomDiv, {
        width: "100%",
        height: "80%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    });

    itemListDiv = createDiv().parent(bottomDiv);
    applyStyle(itemListDiv, {
        width: "50%",
        height: "100%",
        overflowY: "auto",
    });

    curItemDiv = createDiv().parent(bottomDiv);
    applyStyle(curItemDiv, {
        width: "50%",
        height: "100%",
        borderLeft: "2px solid black",
    });

    // Spacebar Hotkey Div
    spaceBarDiv = createDiv("").parent(invDiv);
    applyStyle(spaceBarDiv, {
        position: "absolute",
        top: "105%",
        left: "50%",
        transform: "translate(-50%, 0%)",
        backgroundColor: "rgb(80,80,80)",
        border: "2px solid black",
        borderRadius: "10px",
        padding: "5px",
        fontSize: "20px",
        color: "white",
        cursor: "pointer",
    });

    spaceBarDiv.mousePressed(() => {
        curPlayer.invBlock.hotbarItem(curPlayer.invBlock.curItem, curPlayer.invBlock.selectedHotBar);
    });

    spaceBarDiv.hide();
    updateItemList();
    updatecurItemDiv();
}


function updateItemList(){
    if(curPlayer == undefined) return;

    itemListDiv.html("");
    //create a div for each item in the inventory
    let arr = Object.keys(curPlayer.invBlock.items);
    arr = arr.filter((itemName) => {
        if(curPlayer.invBlock.curTag == "All"){
            return true;
        }
        else if(curPlayer.invBlock.curTag == "Tools/Seeds"){
            if(curPlayer.invBlock.items[itemName].type == "Shovel" || curPlayer.invBlock.items[itemName].type == "Seed"){
                return true;
            }
        }
        else if(curPlayer.invBlock.curTag == "Weapons"){
            if(curPlayer.invBlock.items[itemName].type == "Melee" || curPlayer.invBlock.items[itemName].type == "Ranged"){
                return true;
            }
        }
        else if(curPlayer.invBlock.curTag == "Equipment"){
            if(curPlayer.invBlock.items[itemName].type == "Equipment"){
                return true;
            }
        }
        else if(curPlayer.invBlock.curTag == "Consumables"){
            if(curPlayer.invBlock.items[itemName].type == "Food" || curPlayer.invBlock.items[itemName].type == "Potion"){
                return true;
            }
        }

        return false;
    });

    for(let i = 0; i < arr.length; i++){
        let itemName = arr[i];
        let itemDiv = createDiv();
        itemDiv.style("width", "100%");
        itemDiv.style("height", "50px");
        itemDiv.style("display", "flex");
        itemDiv.style("align-items", "center");
        itemDiv.style("justify-content", "center");
        itemDiv.style("border-bottom", "2px solid black");
        if(curPlayer.invBlock.curItem == itemName) itemDiv.style("background-color", "rgb(120, 120, 120)");
        if(curPlayer.invBlock.curItem == itemName) itemDiv.style("font-style", "italic");
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

        let itemNameP = createP((itemName == curPlayer.invBlock.curItem ? "* ":"") + itemName);
        itemNameP.style("font-size", "20px");
        itemNameP.style("color", "white");
        itemNameP.parent(itemInfoDiv);

        let itemAmount = createP(curPlayer.invBlock.items[itemName].amount);
        itemAmount.style("font-size", "20px");
        itemAmount.style("color", "white");
        itemAmount.parent(itemInfoDiv);
    }
}

function updatecurItemDiv(){
    if(curPlayer == undefined) return;

    //clear the div
    curItemDiv.html("");

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
    itemImgDiv.style("background-image", `url(images/items/${itemImgNames[curPlayer.invBlock.items[curPlayer.invBlock.curItem].imgNum][0]}.png)`);
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
  
    if(curPlayer.invBlock.items[curPlayer.invBlock.curItem].type != "Simple"){
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
        durabilityFill.style("width", ((curPlayer.invBlock.items[curPlayer.invBlock.curItem].durability/curPlayer.invBlock.items[curPlayer.invBlock.curItem].maxDurability)*100)+"%");
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
        if(stat[0] == "Durability"){}
        else{
            let statDiv = createDiv();
            statDiv.style("width", "100%");
            statDiv.style("height", "20px");
            statDiv.style("display", "flex");
            statDiv.style("margin-bottom", "12px");
            statDiv.parent(statsList);

            let statNameDiv = createDiv(stat[0]+":");
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

function updateSpaceBarDiv(){
    if(curPlayer.invBlock.curItem == "") return;

    if(curPlayer.invBlock.items[curPlayer.invBlock.curItem].type == "Simple"){
        spaceBarDiv.hide();
    }
    else{
        spaceBarDiv.show();
        let msg = "";
        if(curPlayer.invBlock.curItem == curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]){
            msg = "(SpaceBar) - remove from hotbar";
        }
        else{
            msg = "(SpaceBar) - put in hotbar";
        }
        spaceBarDiv.html(msg);
    }
}

function renderDirtBagUI(){
    // Dirt Inventory
    push();
    //should add an open and closed version
    if (curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].type == "Shovel"){
        if(dirtInv >= 150 - curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].digSpeed){
            image(dirtBagImg, width - 180 - 10, height - 186 - 10, 180, 186);
        }
        else{
            image(dirtBagOpenImg, width - 180 - 10, height - 186 - 10, 180, 186);
        }
    }
    else if(dirtInv >= 150 - DIGSPEED){
        image(dirtBagImg, width - 180 - 10, height - 186 - 10, 180, 186);
    }
    else{
        image(dirtBagOpenImg, width - 180 - 10, height - 186 - 10, 180, 186);
    }
    
    fill("#70443C");
    rect(width - 180 + 20, height - 186 + 25 + (120 * (1-(dirtInv/150))), 120, 120 * (dirtInv/150));
    pop();
}

var pauseDiv;
var resumeButton;
var serverSelectButton;
var optionsButton;

function definePauseUI() {
    pauseDiv = createDiv();
    pauseDiv.class("container")
    pauseDiv.id("pauseMenu");
    pauseDiv.style("position", "absolute");
    pauseDiv.style("top", "50%");
    pauseDiv.style("left", "50%");
    pauseDiv.style("transform", "translate(-50%, -50%)");
    pauseDiv.style("display", "none");
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
        gameState = "playing"
    });
    resumeButton.parent(pauseDiv);


    optionsButton = createButton("Options / Settings");
    styleButton(optionsButton);
    optionsButton.mousePressed(() => {
        
    });
    optionsButton.parent(pauseDiv);


    serverSelectButton = createButton("Disconnect");
    styleButton(serverSelectButton);
    serverSelectButton.mousePressed(() => {
        location.reload()
    });
    serverSelectButton.parent(pauseDiv);
}


var player_status_container;

function definePlayerStatusDiv() {
    player_status_container = createDiv();
    player_status_container.id("player_status_container");
    player_status_container.style("position", "absolute");
    player_status_container.style("top", "50%");
    player_status_container.style("left", "50%");
    player_status_container.style("transform", "translate(-50%, -50%)");
    player_status_container.style("display", "none");
    player_status_container.style("width", "30%");
    player_status_container.style("height", "40%");
    player_status_container.style("border", "2px solid black");
    player_status_container.style("border-radius", "10px");
    player_status_container.style("text-align", "center");
    player_status_container.style("padding", "20px");

    let pauseTitle = createP("Paused");
    pauseTitle.style("font-size", "28px");
    pauseTitle.style("font-weight", "bold");
    pauseTitle.style("color", "white");
    pauseTitle.style("text-decoration", "underline");
    pauseTitle.parent(player_status_container);

}

function styleButton(button) {
    button.style("width", "80%");
    button.style("padding", "10px");
    button.style("margin", "10px");
    button.style("font-size", "18px");
    button.style("border-radius", "5px");
    button.style("cursor", "pointer");
    button.style("color", "white");
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
  
  function defineBuildUI() {
    buildDiv = createDiv();
    buildDiv.class("container");
    buildDiv.id("pauseMenu");
    buildDiv.style("position", "absolute");
    buildDiv.style("top", "40%");
    buildDiv.style("left", "90%");
    buildDiv.style("transform", "translate(-50%, -50%)");
    buildDiv.style("display", "none");
    buildDiv.style("width", "10%");
    buildDiv.style("height", "60%");
    buildDiv.style("border", "2px solid black");
    buildDiv.style("border-radius", "10px");
    buildDiv.style("text-align", "center");
    buildDiv.style("padding", "20px");
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
  
  function renderBuildOptions() {
    // Clear any previous content
    buildDiv.html('');
    //console.log(ghostBuild.objName)
    // Create an unordered list to hold build options
    const ul = createElement('ul');
    ul.style('list-style', 'none');
    ul.style('padding', '0');
    ul.style('font-size', '20px');
    ul.style('margin', '0 auto');
    ul.parent(buildDiv);  // Append the list to the build container
    
    buildOptions.forEach(option => {
      const humanKey = keyCodeToHuman(option.key);
      
      // Create a list item for the option and set up a flexbox layout
      const li = createElement('li');
      li.class("buildOption");
      li.style('margin', '15px 0');
      li.style('display', 'flex');
      li.style('align-items', 'center');
      
      // Create an image element for the option
      const img = createImg(option.image, option.type);
      img.style('width', '50px');  // Adjust the size as needed
      img.style('height', '50px');
      img.style('image-rendering', 'pixelated');

      if(ghostBuild.objName == option.type){
        li.style("font-size", "2em")
      }
      img.style('margin-right', '10px');
      
      // Create a text container that shows the key and object type
      const textDiv = createDiv(`${humanKey}: ${option.type}`);
      textDiv.style('flex-grow', '1');
      
      // Append the image and text into the list item
      li.child(img);
      li.child(textDiv);
      
      // Add event listener to trigger ghost build on click
      li.mouseClicked(() => {
        ghostBuild = createObject(option.type, 0, 0, 0, curPlayer.color, " ", " ");
      });
      
      // Append the list item to the unordered list
      ul.child(li);
    });
}