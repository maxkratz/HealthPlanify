# HealthPlanify - A healthcare timetable visualizer

## How to use the application

### Download the repository

1. 

   ```bash
   git clone 
   ```

2. 

   ```bash
   cd 
   ```

---

### Install dependencies

1. Go to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Go to the mock-server directory:

   ```bash
   cd ../mock-server
   ```

4. Install backend dependencies:

   ```bash
   npm install
   ```

---

### Option 1: Run the application manually

1. Go to the mock-server directory:

   ```bash
   cd mock-server
   ```

2. Start the backend server:

   ```bash
   npm start
   ```

3. In another terminal, go to the frontend directory:

   ```bash
   cd frontend
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Access the application in your browser at:

   ```
   http://localhost:5173/
   ```

---

### Option 2: Run using script and tmux

1. From the project root, run the script:

   ```bash
   ./start-dev
   ```

2. Access the application:

   ```
   http://localhost:5173/
   ```

3. To stop **all** tmux sessions:

   ```bash
   tmux kill-server
   ```

---

## How to use the competition validator

1. Go to the validator directory:

   ```bash
   cd validator
   ```

2. Run the validator with the required files:

   ```bash
   ./validator/IHTP_Validator <instance_file> <solution_file> [verbose]
   ```

   Example:

   ```bash
   ./validator/IHTP_Validator test_instances/test10.json test_solutions/sol_test10.json verbose
   ```

   - Replace `<instance_file>` with the input instance file.
   - Replace `<solution_file>` with the solution file.
   - Optionally add `verbose` for detailed output.
