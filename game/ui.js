

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

function renderLinks() {
  if (linksRendered) return; // Prevent duplicate rendering

  // Parent container for links (Bottom Right)
  linkContainer = createDiv();
  linkContainer.style("position", "fixed");
  linkContainer.style("bottom", "10px");
  linkContainer.style("right", "10px");
  linkContainer.style("display", "flex");
  linkContainer.style("flex-direction", "column");
  linkContainer.style("align-items", "flex-end");
  linkContainer.style("gap", "10px");
  linkContainer.style("z-index", "1000");

  // Create individual links
  createLinkItem(linkContainer, "Itch.io", "https://itch.io/magentaautumn", "🔗");
  createLinkItem(linkContainer, "GitHub", "https://github.com/PolyPixels", "🐙");
  createLinkItem(linkContainer, "Discord", "https://discord.com/", "💬");

  // Parent container for settings (Bottom Left)
  settingsContainer = createDiv();
  settingsContainer.style("position", "fixed");
  settingsContainer.style("bottom", "10px");
  settingsContainer.style("left", "10px");
  settingsContainer.style("z-index", "1000");

  // Create settings button
  let settingsButton = createButton("⚙️ Settings");
  settingsButton.style("padding", "10px 15px");
  settingsButton.style("font-size", "16px");
  settingsButton.style("border", "none");
  settingsButton.style("border-radius", "5px");
  settingsButton.style("background-color", "#555");
  settingsButton.style("color", "white");
  settingsButton.style("cursor", "pointer");
  settingsButton.mousePressed(() => openSettings());

  settingsButton.parent(settingsContainer);

  // Append elements to body
  linkContainer.parent(document.body);
  settingsContainer.parent(document.body);

  linksRendered = true; // Set flag to true
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
              ghostBuild = new Trap(0, 0, 0, 10, 0, { r: 255, g: 255, b: 255 }, " ");
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
    .then(data => {
      callback(data);
    })
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


  // Disable pointer events to prevent any interactions
          serverEntry.style("pointer-events", data.status === "Online" ?"all" : "none");

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


  
  //back to server selection button
  race_back_button.innerHTML = "Go Back"
  race_back_button.style("position", "absolute");
  race_back_button.style("top", "30dvw");
  race_back_button.mousePressed(()=>{
    console.log("pressed")
    hideRaceSelect()
    gameState = "initial"
  })

  race_back_button.show()
  race_back_button.parent(raceContainer)

  nameInput.show();
  goButton.show();
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
  raceContainer.style("padding", "20px");
  raceContainer.style("border-radius", "10px");
  // ---------------------------------------------------
  //  Create cards for each race (with responsive sizing)
  // ---------------------------------------------------
  races.forEach((raceName, i) => {
    let card = createDiv();
    card.class("raceCard");
    card.style("display", "flex");
    card.style("flex-direction", "column");
    card.style("align-items", "center");

    // Responsive card width: based on canvas width, constrained between 150 and 300px
    let cardWidth = constrain(width * 0.15, 150, 300);
    card.style("width", cardWidth + "px");

    card.style("background-color", "#404040");
    card.style("border", "3px solid #fff");
    card.style("border-radius", "10px");
    card.style("padding", "15px");
    card.style("cursor", "pointer");
    card.style("transition", "transform 0.2s, background-color 0.2s, box-shadow 0.2s");
    card.selected = false; // custom property for selection

    // Create an image element for the race
    let raceImgPath = `images/characters/${raceName}/${raceName}_portrait.png`;
    let raceImg = createImg(raceImgPath, `${raceName} image`);
    raceImg.style("max-width", "10dvw");
    raceImg.style("height", "10dvh");
    raceImg.parent(card);

     // Race stats label with responsive font-size and right alignment
      let raceStatsLbl = createP("health : 20");
      raceStatsLbl.style("color", "#fff");
      raceStatsLbl.style("font-size", "calc(0.5vw + 12px)");
      raceStatsLbl.style("font-weight", "bold");
      raceStatsLbl.style("margin", "0px 0 0 0");
      // Use flex alignment override to push the element to the right
      raceStatsLbl.style("align-self", "flex-end");
      raceStatsLbl.style("text-align", "right");
      raceStatsLbl.parent(card);


    // Race label with responsive font-size
    let raceLbl = createP(raceName);
    raceLbl.style("color", "#fff");
    raceLbl.style("font-size", "calc(0.5vw + 16px)");
    raceLbl.style("font-weight", "bold");
    raceLbl.style("margin", "10px 0 0 0");
    raceLbl.style("text-align", "center");
    raceLbl.parent(card);

    // Hover effect: subtle scale & shadow
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

    // On click: deselect other cards and select this one
    card.mousePressed(() => {
      raceButtons.forEach((c) => {
        c.selected = false;
        c.style("background-color", "#404040");
      });
      card.selected = true;
      card.style("background-color", "#4CAF50");
      raceSelected = true;
      // Assume curPlayer and a mapping for races exist
      curPlayer.race = i;
      console.log("Race selected:", races[i]);
    });

    // Hide initially (shown only in certain states)
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
  goButton.style("background-color", "#2196F3");
  goButton.style("color", "#fff");
  goButton.style("border", "none");
  goButton.style("border-radius", "8px");
  goButton.style("padding", "10px 20px");

  goButton.style("margin-left", "20px");
  goButton.style("cursor", "pointer");
  goButton.style("transition", "background-color 0.2s, transform 0.2s");

  goButton.mouseOver(() => {
    goButton.style("background-color", "#1e88e5");
    goButton.style("transform", "scale(1.05)");
  });
  goButton.mouseOut(() => {
    goButton.style("background-color", "#2196F3");
    goButton.style("transform", "scale(1)");
  });

  goButton.mousePressed(() => {
      if(!selectedServer) {
          alert("issue with server retry") 
          return
      } 
      if(!raceSelected) {
          alert("Pick a race") 
          return
      }

      if(!nameEntered) {
          alert("pick a name") 
          return
      }

    if(!curPlayer) return
    curPlayer.name = nameInput.value();
    socket.emit("new_player", curPlayer);
    gameState = "playing";
    hideRaceSelect()

    // Clear a small area around the player (example logic)
    for (let y = -5; y < 5; y++) {
      for (let x = -5; x < 5; x++) {
        dig(curPlayer.pos.x + x * TILESIZE, curPlayer.pos.y + y * TILESIZE, 1);
      }
    }
    dirtInv = 0;
  });
}