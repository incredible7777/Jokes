# 01jokes: Full-Stack JavaScript Learning Project

`01jokes` is a small learning project that demonstrates how a JavaScript frontend and backend communicate:

The React frontend sends an HTTP request to an Express backend, the backend returns joke data as JSON, and the frontend renders that data for the user.

> **Learning project:** The jokes are stored in a JavaScript array in memory. There is no database, authentication, or production deployment configuration.

---

## Contents

- [Repository layout](#repository-layout)
- [Technology overview](#technology-overview)
- [Project overview](#project-overview)
- [How the frontend and backend communicate](#how-the-frontend-and-backend-communicate)
- [Core concepts in depth](#core-concepts-in-depth)
- [Install and run](#install-and-run)
- [Ports and API proxy configuration](#ports-and-api-proxy-configuration)
- [Troubleshooting](#troubleshooting)
- [Possible next steps](#possible-next-steps)

---

## Project layout

```text
.
├── README.md
├── backend/
│   ├── index.js
│   └── package.json
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

Each application has its own `package.json`. Install dependencies from the folder for the application you are running.

---

## Technology overview

### JavaScript and Node.js

JavaScript is the programming language used by both projects. In a browser it can control the page and respond to user actions. **Node.js** is a runtime that lets JavaScript run outside the browser, including on a server.

In this repository Node.js runs the Express backend programs. The backend can listen for network requests and send responses to browsers or other applications.

### Express

**Express** is a web framework for Node.js. It provides a convenient way to define URL routes, receive HTTP requests, and send responses.

For example, `app.get("/jokes", handler)` tells Express what to do when a client sends a `GET` request to `/jokes`.

### React

**React** is a library for building browser user interfaces from components. The jokes frontend has an `App` component. It stores fetched jokes and the selected joke in component state, then React updates the displayed UI when that state changes.

### Vite

**Vite** provides the frontend development server and production build tool. It serves the app during development, supports fast refresh while editing, and bundles the frontend when running `npm run build`.

The Vite configuration in this project also forwards API requests to the backend during development.

### Axios

**Axios** is an HTTP client library. The React app calls `axios.get("/api/jokes")` to request the jokes data from the backend.

### Tailwind CSS

**Tailwind CSS** is a utility-first CSS framework. The frontend uses utility classes in JSX, such as `flex`, `items-center`, and `bg-gray-300`, to style its elements. The Vite Tailwind plugin is configured in `vite.config.js`, and `src/index.css` imports Tailwind.

### npm, `package.json`, and Nodemon

**npm** installs JavaScript packages and runs project scripts. Each `package.json` declares the packages and commands for its application.

The backend uses **Nodemon** for development. Running `npm run dev` starts the server and restarts it when backend files change.

The jokes backend also uses **dotenv**. `dotenv.config()` loads variables from a `.env` file into `process.env`; this project uses `process.env.PORT` to optionally configure its listening port.

---

## Project overview

The project contains a browser app and its API server:

- `backend/` — Express server and in-memory joke data.
- `frontend/` — React UI, built and served by Vite.

### Jokes backend and data model

The backend is implemented in `backend/index.js`. It loads environment variables with dotenv, creates an Express app, and listens on `process.env.PORT` or port **4000** if `PORT` is not set.

Its routes are:

| Method | URL | Response |
|---|---|---|
| `GET` | `/` | A welcome message in HTML |
| `GET` | `/jokes` | The array of jokes as JSON |

Each joke is a JavaScript object with the following fields:

| Field | Meaning |
|---|---|
| `text` | A combined text version of the joke |
| `question` | The setup/question shown by the UI |
| `answer` | The punchline shown by the UI |
| `author` | The attributed author |
| `created` | The date string stored with the joke |
| `tags` | An array of topic labels |
| `rating` | A numeric rating value |

An array is useful for holding a collection of records; an object groups the named properties belonging to one record. The `/jokes` route sends this array to the client. Express serializes it as JSON for the HTTP response.

The data currently exists only in server memory. It is reset to the source-code values when the process restarts, and it cannot be edited permanently through an API.

### React frontend

The main UI is in `frontend/src/App.jsx`. It is a React function component that:

1. Starts with an empty jokes array and a current index of `0`.
2. Requests jokes after the component is mounted.
3. Saves the response in React state.
4. Displays the total number of jokes and the selected question and answer.
5. Advances to the next joke when the button is clicked.

The component uses two React Hooks:

```jsx
const [jokes, setJokes] = useState([]);
const [index, setIndex] = useState(0);
```

`useState` gives the component a value and a setter. Calling a setter schedules a re-render so the interface reflects the latest state. `jokes` holds the list returned by the API, while `index` identifies which item to show.

The data request is made in `useEffect`:

```jsx
useEffect(() => {
  axios.get("/api/jokes")
    .then((response) => {
      setJokes(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
}, []);
```

An empty dependency array means this effect is intended to run when the component mounts, rather than after every render. The HTTP request is asynchronous: the component can render before the response arrives, which is why it starts with an empty array and only renders joke details when jokes are available. If the request fails, the current code logs the error in the browser console.

The `Next Joke` button is disabled when no jokes have been loaded. Its handler uses the current index and the remainder (`%`) operator:

```jsx
setIndex((previousIndex) => (previousIndex + 1) % jokes.length);
```

The updater function receives the most recent index. Modulo makes the index return to `0` after it reaches the final item, creating a repeating cycle.

### Frontend entry point and HTML

`src/main.jsx` imports the CSS and `App` component, finds the element with `id="root"` in `index.html`, and asks React to render into it. `StrictMode` helps highlight certain issues during development; it does not create a visible UI element.

`index.html` is the HTML shell served by Vite. Its `<div id="root"></div>` is the mount point that React fills with the app.

### Styling and linting

`src/index.css` imports Tailwind CSS. The UI's styling is mostly expressed with Tailwind utility class names in `App.jsx`.

`eslint.config.js` configures ESLint with JavaScript recommendations and React Hooks/refresh rules. Run the frontend lint script with `npm run lint` from the frontend folder.

---

## How the frontend and backend communicate

The app uses an HTTP API boundary between the browser UI and the server:

```text
React App
  └─ Axios GET /api/jokes
       └─ Vite development proxy removes the /api prefix
            └─ Express GET /jokes
                 └─ JSON array of jokes
                      └─ Axios response.data
                           └─ React state -> rendered question and answer
```

In the browser, the frontend requests `/api/jokes`. The `server.proxy` rule in `vite.config.js` matches requests starting with `/api`, forwards them to its configured target, and rewrites the path by removing `/api`. Therefore the backend receives `/jokes`, which matches the Express route.

The proxy is configured for the Vite **development server**. It is not a production API server or a replacement for deploying/configuring the backend.

---

## Core concepts in depth

### 1. Client, server, and the request/response cycle

The **client** is the browser running the React app. The **server** is the Node.js process running Express. They communicate through HTTP:

1. The client sends a request containing a method and URL.
2. Express matches the method and path to a registered route.
3. The route handler runs.
4. The server sends a status and response body.
5. The browser receives the response; Axios exposes the parsed body as `response.data`.

The client and server are separate programs. A React component does not directly read a variable in the backend. It must request data through an API.

### 2. HTTP methods and routes

HTTP methods describe the intended operation. This repository mainly demonstrates `GET`, which is conventionally used to retrieve data. Other common methods are:

- `POST` to create or submit data.
- `PUT` or `PATCH` to update data.
- `DELETE` to remove data.

A route combines a method with a path. For example, `GET /jokes` is different from `GET /` and from `POST /jokes`. Express route handlers determine what response is sent for each matching request.

### 3. API and REST-style resources

An **API** is a defined way for one program to communicate with another. The jokes API exposes the jokes collection at `/jokes`. This is a small REST-style example: the URL names a resource and the HTTP method describes the action.

The frontend's `/api/jokes` URL is a development-facing URL. Vite's proxy maps it to the backend's actual `/jokes` route. The `/api` prefix is not currently registered as part of the Express route.

### 4. JSON

**JSON** (JavaScript Object Notation) is a text format commonly used to transfer structured data over HTTP. Arrays and objects in the backend become JSON in the response. Axios parses a JSON response so the React code can use it as JavaScript values.

For example, a single joke's shape is conceptually:

```json
{
  "question": "How do you comfort a JavaScript bug?",
  "answer": "You console it.",
  "tags": ["javascript"],
  "rating": 1
}
```

The real response is an array containing multiple joke objects.

### 5. React components, state, and rendering

A **component** is a reusable unit of UI. `App` returns JSX, a syntax extension that describes the elements React should render. Expressions inside braces, such as `{jokes.length}`, insert JavaScript values into the UI.

**State** is data that can change while a component is being used. When a state setter is called, React renders the component again using the new state. This is why setting the fetched jokes or changing the index updates the displayed content without manually editing the DOM.

The condition `jokes.length > 0 && (...)` is conditional rendering: the joke details are included only when there is at least one joke.

### 6. React Hooks and effects

Hooks are functions that let function components use React features:

- `useState` stores component state.
- `useEffect` runs side-effect logic in relation to rendering. Network requests are a typical example.

The effect in this app uses an empty dependency list, so the request is set up for the mount lifecycle. Effects should list reactive values they use when those values affect the effect; this request does not depend on a changing component value.

### 7. Asynchronous HTTP requests and errors

Network requests take time and can fail. Axios returns a Promise, and `.then(...)` handles a successful response while `.catch(...)` handles a rejected request. The current UI logs request errors but does not display an error message to the user. A more complete UI could add loading and error state.

### 8. Development proxy and origins

The frontend development server and backend server use different ports, which makes them different web origins. Browsers apply cross-origin rules to requests between origins. The Vite proxy lets the frontend call a relative `/api/...` URL during development and has Vite forward that request to the backend.

This project uses a path rewrite as well as a proxy: `/api/jokes` becomes `/jokes` before it reaches Express. Both the proxy target port and backend listening port must agree for requests to succeed.

### 9. Modules and ES module syntax

The backend `package.json` files specify `"type": "module"`. This tells Node.js to use ECMAScript module syntax, such as `import express from "express"`, rather than CommonJS `require(...)`.

### 10. Environment variables

The jokes backend uses `process.env.PORT || 4000`. This means it uses the `PORT` environment variable when one is provided, otherwise it defaults to `4000`. `dotenv.config()` loads values from a `.env` file into the process environment for local development.

Environment variables are useful for configuration that differs by environment, such as a port or a database URL. Do not commit real secrets to source control.

### 11. Development server versus production build

`npm run dev` starts Vite's development server, with development features and the configured proxy. `npm run build` creates the frontend's production output in `dist/`; `npm run preview` serves that build locally for preview. These commands do not automatically deploy the backend or configure a production API URL.

---

## Install and run

Use separate terminal windows for the backend and frontend so both processes can remain running.

### 1. Install backend dependencies

```powershell
cd backend
npm install
```

### 2. Start the jokes backend

```powershell
npm run dev
```

By default it listens on `http://localhost:4000`. Test the API directly at `http://localhost:4000/jokes`.

### 3. Install frontend dependencies

In a second terminal:

```powershell
cd frontend
npm install
```

### 4. Start the frontend

```powershell
npm run dev
```

Open the local URL printed by Vite in the terminal. It is commonly `http://localhost:5173`.

### Frontend scripts

Run these from `frontend`:

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

---

## Ports and API proxy configuration

There is an important configuration mismatch in the current source:

- The jokes backend defaults to port **4000** (`process.env.PORT || 4000`).
- The Vite proxy currently targets **port 3000** (`http://localhost:3000`).

As written, the frontend's `/api/jokes` request will not reach the default backend unless something is listening on port 3000. In PowerShell, you can use the current proxy without editing files by setting the backend port in that terminal before starting it:

```powershell
$env:PORT = "3000"
npm run dev
```

Alternatively, change the proxy target in `frontend/vite.config.js` to `http://localhost:4000` so it matches the backend's default. Choose one approach and keep the ports aligned.

After changing proxy configuration, restart the Vite development server. The backend route itself remains `/jokes`; the proxy removes `/api` from the frontend request path.

---

## Troubleshooting

### The frontend shows zero jokes

1. Confirm the backend is running.
2. Open `http://localhost:4000/jokes` directly (or the port you configured) and check for a JSON array.
3. Verify that the Vite proxy target uses the same port as the backend.
4. Check the browser developer console and the terminal running Vite for request errors.

### `npm run dev` says a port is already in use

Another process may already be using that port. Stop the other development server or configure a different port, and make sure the frontend proxy points to the backend's actual port.

### A package cannot be found

Run `npm install` from the relevant folder (`backend` or `frontend`). There is no shared package installation at the project root.

### API path returns not found

The jokes Express server defines `/jokes`, not `/api/jokes`. `/api/jokes` is the URL used by the frontend and is rewritten by Vite's development proxy. When testing the backend directly, use `/jokes`.

---

## Possible next steps

These are learning extensions; they are not features currently implemented:

- Add visible loading and error messages to the React UI.
- Move joke data into a database so changes persist after server restarts.
- Add `POST`, `PUT`/`PATCH`, and `DELETE` routes to create or edit jokes.
- Validate request data before storing it.
- Add API tests for route status codes and response shapes.
- Make the backend and proxy ports configurable in one consistent way.
- Improve the user interface with accessible labels and responsive layouts.
- Add a production deployment setup that serves the frontend and configures the API URL.

---

## Key takeaways

- Node.js runs JavaScript on the server; Express defines HTTP routes.
- React renders the browser UI and uses state to keep displayed data current.
- Axios makes HTTP requests; JSON carries structured data between the client and server.
- Vite serves and builds the frontend and proxies API requests during development.
- The frontend and backend are separate processes and must agree on API paths and ports.
- The backend provides jokes through an API; the React frontend requests and displays them.
