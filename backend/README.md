# AIChess Backend

The backend is built with [Quart](https://quart.palletsprojects.com/en/latest/), a lightweight web framework for Python, to handle API requests and perform web app logic.

## Getting Started

### Prerequisites
- [Git](https://git-scm.com) (for downloading the project) (needs to be installed if you are using **Windows**)
- [Python](https://www.python.org/) (version 3.8 or higher) (needs to be installed if you are using **Windows**)
- [Pip](https://pip.pypa.io/en/stable/) (pre-installed with Python)
- (Optional) [Virtualenv](https://virtualenv.pypa.io/en/latest/) (for managing project dependencies)


### Installation and Setup

1. **Clone the Repository**

   

   - On **Linux/Mac**:
     - In the terminal clone the repository to your local machine:
         ```bash
         git clone https://github.com/AFKabl3/AIChess.git
         cd AIChess/backend
         ```
   - On **Windows**:
     - In the terminal clone the repository to your local machine:  
         ```powershell
         git clone https://github.com/AFKabl3/AIChess.git
         cd AIChess\backend
         ```


2. **Stockfish installation**

   - Download the binaries for your `OS` from [stockfishchess.org](https://stockfishchess.org).
      Here some direct link:
     - [Stockfish binaries for Linux](https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-ubuntu-x86-64-avx2.tar)
     - [Stockfish binaries for MacOS Intel processor](https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-macos-x86-64-avx2.tar)   
     - [Stockfish binaries for MacOS Apple Silicon](https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-macos-m1-apple-silicon.tar)   
     - [Stockfish binaries for Windows](https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-windows-x86-64-avx2.zip)


   - Once you downloaded the file, create the `stockfish_binaries` folder in the `backend` folder of the project:

     - On **Linux/Mac**:
      ```bash
      cd AIChess/backend
      mkdir stockfish_binaries
      ```
     - On **Windows**:
      ```powershell
      cd AIChess\backend
      mkdir stockfish_binaries
       ```

   - Extract the contents of the previously downloaded compressed file and rename the executable to `executable`.
   On `Windows`, the executable has the extension `.exe`, so after renaming, it should be `executable.exe`.

   - add into the `stockfish_binaries` folder the `executable` file previously renamed



3. **HugginFace API KEY**
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
      - Save the Token and copy the `KEY` generated


4. **Environment Variables**

   Create a file `.env` in the `backend` root directory to define environment-specific variables:

   - `LLM_API_KEY` contain the `KEY` generated in the previous paragraph.
   - `STOCKFISH_EXECUTABLE` contain the relative path from
     backend in order to reach the `executable`

   Below are examples of a `.env` file for different `OS`:

   - On **Linux/Mac**:
     ```plain
     LLM_API_KEY=your_secret_key_here
     STOCKFISH_EXECUTABLE=stockfish_binaries/executable
     ```
   - On **Windows**:
     ```plain
     LLM_API_KEY=your_secret_key_here
     STOCKFISH_EXECUTABLE=stockfish_binaries\executable.exe
     ```


5. **Final backend structure**

   Here the final structure of the backend

   ```plain
   backend/
   ├── .env
   ├── app/
   ├── stockfish_binaries/
   │   └── executable
   ```


6. **Set Up Virtual Environment**

   - Create a virtual environment:
      ```bash
      python -m venv venv
      ```
      or
      ```bash
      python3 -m venv venv
      ```
   - Activate the virtual environment:
       - On **Linux/Mac**:
         ```bash
         source venv/bin/activate
         ```
       - On **Windows**:
         ```powershell
         Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
         ./venv\Scripts\activate
         ```


7. **Install Dependencies**

   Once the virtual environment is active, install the required dependencies using `pip`:

   ```bash
   pip install update
   pip install --upgrade pip
   pip install -r requirements.txt
   ```


8. **Start the Quart Development Server**

   Run the Quart application:

   ```bash
   quart run --host 127.0.0.1 --port 5000
   ```
   Once the server is running, the API will be available at [http://localhost:5000](http://localhost:5000).
