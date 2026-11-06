
# 🎮 Lands of Nameless King

An interactive, browser-based logic puzzle game developed using **HTML, CSS, and JavaScript** as part of a Web Programming assignment.

The game challenges players to divide a grid into properties while following specific rules, combining logical thinking, strategy, and problem-solving.

## 🚀 Live Demo

🎮 **[Play the Game](https://YOUR-USERNAME.github.io/lands-of-nameless-king/)**

> Replace `YOUR-USERNAME` with your GitHub username.

## ✨ Features

- 🎯 **Three Difficulty Levels:** Easy (5×5), Medium (7×7), and Hard (10×10)
- 🖱️ **Interactive Grid:** Build and remove walls using mouse clicks and dragging
- ✅ **Real-Time Validation:** Detects invalid moves and highlights errors
- ⏱️ **Game Timer:** Tracks the time taken to complete each puzzle
- 💾 **Save & Resume:** Save unfinished games and continue later
- 🏆 **Leaderboard:** Records completion times for each difficulty level
- 🎉 **Win Detection:** Automatically identifies successfully completed puzzles

## 🛠️ Tech Stack

- **HTML5** – Game structure and interface
- **CSS3** – Styling and visual design
- **JavaScript** – Game logic, DOM manipulation, event handling, and validation
- **Local Storage** – Saving game progress and leaderboard records

## 🎲 How to Play

The goal is to divide the grid into valid properties by following these rules:

1. Every numbered house must have a property containing exactly that many cells, including the house itself.
2. Each property must contain exactly one house.
3. Properties must be connected horizontally or vertically.
4. Different properties cannot touch horizontally or vertically.
5. All wall cells must form one connected region.
6. Walls cannot form a 2×2 square.

### Controls

| Action | Control |
|--------|---------|
| Build or remove walls | Left-click |
| Draw multiple walls | Left-click and drag |
| Mark or unmark property cells | Right-click |
| Save progress | Save Game button |
| Resume a game | Load button |

## 🧠 Technical Implementation

The game uses several core JavaScript concepts:

- **DOM Manipulation:** Dynamically generates and updates puzzle grids.
- **Event Handling:** Processes mouse interactions and button clicks.
- **Flood-Fill Algorithm:** Identifies connected regions for puzzle validation.
- **2D Arrays:** Represents the grid, houses, walls, and properties.
- **Local Storage:** Persists saved games and leaderboard data.
- **Timers:** Tracks player completion times.

## 📂 Project Structure

```text
lands-of-nameless-king/
│
├── index.html
├── landsOfNamelessKings.css
├── landsOfNamelessKings.js
├── Land of the Nameless King.png
└── README.md
```

## 💻 Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/lands-of-nameless-king.git
   ```

2. Open the project folder.
3. Open `index.html` in a web browser.
4. Enter your name, select a difficulty level, and start playing!

No additional dependencies or installation required.

## 📌 Notes

- Saved games and leaderboard records are stored locally in the browser.
- Leaderboard scores are specific to each browser, not shared globally.
- The game is primarily designed for desktop mouse controls.

## 📚 What I Learned

This project helped me strengthen my understanding of:

- JavaScript programming and problem-solving
- DOM manipulation and event-driven programming
- Algorithm implementation and grid-based validation
- Browser-based data persistence
- Frontend web development

## 👨‍💻 Author

Developed as part of a **Web Programming Assignment**.

---

⭐ If you found this project interesting, consider giving the repository a star!
