# Rune Clicker Game

This project is a simple clicker game built with Angular, inspired by classic Old School RPG skills.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.2.8.

## Prerequisites

* Node.js (Check Angular documentation for compatible versions)
* Angular CLI (`npm install -g @angular/cli`)

## Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/](https://github.com/)<your-username>/rune-clicker-game.git
    ```
2.  Navigate into the project directory:
    ```bash
    cd rune-clicker-game
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

## Deployment to GitHub Pages

This project can be deployed to GitHub Pages using the `angular-cli-ghpages` package.

1.  **Install angular-cli-ghpages (if you haven't already):**
    ```bash
    npm install -D angular-cli-ghpages
    ```

2.  **Build for GitHub Pages:**
    Replace `<your-repo-name>` with your actual GitHub repository name (e.g., `rune-clicker-game`).
    ```bash
    ng build --configuration production --base-href /<your-repo-name>/
    ```
    *Example:*
    ```bash
    ng build --configuration production --base-href /rune-clicker-game/
    ```

3.  **Deploy the build:**
    This command pushes the contents of the browser build output directory (`dist/rune-clicker-game/browser`) to the `gh-pages` branch of your repository.
    ```bash
    npx angular-cli-ghpages --dir=dist/rune-clicker-game/browser
    ```

4.  **Configure GitHub Repository Settings:**
    * Go to your repository settings on GitHub.
    * Navigate to the "Pages" section.
    * Under "Build and deployment", ensure the source is "Deploy from a branch".
    * Select the `gh-pages` branch and the `/ (root)` folder.
    * Save the changes. Your site should be live after a minute or two.
