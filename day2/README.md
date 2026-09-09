# TaskFlow

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

TaskFlow is a React task-management application built with Vite. It provides a simple interface for creating and organizing personal tasks by priority and completion status.

## Features

- View all tasks on the home page
- Add tasks with a title, description, and priority
- Mark tasks as completed or incomplete
- Open a task to view its details
- Edit or delete existing tasks
- Persist tasks in the browser with `localStorage`

## Routes

| Route        | Description                             |
| ------------ | --------------------------------------- |
| `/`          | Displays the task list                  |
| `/add`       | Opens the add-task form                 |
| `/tasks/:id` | Shows task details and editing controls |

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- ESLint

## Getting Started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build locally
npm run lint     # Check the project with ESLint
```

## Project Structure

```text
src/
├── components/       # Reusable task UI components
├── context/           # Shared task state and localStorage logic
├── pages/             # Home, add-task, and task-details views
├── App.jsx            # Routing and application layout
└── main.jsx           # React application entry point
```

There is no backend in this project. Task data is stored locally in the browser, so it is tied to the current browser and origin.
