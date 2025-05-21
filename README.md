## HealthPlanify

**A Healthcare Timetable Visualizer**

HealthPlanify is an interactive web application for exploring, validating, and editing solutions to the Integrated Healthcare Timetabling Problem (IHTP) from IHTC 2024. Through an intuitive interface and real-time visualizations, it enables both experts and non-technical users to analyze surgical scheduling, hospital admissions, and nurse assignments, assess associated costs, and adjust parameters on the fly.

### 📋 Prerequisites

- **Git** 2.0+
- **Node.js** 14+
- **npm** 6+
- **C++ compiler** (g++ or clang++) for the validator (OPTIONAL)
- **tmux** for running the app with the script (OPTIONAL)

---

### ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Nestor-DF/HealthPlanify.git
   cd HealthPlanify
   ```

2. **Install dependencies**

   - Frontend:

     ```bash
     cd frontend && npm install
     ```

   - Mock server:

     ```bash
     cd ../mock-server && npm install
     ```

---

### ▶️ Running the Application

Choose one of the following options:

#### Option 1: Manual Start

1. Launch the mock server:

   ```bash
   cd mock-server && npm start
   ```

2. In a new terminal, start the frontend dev server:

   ```bash
   cd frontend && npm run dev
   ```

3. Open your browser at `http://localhost:5173`.

#### Option 2: One-Command Dev Script (requires tmux)

From the project root:

```bash
./start-dev
```

When finished, terminate all sessions with:

```bash
tmux kill-server
```

---

### 🔍 Oficial Competition Validator

1. Navigate to the `validator` directory:

   ```bash
   cd validator
   ```

2. Run the validator:

   ```bash
   ./validator-code/IHTP_Validator <instance_file> <solution_file> [verbose]
   ```

   - `<instance_file>`: Path to a JSON file defining the problem instance.
   - `<solution_file>`: Path to your solution file (JSON).
   - `verbose`: (optional) Enables detailed output.

**Example**:

```bash
./validator-code/IHTP_Validator ../data/test_instances/test10.json ../data/test_solutions/sol_test10.json verbose
```

---