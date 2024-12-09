# AIChess Backend

The backend is built with [Quart](https://quart.palletsprojects.com/en/latest/), a lightweight web framework for Python, to handle API requests and perform web app logic.

## Getting Started

### Prerequisites

- [Python](https://www.python.org/) (version 3.8 or higher)
- [pip](https://pip.pypa.io/en/stable/) (comes pre-installed with Python)
- (Optional) [Virtualenv](https://virtualenv.pypa.io/en/latest/) for managing project dependencies

### Installation and Setup

1. **Clone the Repository**

   In the terminal clone the repository to your local machine:

   ```bash
   git clone https://github.com/AFKabl3/AIChess.git
   cd AIChess/backend

   ```

2. **Set Up Virtual Environment**

   Create a virtual environment:

   ```bash
   python -m venv venv
   ```

   or

   ```bash
   python3 -m venv venv
   ```

   Activate the virtual environment:

   - On **Linux/Mac**:
     ```bash
     source venv/bin/activate
     ```
   - On **Windows**:
     ```powershell
     venv\Scripts\activate
     ```

3. **Install Dependencies**

   Once the virtual environment is active, install the required dependencies using `pip`:

   ```bash
   pip install update
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Stockfish installation**

   Download the binaries for your `OS` from [`https://stockfishchess.org/`](https://stockfishchess.org/download/).

   Extract from the compressed folder only the `stockfish_executable` file.

   Create a folder named `stockfish_binaries` in the backend root directory, and place only the `stockfish_executable` inside it.

5. **Environment Variables**

   Create a file `.env` in the backend root directory to define environment-specific variables:

   - `LLM_API_KEY` contain the `API KEY` of the LLM
   - `STOCKFISH_EXECUTABLE` contain the relative path from
     backend in order to reach the `executable`

   Below are examples of a `.env` file for different `OS`:

   - On **Linux/Mac**:
     ```plain
     LLM_API_KEY=your_secret_key_here
     STOCKFISH_EXECUTABLE=stockfish_binaries/stockfish-executable
     ```
   - On **Windows**:
     ```plain
     LLM_API_KEY=your_secret_key_here
     STOCKFISH_EXECUTABLE=stockfish_binaries\stockfish-executable.exe
     ```

6. **Final backend structure**

   Here the final structure of the backend

   ```plain
   backend/
   ├── .env
   ├── app/
   ├── stockfish_binaries/
   │   └── stockfish-executable
   ```

7. **Start the Quart Development Server**

   Run the Quart application:

   ```bash
   quart run --host 127.0.0.1 --port 5000
   ```

   Once the server is running, the API will be available at [http://localhost:5000](http://localhost:5000).
