# AIChess Frontend

The client is built with [Vite](https://vitejs.dev/), a frontend build tool and development server supporting hot reload.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://www.npmjs.com/)

### Installation and Setup

0. **Preliminar Step**
   Open your `terminal` (`powershell` in **Windows**) and go to the project `AIChess` folder:

   ```bash
   cd frontend
   ```
1. **Install Dependencies (Only the FIRST time)**
   In the `terminal` (`powershell` in **Windows**) execute the following code:

   ```bash
   npm install
   ```
2. **Environment Variables (Only the FIRST time)**
   Environment variables for the frontend should be defined in a `.env` file at the root of the frontend folder. Currently only this following environment variable is used:

   - `VITE_API_BASE_ADDRESS`: The URL of the backend API (e.g. http://localhost:5000/ for local development)

  In the `terminal` (`powershell` in **Windows**) execute the following code to create the `.env`:

- On **Linux/Mac**:

  - Command
    ```bash
    rm -fr .env; echo "VITE_API_BASE_ADDRESS=http://127.0.0.1:5000/" >> .env; cat .env
    ``
    ```
- On **Windows**:

  ```powershell
  rm -Force .env; New-Item -Path "." -Name ".env" -ItemType "file"; "VITE_API_BASE_ADDRESS=http://127.0.0.1:5000/" | Out-File -FilePath .env; cat .env
  ```

  `.env` result in the terminal (`powershell` in **Windows**):

```plain
  VITE_API_BASE_ADDRESS=http://127.0.0.1:5000/
```

3. **Start the development server**
   In the `terminal` (`powershell` in **Windows**) execute the following code:

   ```bash
   npm run dev
   ```
4. Open the browser and navigate to [http://localhost:5173](http://localhost:5173). Alternatively, you can use the shortcuts provided by Vite to open the browser.

Note: See `/example` and [`main.jsx`](src/main.jsx) for a simple example for a simple demonstration of routing.

## Structure

The project is structured as follows:

- use this command:
  ```bash
  tree
  ```
- the result in the `terminal` (`powershell` in **Windows**) should be like this:
  ```plain
  frontend/
  ├── public/ (Static files that are served as-is)
  ├── src/ (Source files)
  │   ├── api/ (API interface)
  │   ├── assets/ (Assets such as images, styles, etc.)
  │   ├── components/ (Reusable components)
  │   └── pages/ (Pages)  
  ├── .env
  │ 
  ```
