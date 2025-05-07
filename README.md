# Final Year Project


## Install the dependencies:
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm i
   ```
3. Navigate to the `mock-server` directory:
   ```bash
   cd mock-server
   ```
4. Install backend dependencies:
   ```bash
   npm i
   ```


## Running the Application:
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Navigate to the `mock-server` directory:
   ```bash
   cd mock-server
   ```
4. Start the server:
   ```bash
   npm start
   ```


## With TMUX:
1. Execute the script:
   ```bash
   ./start-dev
   ```
2. For ending ALL tmux sessions:
   ```bash
   tmux kill-server
   ```


## Running the Validator:
1. Navigate to the `validator` directory:
   ```bash
   cd validator
   ```
2. Execute the validator with the required files:
   ```bash
   ./validator/IHTP_Validator <instance_file> <solution_file> [verbose]
   ./validator/IHTP_Validator test_instances/test10.json test_solutions/sol_test10.json verbose
   ```
   - Replace `<instance_file>` with the input instance file.
   - Replace `<solution_file>` with the solution file.
   - Optionally, add `[verbose]` for detailed output.
