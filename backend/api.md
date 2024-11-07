# Chess Analysis API Specification

## 1. Evaluate Move Endpoint

- **Endpoint**: `/evaluate_move`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation and a move in UCI notation, then returns an evaluation score and feedback string about the move.

### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.
  - `move` (string, required): The UCI notation of the move to evaluate (e.g., "e2e4").

### Response

- **200 OK**:
  - **Body (JSON)**:
    - `evaluation` (float): Numeric evaluation score for the move.
    - `feedback` (string): Descriptive feedback on the quality of the move.

<details>
<summary>Example Request</summary>

```json
POST /evaluate_move
{
  "fen": "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 2",
  "move": "e7e5"
}
```

</details>

<details>
<summary>Example Response</summary>

```json
{
  "evaluation": -0.3,
  "feedback": "The move is solid but does not improve black's position significantly."
}
```

</details>

## 2. Answer Chess Question Endpoint

- **Endpoint**: `/answer_question`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation and a question about the board, then returns an answer.

### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.
  - `question` (string, required): The question regarding the position (e.g., "What is the best move for white?").

### Response

- **200 OK**:
  - **Body (JSON)**:
    - `answer` (string): Answer to the question based on the provided board state.

<details>
<summary>Example Request</summary>

```json
POST /answer_question
{
  "fen": "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 2",
  "question": "What can i do to improve my pawn structure in this state?"
}
```

</details>

<details>
<summary>Example Response</summary>

```json
{
  "answer": "Try to ensure the pawns defend eachother, and don't stack pawns."
}
```

</details>

## 3. Get Suggested Move Endpoint

- **Endpoint**: `/suggest_move`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation and returns the suggested move in UCI notation based on the position.

### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.

### Response

- **200 OK**:
  - **Body (JSON)**:
    - `move` (string): The best move in UCI notation.

<details>
<summary>Example Request</summary>

```json
POST /suggest_move
{
  "fen": "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 2"
}
```

</details>

<details>
<summary>Example Response</summary>

```json
{
  "move": "Nf6"
}
```

</details>

## 4. Get Suggested Move with Explanation Endpoint

- **Endpoint**: `/suggest_move_with_explanation`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation and returns the suggested move in UCI notation, along with a textual explanation for the move.

### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.

### Response

- **200 OK**:
  - **Body (JSON)**:
    - `move` (string): The best move in UCI notation.
    - `explanation` (string): Explanation for why this move is suggested.

<details>
<summary>Example Request</summary>

```json
POST /suggest_move_with_explanation
{
  "fen": "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 2"
}
```

</details>

<details>
<summary>Example Response</summary>

```json
{
  "move": "Nf6",
  "explanation": "Nf6 develops a knight to a natural square, supporting the center and preparing for castling."
}
```

</details>
