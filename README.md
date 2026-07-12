# TransitOps Fleet Engine

TransitOps is a unified, real-time transport operations and fleet management platform developed for the **OdooX Gandhinagar Hackathon 2026**. The platform bridges the gap between manual logbooks and automated database state-machines, ensuring compliance, tracking granular costs, and calculating true vehicle Return on Investment (ROI) for fleet operators.

---

## 🚀 Key Modules & Capabilities

### 1. Unified Landing Page
*   **Role-Based welcome layout**: Greets logged-in managers/analysts with their profile details.
*   **Central Navigation**: Features a minimal top header bar with a logout action and a primary entrance link to the core Operations Console.
*   **Capabilities Map**: Outlines key compliance blockages and features of the TransitOps ecosystem.

### 2. Fuel & Expense Logging
*   **Fuel Logging**: Record liters purchased, total cost, date logged, and option to link the fuel transaction directly to an active dispatch trip ID.
*   **Operational Expenses**: Log miscellaneous overhead costs like tolls, permits, driver daily allowance, washes, and loading expenses.
*   **Scorecards**: Real-time card metrics calculating Total Fuel Cost, Total Other Expenses, and Average fuel cost per liter.
*   **Linked Selection**: Forms automatically fetch only the active/past trips assigned to the selected vehicle to avoid data entry errors.

### 3. Executive Reports & ROI Analytics
*   **Global Fleet KPIs**: Card deck displaying Fleet Utilization %, Total Operational Cost (Fuel + Maintenance + Extras), Avg Fuel Efficiency (km/L), and Average ROI %.
*   **Granular Vehicle Analytics Table**: A detailed matrix showcasing:
    *   Acquisition Cost vs. Generated Trip Revenue.
    *   Breakdown of costs: Fuel, Maintenance, and Other Operational Expenses.
    *   Computed **Return on Investment (ROI)** percentage:
        $$\text{ROI} = \frac{\text{Revenue} - \text{Total Operational Costs}}{\text{Acquisition Cost} + \text{Total Operational Costs}} \times 100$$
*   **Filters**: Live search by registration number or model name, and drop-down filters for regions and vehicle types.
*   **Export Engine**: Single-click "Export CSV" triggering server-side generation and download of complete analytical reports.

### 4. Shared Core Platform (Integrated Features)
*   **Vehicle Registry**: Asset tracking with real-time status management (`Available`, `On Trip`, `In Shop`, `Retired`).
*   **Driver Directory**: Profile tracking, license expiration alerts, safety scores, and duty status checks.
*   **Trip Dispatch Engine**: Capacity-checked trip planning with validation checks to prevent double-booking or dispatching overloaded vehicles.
*   **Maintenance Logs**: Placing a vehicle under maintenance automatically sets its status to `In Shop`, removing it from the active dispatch pool.

---

## 🛠️ Technology Stack

*   **Backend**: Node.js, Express, PostgreSQL, JWT Authentication, Helmet, CORS.
*   **Frontend**: React (Vite), Vanilla CSS + Tailwind CSS, React Router, Recharts, Lucide Icons, Axios.
*   **Package Manager**: `pnpm` (Workspace configured).

---

## 🏁 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   pnpm (`npm install -g pnpm`)
*   PostgreSQL running locally or on a cloud provider.

### 2. Environment Configurations

#### Backend Environment (`backend/.env`)
Create a `.env` file inside the `backend` folder:
```ini
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/transitops_db
JWT_SECRET=your_super_secret_key_here
```

#### Frontend Environment (`frontend/.env`)
Create a `.env` file inside the `frontend` folder:
```ini
VITE_API_URL=http://localhost:5000/api
```

### 3. Installation
From the root workspace directory, run:
```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### 4. Running the Development Servers

#### Start Backend
```bash
cd backend
pnpm dev
# Server will start on http://localhost:5000
```

#### Start Frontend
```bash
cd frontend
pnpm dev
# Web application will start on http://localhost:3000
```

---

## 📊 API Reference (Fuel & Reports Core)

### Fuel & Expense API
*   `GET /api/fuel` - Fetches all recorded fuel logs with vehicle details.
*   `POST /api/fuel` - Logs a new fuel purchase.
*   `GET /api/expenses` - Fetches all miscellaneous operational expense entries.
*   `POST /api/expenses` - Records a new expense.

### Executive Reports API
*   `GET /api/reports/kpis` - Calculates fleet utilization, total operational costs, average fuel efficiency (km/L), and average ROI.
*   `GET /api/reports/vehicles` - Computes acquisition costs, revenues, fuel, maintenance, and other expenses per vehicle.
*   `GET /api/reports/export` - Compiles the database tables and exports a downloadable spreadsheet report in CSV format.
