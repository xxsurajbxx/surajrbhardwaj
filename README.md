<div style="display: flex; align-items: center; gap: 24px; margin-bottom: 24px;">
  <img src="/assets/profile.jpg" alt="Suraj Rajesh Bhardwaj" width="125" style="border-radius: 50%; border: 2px solid #3f3f46; flex-shrink: 0;">
  <div>
    <h1 style="margin: 0 0 2px 0;">Suraj Rajesh Bhardwaj</h1>
    <div id="header-subtitle">
    <p style="margin: 0 0 2px 0;">Software Engineer — Systems, ML & Quantitative Development</p>
    <p style="margin: 0; padding: 0; color: #71717a; font-size: 0.78rem; line-height: 1.4;">
      <a href="mailto:surajrbhardwaj@yahoo.com" style="color: #60a5fa; text-decoration: none;">surajrbhardwaj@yahoo.com</a> &nbsp;·&nbsp;
      <a href="tel:6096657633" style="color: #60a5fa; text-decoration: none;">(609) 665-7633</a> &nbsp;·&nbsp;
      <a href="https://linkedin.com/in/surajbhardwaj29" style="color: #60a5fa; text-decoration: none;">LinkedIn</a> &nbsp;·&nbsp;
      <a href="https://github.com/xxsurajbxx" style="color: #60a5fa; text-decoration: none;">GitHub</a>
    </p>
    </div>
    <style>@media (max-width: 768px) { #header-subtitle { display: none; } }</style>
  </div>
</div>

---

### Education
* **M.S. Data Science** (Exp. Dec. 2026) | **New Jersey Institute of Technology**
* **B.S. Computer Science** (GPA 3.93) | **New Jersey Institute of Technology**
* **Minors:** Applied Math & Entrepreneurship

---

### Mission Statement & Professional Goals

I am a software engineer working at the intersection of performance-critical systems and quantitative, data-driven decision-making. My interests lie in low-latency C++ programming, distributed systems, and machine learning — with a focus on building software where architectural clarity and raw performance reinforce each other.

* **Systems Engineering:** I have architected a decentralized, multithreaded P2P networking protocol in C++ and conducted research on high-performance parallel state space search on multi-GPU clusters using CUDA and MPI.
* **Quantitative & ML Research:** My work includes building a Monte Carlo blackjack strategy simulator , conducting gait phase analysis for AI-assisted mobility , and exploring LLM-based decision engines.
* **Production Experience:** My background spans software engineering at **Bank of America**, where I optimized regulatory reporting software to reduce compute time by 75% , and data engineering at **Travelers**.

I am seeking opportunities in **Quantitative Development**, **Distributed Systems**, **Systems Engineering**, or **Machine Learning Engineering** — roles where high-level design decisions meet deep, measurable performance optimization.

---

## The Career "Source Code"

* **The Conceptual Hook:** This portfolio is designed as a functional simulation of a macOS-based VS Code interface. Rather than presenting a static resume, I treat my career path, technical experiences, and professional goals as "source code" that the user is encouraged to navigate and explore.

---

## Technical Architecture & Logic

* **The Modern Stack:**
 * **Framework:** Next.js 15 (App Router).
 * **Styling:** Tailwind CSS v4.
 * **Logic & UI:** TypeScript, Lucide React (icons), and `react-resizable-panels`.
* **The "Brain" (Architecture):** The core of the application is a JSON-based Virtual File System (VFS) that acts as the single source of truth for the entire UI.

### Engineering Challenges
* **VFS Synchronization:** A primary hurdle was maintaining constant synchronization between the Sidebar explorer, the Editor tabs, and the Terminal prompt. This was solved through a centralized state management system where a `cd` command in the terminal or a click in the sidebar explorer updates the editor and current directory context simultaneously.
* **Proportional Resizing:** To accurately mimic an IDE, I utilized `react-resizable-panels` to engineer a nested grid system. This ensures that resizing one panel—such as the sidebar—proportionally adjusts the editor and terminal while strictly maintaining minimum usability constraints.

---

## The "Easter Egg" Terminal Guide

The terminal is a fully interactive command-line interface synced with the VFS, providing technical users with a deeper way to engage with my background.

| Command | Action |
| :--- | :--- |
| **`ls`** | Lists the contents of the current virtual directory within the portfolio. |
| **`cd [folder]`** | Changes the active directory context within the project's VFS. |
| **`cat [file]`** | Displays the raw contents of specific project READMEs or bio files directly in the terminal. |
| **`help`** | Displays a list of all currently supported interactive commands. |

> **Technical Note:** The terminal's output is directly linked to the project's JSON-based file system. This ensures that all methods of navigation—whether GUI-based or command-line—reference a single source of truth for data.

---

## Professional Hygiene

* **CI/CD Pipeline:** The repository uses GitHub Actions to automate technical verification on every push. This includes automated linting, type-checking (TypeScript), and build verification to ensure stability and code quality.
* **Conventional Commits:** I adhere to the Conventional Commits standard (e.g., `feat:`, `fix:`, `chore:`) to maintain a professional, readable, and structured changelog.
* **Mobile Strategy:** Recognizing that professional networks are often accessed on mobile, I implemented a "mobile-first" fallback. On small screens, the terminal is hidden, and the sidebar is transformed into a toggleable drawer to prioritize the main editor content.

---

## Getting Started

### Prerequisites
* **Node.js** v18 or later
* **npm**, **yarn**, **pnpm**, or **bun**

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/xxsurajbxx/PortfolioWebsite.git
cd PortfolioWebsite

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

### Production Build

```bash
# Build for production
npm run build

# Run the production server locally
npm run start
```

### Other Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with hot-reload |
| `npm run build` | Compiles and bundles the app for production |
| `npm run start` | Runs the compiled production build |
| `npm run lint` | Runs ESLint across the project |