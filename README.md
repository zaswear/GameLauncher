# 🚀 What To Play?

A multi-tool web application designed for gamers to discover new games and make decisions. Built with vanilla JavaScript, Vercel Serverless Functions, and the RAWG.io API.

This project is a portal that hosts three distinct, powerful tools for gamers.

## ✨ Features

### 🧠 1. Game-Match
* **Concept**: A recommendation engine that acts like a "game sommelier".
* **Functionality**: Users input up to three of their favorite games. The backend analyzes the genres and tags of these games to create a unique "taste profile" and then recommends a new, highly-rated game that matches this profile.

### ⏳ 2. Gaming Time Machine
* **Concept**: A nostalgic journey through the history of gaming.
* **Functionality**: Users can select any year from a dropdown menu. The application then fetches and displays the top-rated games released in that specific year, offering a "time capsule" of what was great back then.

### 🎮 3. Co-op Decider
* **Concept**: A simple tool to solve the age-old problem of "what should we play tonight?".
* **Functionality**: A group of friends selects the gaming platforms they all have in common (e.g., PC and PlayStation). The tool then finds a random, highly-rated co-op or multiplayer game available on all selected platforms and presents it as the "Oracle's choice".

### ✉️ Contact Form
* A secure, backend-powered contact form that allows users to send an email without exposing the recipient's address.

## 🛠️ Tech Stack

* **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ESM)
* **Backend**: Vercel Serverless Functions (Node.js)
* **API**: [RAWG.io API](https://rawg.io/apidocs)
* **Email**: [Nodemailer](https://nodemailer.com/) (for the contact form)
* **Deployment**: [Vercel](https://vercel.com/)

## ⚙️ Setup and Configuration

To run this project, you need to set up the following environment variables in your Vercel project settings:

| Name | Value |
| :--- | :--- |
| `RAWG_API_KEY` | Your API key from RAWG.io. |
| `GMAIL_USER` | Your full Gmail address for the contact form. |
| `GMAIL_APP_PASSWORD` | A 16-character Google App Password for Nodemailer. |

## 📁 API Endpoints

* **/api/get-game-match**: Powers the Game-Match tool.
* **/api/get-games-by-year**: Powers the Gaming Time Machine.
* **/api/get-co-op-game**: Powers the Co-op Decider.
* **/api/getGameDetails**: Fetches full details for a specific game (used by modals).
* **/api/sendEmail**: Handles contact form submissions.