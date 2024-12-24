# Chess Analysis API Specification

## Table of Contents

1. [Endpoints](#endpoints)
   - [1. Evaluate Move Endpoint](#1-evaluate-move-endpoint)
   - [2. Answer Chess Question Endpoint](#2-answer-chess-question-endpoint)
   - [3. Get Best Move Endpoint](#3-get-best-move-endpoint)
   - [4. Get Move Suggestion with Evaluation Endpoint](#4-Get-Move-Suggestion-with-Evaluation-Endpoint)
   - [5. Get Bot Move Endpoint](#5-get-bot-move-endpoint)
2. [Error Handling](#error-handling)

## Endpoints

### 1. Evaluate Move Endpoint

- **Endpoint**: `/evaluate_move`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation and a move in UCI notation, then returns an evaluation score and feedback string about the move.

#### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.
  - `move` (string, required): The UCI notation of the move to evaluate (e.g., "e2e4").

#### Response

- **200 OK**:
  - **Body (JSON)**:
    - `player_made_move` (string)
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
  "player_made_move": "w",
  "evaluation": -1.39,
  "feedback": " Moving the b-pawn to b4 is not an advantageous move, as it reduces the mobility of your other pieces and creates a weakness on the b3 square, making it difficult to defend. It also further exposes your king, which could be dangerous in the long run. Generally, early in the game, it's ideal to focus on controlling the center of the board and developing your pieces, rather than shuffling pawns around, which can limit the potential of your game. Rethink your strategy and consider moves that prioritize controlling the center with pieces like your knight and bishop, which will promote a stronger, more developed board state. Look to maintain a more solid, stable position and aim for long-term strength in each move you make."
}
```

</details>

### 2. Answer Chess Question Endpoint

- **Endpoint**: `/answer_question`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation and a question about the board, then returns an answer.

#### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.
  - `question` (string, required): The question regarding the position (e.g., "What is the best move for white?").

#### Response

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

### 3. Get Best Move Endpoint

- **Endpoint**: `/get_best_move`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation and returns the suggested move in UCI notation.

#### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.

#### Response

- **200 OK**:
  - **Body (JSON)**:
    - `current_player` (string)
    - `suggested_move` (string): The best move in UCI notation.

<details>
<summary>Example Request</summary>

```json
POST /get_best_move
{
  "fen": "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 2"
}
```

</details>

<details>
<summary>Example Response</summary>

```json
{
  "current_player": "w",
  "suggested_move": "e2e4"
}
```

</details>

### 4. Get Move Suggestion with Evaluation Endpoint

- **Endpoint**: `/get_move_suggestion_with_evaluation`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation and returns the suggested move in UCI notation, along with a textual explanation for the move..

#### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.

#### Response

- **200 OK**:
  - **Body (JSON)**:
    - `current_player` (string)
    - `suggested_move` (string): The best move in UCI notation.
    - `suggestion` (string): textual descprtion of the suggested move

<details>
<summary>Example Request</summary>

```json
POST /get_move_suggestion_with_evaluation
{
  "fen": "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 2"
}
```

</details>

<details>
<summary>Example Response</summary>

```json
{
  "current_player": "w",
  "suggested_move": "e2e4",
  "suggestion": "Move e4 pairs your pawn with the opponent's, controlling center and opening lines for your pieces to develop. A good start as it aims to establish dominance, seize space and limit Black's options. Value is positive+0.7, signifying an attacking edge with an open game favoring your side. It's the classic starting move for a reason, breaking open the center & allowing you to prepare for castling kingside, and a Bn or Qn jump to f3, while Rb1 moves to d1-c1 line; overall aiming for rapid piece development and an active game ahead."
}
```

</details>

### 5. Get Bot Move Endpoint

- **Endpoint**: `/get_bot_move`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation and an integer value representing the bot's level.

  Return the best move according to the Stockfish and the input depth.

#### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.
  - `skill_level` (int, required): integer value representing the level of the bot

#### Response

- **200 OK**:
  - **Body (JSON)**:
    - `bot_move` (string): bot_move

<details>
<summary>Example Request</summary>

```json
POST /get_bot_move
{
  "fen": "r2qkbnr/pp3ppp/2np4/2p1pb2/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 1",
  "skill_level": 19
}
```

</details>

<details>
<summary>Example Response</summary>

```json
{
  "bot_move": "e4f5"
}
```

</details>

### 5. Get Game status endpoint

- **Endpoint**: `/get_game_status`
- **Method**: `POST`
- **Description**: Accepts a chess board in FEN notation

  Return the explanation of the current game status according to Stockfish evaluation.

#### Request Parameters

- **Body (JSON)**:
  - `fen` (string, required): The FEN string representing the board state.

#### Response

- **200 OK**:
  - **Body (JSON)**:
    - `answer` (string): answer from the LLM concerning the game status

<details>
<summary>Example Request</summary>

```json
POST /get_game_status
{
  "fen": "r2qkbnr/pp3ppp/2np4/2p1pb2/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 1"
}
```

</details>

<details>
<summary>Example Response</summary>

```json
{
  "answer": "The board is balanced, white is winning by a short length"
}
```

</details>

### 6. More explanation endpoint

- **Endpoint**: `/more_explanation`
- **Method**: `POST`
- **Description**: Accepts the previous question and answer

  Return another response from the previous message with more explanation

#### Request Parameters

- **Body (JSON)**:
  - `question` (string, required): The previous question.
  - `first_answer` (string, required): The previous answer

#### Response

- **200 OK**:
  - **Body (JSON)**:
    - `answer` (string): answer from the LLM with more data about the question

<details>
<summary>Example Request</summary>

```json
POST /more_explanation
{
  "question": "What can i do to improve my pawn structure in this state?",
  "first_answer": "Try to ensure the pawns defend eachother, and don't stack pawns."
}
```

</details>

<details>
<summary>Example Response</summary>

```json
{
  "answer": "Move the knight in order to defend the pawns in the board center."
}
```

</details>

## Error Handling

For all error responses, the REST API will return the relevant HTTP status code (4xx or 5xx), along with a JSON object containing details about the error. The error response should includes the type, and an optional message providing more context.

### Error Response Format

- **Response Body (JSON)**:
  - `type` (string): A brief description of the error type (e.g., `not_found`, `invalid_fen_notation`, `invalid_move`).
  - `message` (string, optional): Additional information about the error, if available.

### Common Error Codes

- **400 Bad Request**: Returned when the request is malformed or missing required parameters.

- **404 Not Found**: Returned when the requested resource or endpoint does not exist.

- **422 Unprocessable Entity**: Returned when the server understands the request but cannot process the provided data (e.g., invalid chess notation).

- **500 Internal Server Error**: Returned when an unexpected server error occurs.

### Example Error Response

If an invalid FEN string is provided in the request to `/evaluate_move`, the response might be (with status code 422):

```json
{
  "type": "invalid_fen_notation",
  "message": "Invalid FEN string provided."
}
```
