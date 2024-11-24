# AIChess Backend

The backend is built with [Flask](https://flask.palletsprojects.com/en/stable/), a lightweight web framework for Python, to handle API requests and perform web app logic.

## Getting Started

### Prerequisites

- [Python](https://www.python.org/) (version 3.8 or higher)
- [pip](https://pip.pypa.io/en/stable/) (comes pre-installed with Python)
- (Optional) [Virtualenv](https://virtualenv.pypa.io/en/latest/) for managing project dependencies

### Installation and Setup

1. **Clone the Repository**

   Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd AIChess/backend

   

2. **Set Up Virtual Environment**

   Create a virtual environment:
   ```bash
   python -m venv venv
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
   pip install -r requirements.txt
   ```

4. **Environment Variables**

   Create a `.env` file in the backend root directory to define environment-specific variables. Below is an example `.env` file:
   ```plaintext
   SECRET_KEY=your_secret_key_here
   ```

5. **Initialize the `FLASK_APP` Environment Variable**

   Set the `FLASK_APP` variable in the terminal:

   - **Windows (PowerShell)**:
     ```powershell
     $env:FLASK_APP = "run:app"
     ```

   - **Linux/Mac**:
     ```bash
     export FLASK_APP=run:app
     ```

6. **Start the Flask Development Server**

   Run the Flask application:
   ```bash
   flask run
   ```

   Once the server is running, the API will be available at [http://localhost:5000](http://localhost:5000).
