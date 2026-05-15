## The Career "Source Code"

* **The Conceptual Hook:** This portfolio is hosted at [surajrbhardwaj.vercel.app](https://surajrbhardwaj.vercel.app) and is designed as a functional simulation of a macOS-based VS Code interface. Rather than presenting a static resume, I treat my career path, technical experiences, and professional goals as "source code" that the user is encouraged to navigate and explore.

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
git clone [https://github.com/xxsurajbxx/PortfolioWebsite.git](https://github.com/xxsurajbxx/PortfolioWebsite.git)
cd PortfolioWebsite

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
