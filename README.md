# Vertex PMO Intelligence Agent
> **AI-Powered Enterprise Project Intelligence with Human Decision Control**  
> Built for Vertex Consulting Group &middot; Executive Governance & Project Health Analytics

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Core Design Philosophy](#2-core-design-philosophy)
3. [System Architecture](#3-system-architecture)
4. [The 7-Stage Agent Workflow](#4-the-7-stage-agent-workflow)
5. [Dashboard Layout & Features](#5-dashboard-layout--features)
6. [Key Intelligent Capabilities](#6-key-intelligent-capabilities)
   - [Dual-Engine Analysis (Deterministic + LLM)](#dual-engine-analysis)
   - [Gemini Failure Fallback (Zero-Freeze Guarantee)](#gemini-failure-fallback)
   - [Dynamic Evidence Simulation](#dynamic-evidence-simulation)
   - [Stale Data Protection](#stale-data-protection)
   - [Human Decision Lifecycle (Approve, Edit, Reject)](#human-decision-lifecycle)
   - [Executive View (1440 &times; 900 Single-Screen Fit)](#executive-view)
7. [Repository File Structure](#7-repository-file-structure)
8. [Prerequisites & System Requirements](#8-prerequisites--system-requirements)
9. [Installation & Setup](#9-installation--setup)
10. [Configuration & Environment Variables](#10-configuration--environment-variables)
11. [How to Run the Project](#11-how-to-run-the-project)
12. [Live Demonstration Script (Step-by-Step)](#12-live-demonstration-script)
13. [Security Architecture](#13-security-architecture)
14. [Automated Verification & QA](#14-automated-verification--qa)

---

## 1. Executive Summary

The **Vertex PMO Intelligence Agent** is an executive-grade AI decision support system designed to solve one of the most critical challenges in enterprise portfolio delivery: **information fragmentation and delayed risk escalation**.

In major transformation programmes, project managers, risk owners, technical leads, and steering committees often produce disconnected status reports. Material delays and critical dependencies can be obscured in narrative updates until they threaten go-live milestones.

The PMO Intelligence Agent addresses this by:
1. **Consolidating Multi-Source Evidence**: Ingests project status updates, risk/issue logs, milestone baselines, steering committee minutes, and previous reports.
2. **Cross-Referencing Discrepancies**: Highlights conflicts between self-reported project statuses (e.g. reported "GREEN") and real evidence (e.g. delayed milestones or unresolved vendor APIs).
3. **Constructing Causal Chains**: Traces root-cause drivers through direct effects to downstream impacts on testing and delivery.
4. **Drafting Prioritized Recommendations**: Formulates actionable next steps accompanied by a concise, evidence-backed "WHY" explanation.
5. **Enforcing Human Governance**: The Agent never takes autonomous unilateral action. It recommends, while human leaders retain final decision authority (**AGENT RECOMMENDS. HUMAN DECIDES.**).

---

## 2. Core Design Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│             AGENT RECOMMENDS. HUMAN DECIDES.                │
├──────────────────────────────┬──────────────────────────────┤
│       AI Agent Domain        │     Human Management Domain  │
├──────────────────────────────┼──────────────────────────────┤
│ • Observe multi-source data  │ • Review recommendations     │
│ • Cross-check evidence       │ • Evaluate strategic trade-offs│
│ • Detect reporting conflicts │ • Approve actions            │
│ • Trace root causes          │ • Edit actions or status     │
│ • Propose prioritized actions│ • Reject with formal reason  │
│ • Provide causal rationale   │ • Retain full accountability │
└──────────────────────────────┴──────────────────────────────┘
```

- **10-Second Executive Comprehension**: Any first-time viewer can grasp the project identity, period, overall health, primary constraint, and recommended intervention within 10 to 15 seconds.
- **Consulting-Grade Professionalism**: Built with the Vertex Consulting Group corporate design standard (Deep Navy `#0B1F33`, Slate Grey `#475569`, Corporate Teal `#0F766E`, Amber `#D97706`, Critical Red `#DC2626`). Clean typography, zero decorative emojis, and high-contrast accessibility.
- **Single-Screen Presentation Efficiency**: Engineered to fit the entire operational dashboard into a standard **1440 &times; 900** presentation frame with zero vertical scrolling.

---

## 3. System Architecture

The application is structured as a resilient, client-server web application featuring a dual-layer analysis engine.

```mermaid
flowchart TD
    subgraph DataLayer [Enterprise Evidence Layer]
        PSU[Project Status Update]
        RIL[Risk & Issue Log]
        MT[Milestone Tracker]
        SCN[Steering Committee Notes]
        PPR[Previous PMO Report]
    end

    subgraph Client [Browser Client: index.html + app.js]
        UI[Executive Dashboard UI]
        DET[Deterministic Engine: Instant <100ms Assessment]
        STATE[Application State & Decision Store]
        GATE[Human Decision Gate: Approve / Edit / Reject]
    end

    subgraph Server [Backend Service: server.js]
        API[/api/analyze Endpoint]
        SEC[Environment & Key Protection]
    end

    subgraph AI [Google Cloud / Vertex AI]
        GEMINI[Google Gemini API: gemini-2.5-flash / gemini-3.6-flash]
    end

    DataLayer -->|Preloaded / Modifiable| DET
    DET -->|Instant First Render| UI
    DET -->|Payload Dispatch| API
    API -->|Protected Key via .env| GEMINI
    GEMINI -->|Structured JSON Synthesis| API
    API -->|AI Synthesis Results| UI
    GEMINI -.->|Quota Exceeded / Timeout / Outage| API
    API -.->|Graceful Fallback Flag| DET
    UI --> GATE
    GATE -->|Persist Decision| STATE
```

### Key Components:
- **Client (Frontend)**: Standard HTML5, CSS3, and vanilla modern JavaScript (ES6+). Zero external frontend frameworks (no React/Vue overhead), enabling instant DOM boot times (<200ms) and lightweight resource consumption.
- **Server (Backend)**: Lightweight Node.js Express server (`server.js`) acting as a secure API gateway to Google Gemini. Ensures API keys are never exposed to browser clients.
- **AI Synthesis**: Google Gemini (`@google/genai`) configured with strict JSON schema enforcement and system prompts that restrict outputs to evidence-grounded analysis.

---

## 4. The 7-Stage Agent Workflow

The middle column of the dashboard displays the Agent's analytical journey across seven distinct phases:

| Stage # | Stage Name | Action Executed by Agent |
| :---: | :--- | :--- |
| **01** | **OBSERVE** | Ingests and parses all 5 enterprise data sources into unified memory structures. |
| **02** | **VALIDATE** | Verifies evidence completeness and notes unverified sources (e.g. disconnected finance ERP). |
| **03** | **COMPARE** | Performs cross-source reconciliation (e.g. comparing reported schedule status against actual milestone variance). |
| **04** | **INVESTIGATE** | Identifies the primary issue and isolates the underlying root-cause driver. |
| **05** | **ASSESS** | Calculates schedule slippage, progress gap, open high-severity risks, and overall RAG health. |
| **06** | **RECOMMEND** | Synthesizes prioritized, structured management actions with source-backed rationale. |
| **07** | **HUMAN REVIEW** | Suspends autonomous progression and passes control to the human decision-maker. |

---

## 5. Dashboard Layout & Features

The dashboard uses an ergonomic 3-column split designed for rapid executive scanning:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER: VERTEX CONSULTING GROUP — PMO INTELLIGENCE AGENT                                │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  CONTEXT BAR: Project Selector | Reporting Period | Status Indicator | View Toggles      │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  PROJECT EVIDENCE: 5 Interactive Source Cards (Status, Risks, Milestones, Notes, Report) │
├──────────────────────────┬───────────────────────────────┬───────────────────────────────┤
│  COLUMN 1: HEALTH (26%)  │  COLUMN 2: ANALYSIS (44%)     │  COLUMN 3: ACTION (30%)       │
├──────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ • Overall RAG Badge      │ • 7-Stage Workflow Strip      │ • Confidence & Evidence Count │
│ • Schedule KPI Card      │ • Top Exceptions Detected     │ • AI Synthesis / Fallback Tag │
│ • Budget KPI Card        │ • 4-Node Causal Evidence Chain│ • Prioritized Actions List    │
│ • Risk KPI Card          │   [Root Cause -> Effect ->    │ • "WHY" Rationale Callout     │
│ • Progress & Gap Metrics │    Impact -> Implication]     │ • Human Decision Gate         │
│   (in percentage points) │ • "Analysis Details" Link     │   [APPROVE]  [EDIT]  [REJECT] │
└──────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

### 1. Project Context Bar
- **Project**: `Digital Transformation Programme (VCG-DT-2026)`
- **Reporting Period**: `September 2026`
- **Status Tag**: Live state pill (`Ready for analysis`, `ANALYSIS COMPLETE`, or `Evidence Updated (Re-run Required)`).
- **Controls**: **EXECUTIVE VIEW** (toggles ultra-compact presentation mode) and **VIEW ANALYSIS DETAILS** (opens audit timeline).

### 2. Project Evidence Deck
Five interactive source cards showing real-time loading state:
1. **Project Status Update**: Workstream breakdown, PM commentary, planned vs actual progress.
2. **Risk & Issue Log**: Severity ratings, active blockers, mitigations.
3. **Milestone Tracker**: Planned vs forecast dates, critical path markers, delay variances.
4. **Steering Committee Notes**: Leadership discussions, governance escalations, formal requests.
5. **Previous PMO Report**: Historical baseline for trend comparison.

> **Interactive Feature**: Clicking any card opens a dedicated modal displaying the underlying source data, including interactive controls to modify evidence in real time.

### 3. Left Column: Project Health & Status (26%)
- **Overall Status**: Clear RAG indicator (**AMBER** - *"Needs management attention, but is not yet critical."*) with an interactive `"WHAT DOES THIS MEAN?"` explainer.
- **Schedule**: `AMBER` (*"Key milestone is delayed."*).
- **Budget**: `REPORTED GREEN` with explicit audit disclaimer: *"Reported as within control; finance system not connected."*
- **Risk**: `AMBER` (*"Open issues require management attention."*).
- **Progress Metrics**: Plain-English comparison (`62% actual | 75% planned`) and **Progress Gap** (`13 percentage points` below plan).

### 4. Middle Column: Agent Analysis & Evidence Chain (44%)
- **Top Exceptions List**: Prioritized cards highlighting detected anomalies:
  - `[HIGH]` System Integration is forecast 21 days behind plan (Source: Milestone Tracker).
  - `[HIGH]` Vendor API dependency remains unresolved (Source: Risk & Issue Log).
  - `[MEDIUM]` Reported GREEN schedule status conflicts with milestone evidence (Source: Project Status Update).
- **Evidence Chain**: 4-node horizontal flow demonstrating causal reasoning:
  - **ROOT CAUSE**: Vendor/API dependency unresolved.
  - **DIRECT EFFECT**: System Integration forecast 21 days behind plan.
  - **DOWNSTREAM IMPACT**: UAT testing window compressed and at risk.
  - **MANAGEMENT IMPLICATION**: Immediate intervention and recovery plan required.

### 5. Right Column: Management Action & Human Gate (30%)
- **Confidence**: `HIGH` (*"Strong evidence supports the conclusion"*).
- **Evidence Used**: `5 sources`.
- **Recommended Actions**: Prioritized actions (`[HIGH] Escalate vendor dependency`, `[HIGH] Approve recovery plan for integration delay`, `[MEDIUM] Assess additional technical support`).
- **"WHY" Callout**: Direct, evidence-grounded rationale.
- **Human Decision Gate**: The central governance control with prominent buttons: `APPROVE`, `EDIT`, and `REJECT`.

---

## 6. Key Intelligent Capabilities

### Dual-Engine Analysis
1. **Deterministic Consolidation Engine (<100ms)**: Executes synchronously in the client upon clicking `RUN PMO ANALYSIS`. Instantly evaluates milestone variances, cross-checks reporting conflicts, assesses risk thresholds, and computes health indicators. Eliminates blank screens and loading delays.
2. **Generative AI Synthesis Engine**: Dispatches structured evidence payload to Google Gemini via `/api/analyze` to generate narrative executive synthesis, cross-source findings, and contextual actions.

### Gemini Failure Fallback
If the Gemini API times out, loses network connectivity, or exhausts quota (HTTP 429):
- The UI **never freezes** on loading states.
- The loading spinner safely terminates and updates the button to `ANALYSIS COMPLETE`.
- A non-intrusive notification badge appears: `AI SYNTHESIS UNAVAILABLE • Deterministic Fallback Active`.
- The full dashboard (Health RAGs, Exceptions, Evidence Chain, Recommendations, Human Approval) remains **100% operational** backed by the deterministic engine.

### Dynamic Evidence Simulation
Users can test the Agent's analytical responsiveness by altering project evidence on the fly:
1. Click the **Milestone Tracker** card.
2. In the modal, change the **System Integration** delay from `21` days to `2` days and click **Save Evidence**.
3. The Agent detects the change, marks the analysis stale, and prompts a re-run.
4. On re-running, the Schedule status automatically improves from **AMBER &rarr; GREEN**, the milestone delay exception disappears, the evidence chain updates to *"System Integration on track"*, and the recommendations adapt.
5. Restoring the delay back to `21` days returns the original findings.

### Stale Data Protection
If project evidence is modified after an analysis has already been rendered:
- A visible warning banner is immediately rendered above the decision gate:  
  `"Project evidence has changed since this analysis was generated. Re-run the Agent before making a management decision."`
- The `APPROVE`, `EDIT`, and `REJECT` buttons are locked (`disabled`, `opacity: 0.4`, `cursor: not-allowed`).
- The primary action button updates to: `RUN PMO ANALYSIS (EVIDENCE UPDATED)`.
- Prevents management from approving outdated decisions.

### Human Decision Lifecycle
- **APPROVE**: Opens confirmation modal summarizing recommended actions. Once approved, the card transforms into an official green approval receipt, records decision timestamp, and creates an immutable audit trail entry.
- **EDIT**: Opens an inline governance editor allowing management to override the overall status (GREEN/AMBER/RED), modify recommended actions (add/edit/remove), and customize the rationale. Renders a side-by-side comparison between **Agent Original Recommendation** and **Management Final Decision**.
- **REJECT**: Opens rejection modal requiring a mandatory business justification. Renders a formal red rejection card displaying the reason.
- **Persistence**: Decisions persist in browser `localStorage` across page reloads.
- **Reset Demo**: Clears decisions, restores baseline evidence, and resets the interface to its clean unrun state.

### Executive View
Clicking **EXECUTIVE VIEW** toggles presentation mode:
- Hides secondary notes, simulated architecture tags, and historical lists.
- Adjusts spacing and paddings to guarantee a perfect **1440 &times; 900** fit with **zero vertical scrollbar**.
- Ideal for executive briefings and presentation slide screenshots.

---

## 7. Repository File Structure

```
PMO_AGENT/
├── index.html                    # Main executive dashboard interface
├── styles.css                    # Consulting-grade CSS design system
├── app.js                        # Client state machine, deterministic rules, UI rendering
├── data.js                       # Enterprise project datasets & scenario definitions
├── server.js                     # Express backend & Gemini API integration service
├── package.json                  # Node.js dependencies and run scripts
├── package-lock.json             # Locked dependency versions
├── .env                          # Local environment variables (API keys - gitignored)
├── .env.example                  # Template for environment configuration
├── .gitignore                    # Git ignore file excluding node_modules and .env
├── CHECKPOINT_STATUS.txt         # Checkpoint verification status
└── scratch/
    └── test_final_qa.js          # Automated end-to-end Puppeteer QA test suite
```

---

## 8. Prerequisites & System Requirements

- **Operating System**: Windows 10/11, macOS 12+, or Linux (Ubuntu 20.04+).
- **Runtime**: **Node.js** version `v18.0.0` or higher (`v20.x` or `v22.x` recommended).
  - Verify your installation: `node -v`
- **Package Manager**: **npm** version `9.x` or higher.
  - Verify your installation: `npm -v`
- **Web Browser**: Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari (Chrome/Edge recommended for 1440x900 executive capture).
- **Gemini API Key** *(Optional for AI synthesis; deterministic engine runs without it)*: Obtain from [Google AI Studio](https://aistudio.google.com/).

---

## 9. Installation & Setup

### Step 1: Open Terminal / Command Prompt
Navigate to the project root folder:
```powershell
cd c:\Users\Aaditya\OneDrive\Desktop\PMO_AGENT
```

### Step 2: Install Node.js Dependencies
Install the required packages (`express`, `cors`, `dotenv`, `@google/genai`):
```powershell
npm install
```

---

## 10. Configuration & Environment Variables

The project includes a `.env.example` file. Create your local `.env` file in the root folder:

```powershell
# In PowerShell:
Copy-Item .env.example .env
```

Open `.env` in any text editor and configure:
```env
# Google Gemini API Key (from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# Model Selection: gemini-2.5-flash or gemini-3.6-flash
GEMINI_MODEL=gemini-2.5-flash

# Port for local server (optional, defaults to 3000)
PORT=3000
```

> **Note on API Quota**: If you do not provide an API key or if your Gemini API quota is exhausted, the PMO Agent will automatically activate its built-in **Deterministic Fallback Engine**. All dashboard features, calculations, causal chains, and decision gates will work seamlessly.

---

## 11. How to Run the Project

### Start the Server
Run the following command in the project directory:

```powershell
npm start
```
*Or directly via Node:*
```powershell
node server.js
```

### Output:
```
Vertex PMO Agent server running on http://localhost:3000
```

### Open the Application
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 12. Live Demonstration Script

Follow this step-by-step walkthrough to present or demonstrate the agent:

### Part 1: Initial Walkthrough (First 30 Seconds)
1. Navigate to `http://localhost:3000`.
2. Point out the **Header**, **Project Bar** (`Digital Transformation Programme`, `September 2026`), and the **5 Loaded Evidence Sources**.
3. Note that the dashboard displays clean initial placeholder values (`—` in status badges).
4. Click **RUN PMO ANALYSIS**.
5. Observe the workflow progression (`OBSERVING EVIDENCE...` &rarr; `VALIDATING...` &rarr; `COMPARING...` &rarr; `ASSESSING...`).
6. Within seconds, the dashboard renders the complete findings:
   - **Overall Status**: `AMBER`
   - **Schedule**: `AMBER`
   - **Budget**: `REPORTED GREEN` (*"Reported as within control; finance system not connected."*)
   - **Risk**: `AMBER`
   - **Progress Gap**: `13 percentage points`
   - **Evidence Chain**: Root cause (vendor API) &rarr; direct effect (21d integration delay) &rarr; downstream impact (UAT at risk) &rarr; management implication.

### Part 2: Dynamic Evidence & Stale Safety
1. Click the **Milestone Tracker** card in the evidence deck.
2. In the modal, locate **System Integration** (currently `21` days delay).
3. Change the number to `2` days and click **Save Evidence**.
4. Observe the immediate visual change:
   - Status tag updates to: `Evidence Updated (Re-run Required)`.
   - Red warning banner appears: *"Project evidence has changed since this analysis was generated..."*
   - `APPROVE`, `EDIT`, and `REJECT` buttons are locked and cannot be clicked.
5. Click **RUN PMO ANALYSIS (EVIDENCE UPDATED)**.
6. Observe the updated analysis:
   - Schedule status turns **GREEN**.
   - The milestone delay exception disappears.
   - The Evidence Chain updates to: *"System Integration on track"*.
   - Recommendation changes to: *"Monitor recovered milestone progress"*.

### Part 3: Human Decision Authority
1. Click the green **APPROVE** button.
2. Review the confirmation modal and click **Confirm Approval**.
3. The decision card updates with an official green **APPROVED** badge and timestamp.
4. Scroll down to view the **DECISION HISTORY** audit trail.
5. Refresh the browser page (`F5`) &mdash; notice the approved decision persists from `localStorage`.

### Part 4: Executive Presentation Mode
1. Click the **EXECUTIVE VIEW** button in the top context bar.
2. Notice how secondary elements collapse cleanly, fitting the entire dashboard into a single **1440 &times; 900** screenshot with zero vertical scrollbars.
3. Click **EXIT EXECUTIVE VIEW** to return to standard view.
4. Click **Reset Demo** to restore the system to its initial pristine condition.

---

## 13. Security Architecture

1. **Zero Client-Side Key Exposure**: The Gemini API key is managed strictly on the Node.js backend. Client-side files (`index.html`, `app.js`, `data.js`, `styles.css`) contain zero secrets.
2. **Environment File Protection**: `server.js` serves static assets while preventing access to hidden system files. Probing `GET http://localhost:3000/.env` returns **HTTP 404 Not Found**.
3. **Safe Logging**: Server console logs record request metadata (scenario ID, payload byte size, risk count) and never log raw authorization headers or API keys.

---

## 14. Automated Verification & QA

The repository includes an end-to-end headless browser test suite (`scratch/test_final_qa.js`) testing all functional and visual requirements:

```powershell
node scratch/test_final_qa.js
```

### Verification Checklist:
- [x] **User Journey**: All 7 workflow stages verified.
- [x] **Terminology**: Standalone abbreviations eliminated; `"percentage points"` verified.
- [x] **Budget Disclaimer**: Exact wording verified.
- [x] **Dynamic Evidence**: 21-day &rarr; 2-day &rarr; 21-day round-trip verified.
- [x] **Stale Protection**: Warning banner and button lock verified.
- [x] **Decision Governance**: APPROVE, EDIT, and REJECT branches verified with persistence.
- [x] **Deterministic Fallback**: Active under simulated outage and quota exhaustion.
- [x] **Viewport Fit**: 1440 &times; 900 single-screen fit in Executive View verified.
- [x] **Security**: `.env` 404 response verified.
- [x] **Console Cleanliness**: Zero unexpected errors verified.

---
&copy; 2026 Vertex Consulting Group. PMO Intelligence Agent &middot; All Rights Reserved.
