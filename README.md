# VirtuLab AI — The Virtual Engineering Laboratory

*An AI-powered, interactive virtual electronics and electrical engineering laboratory with deterministic circuit simulation, rule-based mistake detection, dynamic attendance tracking, and oral viva exam preparation using a locally running Gemma model via Ollama.*

---

## 1. System Overview

VirtuLab AI provides engineering students with a benchtop laboratory environment:
- **Interactive Circuit Workspace**: Drag and place DC sources, resistors, capacitors, switches, grounds, ammeters, and voltmeters. Draw custom jumper wires with animated electron current flow.
- **Deterministic Simulation Engine**: Strictly calculates circuit values using physical electrical laws ($V = I \cdot R$, $R_{eq} = R_1 + R_2$, $1/R_{eq} = 1/R_1 + 1/R_2$, $\tau = R \cdot C$). Does not hallucinate or use AI to guess electrical readings.
- **5-Part Mistake Detection Engine**: Rule-based analysis that detects open circuits, short circuits, floating pins, reverse polarity, and wrong values with actionable 5-step diagnostic feedback.
- **Local AI Lab Mentor & Viva Coach**: Communicates directly with your locally installed Ollama instance running a Gemma model (default: `gemma3:4b`, or `gemma:2b` for lower RAM).
- **Attendance & Notice Boards**: Calculated attendance metrics, live room occupancy schedules, and circulars.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts
- **Backend (Local API)**: Python 3.10+, FastAPI, Pydantic, SQLAlchemy, SQLite, HTTPX
- **Local AI Runtime**: Ollama (`http://localhost:11434`) running a local Gemma model (`gemma3:4b`, `gemma:2b`, or `gemma2:2b`)

---

## 3. Step-by-Step Setup Guide (Windows PC)

Follow these exact commands in Windows PowerShell:

### Step 3.1: Install Prerequisites

1. **Install Python (3.10 or newer)**:
   - Download from [python.org](https://www.python.org/downloads/windows/).
   - **Crucial**: Check the box **"Add python.exe to PATH"** during installation.

2. **Install Node.js (18 or newer)**:
   - Download from [nodejs.org](https://nodejs.org/).

3. **Install Ollama for Windows**:
   - Download the official installer from [ollama.com/download](https://ollama.com/download).
   - Install and launch Ollama. It will run in your Windows system tray.

---

### Step 3.2: Download and Run Your Local Gemma Model

Open a Windows PowerShell terminal and run:

```powershell
# Default recommended model (requires ~3.5 GB free RAM/VRAM)
ollama run gemma3:4b
```

> **Hardware Recommendations**:
> - **8 GB RAM or Laptop**: Use `ollama run gemma:2b` or `ollama run gemma2:2b` (~1.8 GB memory footprint).
> - **16 GB RAM or Dedicated GPU**: Use `ollama run gemma3:4b` (default).
> - **32 GB RAM**: Can comfortably run `ollama run gemma:7b`.

To verify which models are installed locally:
```powershell
ollama list
```

---

### Step 3.3: Set Up and Start the Python FastAPI Backend

Open a new PowerShell window in the project root folder:

```powershell
# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Start the FastAPI development server
cd backend
python -m uvicorn main:app --reload --port 8000
```

The backend API will start at `http://127.0.0.1:8000`. You can inspect the interactive Swagger API documentation at:
- `http://127.0.0.1:8000/docs`

---

### Step 3.4: Set Up and Start the React Frontend

Open another PowerShell window in the project root folder:

```powershell
# 1. Install frontend packages
npm install

# 2. Start the Vite development server
npm run dev
```

Open your browser to:
- `http://localhost:3000` (or the port shown in your terminal, e.g. `http://localhost:5173`)

---

## 4. Key Experiments Supported

1. **Verification of Ohm's Law ($V = I \cdot R$)**:
   - Adjust supply voltage (0–30V) and observe linear current response ($I = V/R$).
   - Live V–I characteristic graph plotting.
2. **Series Resistor Network ($R_{eq} = R_1 + R_2$)**:
   - Equal current through all elements; voltage division across resistors.
3. **Parallel Resistor Network ($1/R_{eq} = 1/R_1 + 1/R_2$)**:
   - Equal branch voltages; current divider rule ($I_{total} = I_1 + I_2$).
4. **Kirchhoff's Voltage Law (KVL)**:
   - Loop sum $\sum V = 0$.
5. **Kirchhoff's Current Law (KCL)**:
   - Junction sum $\sum I = 0$.
6. **Voltage Divider Circuit**:
   - Fractional output $V_{out} = V_{in} \cdot [R_2 / (R_1 + R_2)]$.
7. **RC Transient Charging & Discharging**:
   - Time constant $\tau = R \cdot C$, charging curve $V_c(t) = V_s(1 - e^{-t/\tau})$ with play/pause oscilloscope controls.

---

## 5. Verification Test Cases

| Scenario | Inputs | Expected Result | Verified Behavior |
| :--- | :--- | :--- | :--- |
| **Ohm's Law Normal** | $10\text{V}$ Source, $100\Omega$ Resistor | $I = 0.100\text{A}$ ($100\text{mA}$), $P = 1.0\text{W}$ | **VALID**: Correct meter readings and linear V-I plot point. |
| **Series Circuit** | $12\text{V}$ Source, $100\Omega$ & $200\Omega$ in series | $R_{eq} = 300\Omega$, $I = 0.040\text{A}$ ($40\text{mA}$) | **VALID**: $V_1 = 4\text{V}$, $V_2 = 8\text{V}$. |
| **Parallel Circuit** | $10\text{V}$ Source, $100\Omega$ & $200\Omega$ in parallel | $R_{eq} = 66.67\Omega$, $I_{total} = 0.150\text{A}$ | **VALID**: $I_1 = 100\text{mA}$, $I_2 = 50\text{mA}$. |
| **Open Circuit** | Resistor terminal disconnected | $I = 0.0\text{A}$, $P = 0.0\text{W}$ | **INCOMPLETE**: 5-part diagnostic card flags floating pin. |
| **Direct Short Circuit** | DC (+) wired directly to DC (-) | Overcurrent condition | **SHORT_CIRCUIT**: Critical alarm, simulation halts. |

---

## 6. Troubleshooting

- **Ollama Offline Warning**:
  Ensure Ollama is running in the background. In PowerShell, type `ollama list`. If an error occurs, start Ollama from your Windows Start Menu or run `ollama serve`.
- **CORS Error**:
  By default, the backend allows `localhost:3000` and `localhost:5173`. If using a different port, update `CORS_ORIGINS` in `backend/app/config.py`.
- **Port 8000 or 3000 in Use**:
  Change the port flag:
  `python -m uvicorn main:app --port 8001` or `npm run dev -- --port 3001`.
