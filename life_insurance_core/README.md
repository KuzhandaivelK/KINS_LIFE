# Kinsure+ Life Insurance Core Application

Microservices-based Life Insurance Core system powered by Node.js, Express, and Oracle Database (`PROP_PLUS/orcl`).

## Architecture & Features

- **Microservice Architecture**: Decoupled authentication and core menu / dashboard services.
- **Oracle Database Integration**:
  - `MTB_USERS`: User authentication, lockout management, and sign-in telemetry.
  - `MTB_MENUS`: Dynamic hierarchical navigation menu with recursive parent-child submenus.
- **Modern Executive Dashboard**:
  - Combined collapsible sidebar menu with live submenus.
  - Real-time Oracle DB connectivity indicators.
  - Core Insurance KPIs (Active Policies, GWP, Pending Underwriting, Claims Settlement Ratio).
  - Proposal and Underwriting pipeline table.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and verify database credentials:
```env
DB_USER=PROP_PLUS
DB_PASSWORD=prop_plus
DB_CONNECT_STRING=localhost:1521/orcl
PORT=3000
```

### 3. Run Locally
```bash
npm run dev
```

- Portal Dashboard: [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001)
- Auth Endpoint: `POST http://localhost:3000/api/login`
- Menus Endpoint: `GET http://localhost:3000/api/menus`
