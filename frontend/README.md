# AIChess Frontend

The client is built with [Vite](https://vitejs.dev/), a frontend build tool and development server supporting hot reload.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://www.npmjs.com/)

### Installation and Setup

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open the browser and navigate to [http://localhost:5173](http://localhost:5173). Alternatively, you can use the shortcuts provided by Vite to open the browser.

Note: See `/example` and [`main.jsx`](src/main.jsx) for a simple example for a simple demonstration of routing.

#### Environment Variables

Environment variables for the frontend should be defined in a `.env` file at the root of the frontend folder. Currently only this following environment variable is used:

- `VITE_API_BASE_ADDRESS`: The URL of the backend API (e.g. http://localhost:5000/ for local development)

## Structure

The project is structured as follows:

- `public/`: Static files that are served as-is
- `src/`: Source files
  - `api/`: API interface
  - `assets/`: Assets such as images, styles, etc.
  - `components/`: Reusable components
  - `pages/`: Pages
