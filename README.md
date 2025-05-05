

# Holes: Martyrs of Dirt


![image](https://github.com/user-attachments/assets/51e3f934-f852-407f-ab33-f05eb352cf80)
## Introduction

**Holes: Martyrs of Dirt** is a 2D multiplayer survival sandbox game where you **explore, build, and survive** in an infinite subterranean world. Team up with friends (or go solo) to dig through pixelated dirt, gather resources, craft tools, and construct underground bases in a procedurally generated landscape. Every tree chopped and every apple eaten is a step closer to survival as you uncover mysteries hidden beneath the soil and behind the forest veil. Inspired by classics like *Minecraft*, *Terraria*, and *Don’t Starve*, Holes offers a **cooperative PvE** experience with charming retro visuals and a focus on **digging and base-building** gameplay.

This repository contains the **client-side game code** for Holes: Martyrs of Dirt. It is the front-end (HTML5/JavaScript, built with [p5.js](https://p5js.org)) that runs in the browser, handling rendering, input, and game logic. The client connects to a separate **backend server** (via WebSockets using [Socket.io](https://socket.io)) which manages world data, multiplayer synchronization, and persistence. The purpose of this repo is to allow developers to run the game locally, understand the codebase, and contribute improvements or new features to the client. *(Note: The server code is maintained in a different repository – see Setup instructions below for the link.)*

## Live Demo – Play Online

You can play **Holes: Martyrs of Dirt** right now in your browser without any setup:

👉 **[Play Holes: Martyrs of Dirt on Itch.io](https://polypikzel.itch.io/holes-game)** – *Launch the game instantly and start digging!*

The live web version is hosted on itch.io and connects to the official game server, so you can experience the full game (with multiplayer) immediately. This is a great way to familiarize yourself with the gameplay before diving into development.

## Getting Started (Running the Game Locally)

If you want to run the Holes client locally for development or testing, follow these steps. **Note:** You’ll need the **backend server** running as well, otherwise the client will not be able to load the world or save progress.

1. **Clone this repository**. Grab the code by running:

   ```bash
   git clone https://github.com/PolyPixels/Holes_Client
   cd Holes_Client
   ```

2. **Set up the backend server**. Holes requires a separate server to handle game logic and data. Clone and run the **Holes Backend Server** (see the server repo for specific instructions). Ensure the server is running locally (for example at `http://localhost:3000` by default) **before** launching the client.
   *🔗 Example: See the [Holes Server Repository](https://github.com/PolyPixels/Holes_server) for installation steps.*

3. **Install client dependencies**. The client is a web application. If this project has a package.json, install the dependencies:

   ```bash
   npm install 
   ```

   *If there is no build process (e.g. if using vanilla JavaScript and p5.js from CDN), you can skip this step.*

4. **Run a local web server for the client**. For security reasons, modern browsers may block certain requests if you just open the HTML file directly (file://). It’s recommended to serve the files via a local server. You can use any simple server. For example:

   * Using **Python 3** (built-in module):

     ```bash
     python3 -m http.server 8000
     ```

     This will serve the files on `http://localhost:8000/` (port 8000).
   * Using **Node.js** with a quick serve tool:

     ```bash
     npx http-server . -p 8000
     ```

     (Assuming you have `http-server` installed or use `npx` to run it without installing globally.)

   Once the server is running, open your browser and go to `http://localhost:8000` (or whichever port you chose). You should see the Holes game loading in your browser.

5. **Connect the client to the server**. The client is configured to look for the game server (by default at `localhost:3000` or a specific URL). Make sure your local server’s address is correctly set in the client configuration (check if there’s a config file or constant for the server URL/port). By default, it might already target `localhost:3000`. If the backend is running on a different host or port, update the client config accordingly.

6. **Play locally**. With both the client and backend server running, you can start a game in your browser. Open the developer console to see debug logs or errors. You can now experiment with the code and see changes in real time. Enjoy digging around in the code (and the dirt)! 🕹️

**Troubleshooting (CORS errors):** If you see errors about **CORS (Cross-Origin Resource Sharing)** or requests being blocked when connecting to the backend, it means the browser is preventing the client (on, say, `localhost:8000`) from calling the server (`localhost:3000`) because they are on different origins. To resolve this:

* **Enable CORS on the server**: The backend should allow the client’s origin. During development, you can enable a wildcard `Access-Control-Allow-Origin: *` or specifically allow `http://localhost:8000`. If using Express.js, consider using the [cors middleware](https://expressjs.com/en/resources/middleware/cors.html) to permit requests from your dev origin.
* **Use the same origin**: An alternative is to serve the client through the backend (so the pages come from the same origin/port as the API), or use a proxy in development to avoid cross-origin calls.
* **Browser workaround**: As a last resort for testing, you can use a browser extension or flag to disable CORS. *Only do this in development!* The proper solution is to configure the server with the right headers.

By ensuring CORS is handled, your local client should communicate with the local server without issues.

## Contributing

We welcome contributions from everyone! 😃 **Holes: Martyrs of Dirt** is an open-ended project, and there's plenty of room for new ideas, bug fixes, and enhancements. To keep things organized and friendly, please take a moment to read our contributing guidelines below.

### 1. Play the Game First (🎮 \~15 minutes)

Before you start coding, we **strongly encourage you to play the game** for at least 15 minutes. This will give you a sense of the core mechanics, current features, and any rough edges. By experiencing the game as a player, you'll be better equipped to suggest meaningful improvements and catch bugs in context. Plus, it's fun! Get a feel for digging, crafting, and surviving in Holes – notice what works well and what could be improved.

### 2. Reporting Issues

If you encounter a bug or have an idea for a new feature/improvement, please open an issue on this repository. Here’s how to make it great:

* **Search existing issues**: Someone might have already reported your bug or suggested your idea. Upvote or comment there instead of duplicating, if applicable.
* **Use a clear title and description**: Summarize the issue in the title (e.g., "Game crashes when digging at map edge") and provide details in the description. Explain *how to reproduce* the problem, what you expected to happen, and what actually happened. For feature requests, describe the problem it solves or the enhancement it brings.
* **Add context**: Include screenshots, error logs, or GIFs of the bug if possible. A picture is worth a thousand words and can help us understand the issue quickly.
* **Be respectful and constructive**: We appreciate all feedback. Keep the tone friendly and focused on the software (e.g., instead of "This sucks," say "It was frustrating when X happened because..."). We're a community, and constructive feedback helps everyone.
* **Label and template**: If the repository has issue templates or labels, use them. For example, mark your issue as a **bug**, **feature request**, etc. This helps maintainers triage and address issues more efficiently.

### 3. Pull Request Guidelines

Ready to dig into the code and contribute? Awesome! To make the pull request (PR) process smooth, please keep in mind:

* **Discuss first for big changes**: For significant feature additions or changes in behavior, it’s a good idea to open an issue or discussion first. This lets us collaborate on the approach and ensure it fits the project vision before you invest a lot of time.
* **Small, focused commits**: Break your work into logical commits with clear messages. Each commit should do one thing (fix a bug, add a feature, etc.) and explain why. This makes it easier to review and to rollback if something goes wrong.
* **Follow the code style**: Try to match the existing code conventions. Indentation, variable naming, and commenting style should be consistent with the code around it. (If the project uses a linter or formatter, make sure to run it.)
* **Write tests if applicable**: If the project has tests (or if you can add some for your new feature), please do! For a game, this might mean ensuring any algorithms or data structures work as expected. At minimum, test your changes in the game thoroughly to avoid regressions.
* **Test your changes in-game**: Fire up a local server and play with your modified client. Does it do what it's supposed to? Any new errors in the console? It's much easier to catch issues *before* submitting a PR.
* **Good PR description**: When opening a pull request, provide a brief description of **what** you changed and **why**. If it fixes an issue, reference it (e.g., "Closes #42"). If your change is visual or functional, consider attaching a screenshot or short video of the change in action.
* **Keep PRs focused**: Avoid "mixed bag" pull requests that combine unrelated changes. For example, don’t refactor the entire rendering engine in the same PR as adding a new item type – split them up. This way, each PR can be reviewed and accepted on its own merits.
* **Be responsive to feedback**: We may review your PR and ask for changes or have questions. This is a normal part of the process. Don’t be discouraged – we really appreciate the contribution! Work with us to get it merged. Once everything looks good, we’ll happily merge your changes into the codebase.

### 4. Join the Community (Discord)

&#x20;*Discord logo icon.* We have an official **Discord server** for *Holes: Martyrs of Dirt* where you can chat with the developers and other players. Join us to discuss ideas, ask questions, report issues in real-time, or just share your epic base builds. It’s a great place to get quick support and stay up-to-date on development progress. **[Click here to join the Holes Discord community](https://discord.gg/4SQGTGhV)**.

*(If the link above doesn’t work, you can find the invite on our website or reach out to us for an updated link.)*

---

Thank you for taking the time to read this README and for your interest in contributing to **Holes: Martyrs of Dirt**. We’re excited to collaborate with fellow developers and players to make the game even better. Every suggestion, issue, and pull request helps us improve. So, happy coding – and happy digging! ⛏️

*– The Holes: Martyrs of Dirt Team*
