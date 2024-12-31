# AIChess Backend

The backend is built with [Quart](https://quart.palletsprojects.com/en/latest/), a lightweight web framework for Python, to handle API requests and perform web app logic.

## Getting Started

### Prerequisites

- [Python](https://www.python.org/) (version 3.8 or higher) (needs to be installed if you are using **Windows**)
- [Pip](https://pip.pypa.io/en/stable/) (pre-installed with Python)
- (Optional) [Virtualenv](https://virtualenv.pypa.io/en/latest/) (for managing project dependencies)

### Installation and Setup

1. **Stockfish installation**

   - Download the binaries for your `OS` from [stockfishchess.org](https://stockfishchess.org).
     Here some direct link:

     - [Stockfish binaries for Linux](https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-ubuntu-x86-64-avx2.tar)
     - [Stockfish binaries for MacOS Intel processor](https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-macos-x86-64-avx2.tar)
     - [Stockfish binaries for MacOS Apple Silicon](https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-macos-m1-apple-silicon.tar)
     - [Stockfish binaries for Windows](https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-windows-x86-64-avx2.zip)
   - Once you downloaded the file, create the `stockfish_binaries` folder in the `backend` folder of the project.
    Open your `terminal` (`powershell` for **Windows**) and go to the project `AIChess` folder:

     - On **Linux/Mac** in the `backend` folder:

     ```bash
     mkdir backend/stockfish_binaries
     ```
     - On **Windows** in the `backend` folder:

     ```powershell
     mkdir backend\stockfish_binaries
     ```
   - Extract the contents of the previously downloaded compressed file and __RENAME__ the executable to `executable`.
     On `Windows`, the `executable` will have the `.exe` extension. After renaming, it should be `executable.exe`.
   - __ADD__ into the `stockfish_binaries` folder the `executable` file previously renamed
1. **HugginFace API KEY**

   - go to [`huggingface.co`](https://huggingface.co/) and create an account. Follow the following link: [Hugginface registration](https://huggingface.co/join)
   - Create your `Access Token` following these simple steps:
     - Open this link: [Create your access Token](https://huggingface.co/settings/tokens)
     - Click the button `Create new Token`
     - Name the `Token` as `AIChess`
     - Check the following settings:
       - Under `Repositories`:
         - Read access to contents of all repos under your personal namespace
         - Read access to contents of all public gated repos you can access
       - Under `Inference`:
         - Make calls to the serverless Inference API
         - Manage Inference Endpoints
       - Under `Collections`:
         - Read access to all collections under your personal namespace
       - Under `Billing`:
         - Read access to your billing usage and know if a payment method is set
   - __SAVE__ the `Token` and __COPY__ the generated `KEY`
2. **Environment Variables**

   Create a file `.env` in the `backend` root directory to define environment-specific variables:

   - `LLM_API_KEY` contain the `KEY` generated in the previous paragraph.
   - `STOCKFISH_EXECUTABLE` contain the relative path from
     backend in order to reach the `executable`

   Command line code to generate the `.env` file for different `OS`. Open your `terminal` (`powershell` for **Windows**) and go to the project `AIChess` folder:

   - On **Linux/Mac**:
     - In `LLM_API_KEY`, __REPLACE__ `your_secret_key_here` with the `API Key` you previously __CREATED__ on [Huggingface](https://huggingface.co/)

       ```bash
       rm -fr ./backend/.env; echo "LLM_API_KEY=your_secret_key_here" >> ./backend/.env; echo "STOCKFISH_EXECUTABLE=stockfish_binaries/executable" >> ./backend/.env; cat ./backend/.env
       ```
     - `.env` result in the terminal:

       ```plain
       LLM_API_KEY=your_secret_key_here
       STOCKFISH_EXECUTABLE=stockfish_binaries/executable
       ```
   - On **Windows**:
     - In `LLM_API_KEY`, __REPLACE__ `your_secret_key_here` with the `API Key` you previously __CREATED__ on [Huggingface](https://huggingface.co/)
       ```powershell
       rm -Force .\backend\.env; New-Item -Path ".\backend" -Name ".env" -ItemType "file"; "LLM_API_KEY=your_secret_key_here" | Out-File -FilePath .\backend\.env; "STOCKFISH_EXECUTABLE=stockfish_binaries\executable.exe" | Out-File -FilePath .\backend\.env -Append; cat .\backend\.env
       ```
     - `.env` result in the terminal:
       ```plain
       LLM_API_KEY=your_secret_key_here
       STOCKFISH_EXECUTABLE=stockfish_binaries\executable.exe
       ```
3. **Final backend structure**

   Here the final structure of the backend

   ```plain
   backend/
   ├── app/
   ├── venv/
   ├── .env
   ├── stockfish_binaries/
   │   └── executable
   │ 
   ```
4. **Set Up Virtual Environment**

   - Create a virtual environment.
      Open your `terminal` (`powershell` for **Windows**) and go to the project `AIChess` folder:

     ```bash
     cd backend; python -m venv venv
     ```
     or

     ```bash
     cd backend; python3 -m venv venv
     ```
   - Activate the virtual environment:

     - On **Linux/Mac**:
       ```bash
       source venv/bin/activate
       ```
     - On **Windows**:
       - Only the __FIRST__ time:
         ```powershell
         Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser; ./venv\Scripts\activate
         ```
       - Normal usage:
         ```powershell
         ./venv\Scripts\activate
         ```
1. **Install Dependencies (only the FIRST time)**

   Once the virtual environment is active, install the required dependencies using `pip`:

   ```bash
   pip install update; pip install --upgrade pip; pip install -r requirements.txt
   ```
2. **Start the Quart Development Server**

   Run the Quart application:

   ```bash
   quart run --host 127.0.0.1 --port 5000
   ```
   Once the server is running, the API will be available at your __localhost__:
       [http://127.0.0.1:5000](http://127.0.0.1:5000).
