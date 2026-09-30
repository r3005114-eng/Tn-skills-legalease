# LegalEase (India) | AI Legal Intelligence & Document Drafting Platform

[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-React%20%7C%20Node%20%7C%20Express%20%7C%20Tailwind%20%7C%20MongoDB%20%7C%20Gemini-blue.svg)](#)
[![Legal Jurisdiction](https://img.shields.io/badge/Jurisdiction-India%20(Central%20%26%20State%20Statutes)-amber.svg)](#)
[![Security](https://img.shields.io/badge/Security-JWT%20%7C%20Helmet%20%7C%20DPDP%202023-emerald.svg)](#)

**LegalEase** is a production-quality, professional legal-tech SaaS application designed specifically for Indian advocates, corporate legal departments, and citizens. It delivers structured legal assistance, 10-point contract breakdowns, multi-step draft generation, and authentic Indian statutory research.

> [!IMPORTANT]
> **Legal Disclaimer:** LegalEase provides artificial intelligence-assisted legal information and preparatory drafting technology. It does **not** provide legal advice, representation, or establish an advocate-client relationship. All drafts and clause analyses should be reviewed and verified by an enrolled advocate.

---

## Key Modules & Capabilities

### 1. Landing Page (`/`)
- Hero: *"Legal clarity, powered by AI."*
- Product preview mock workspace demonstrating Indian tenancy analysis and NDA drafting.
- Feature cards showcasing the AI Legal Assistant, Document Analyzer, Draft Studio, and Legal Knowledge Library.
- Trust & Compliance section: zero model retraining on user briefs, backend-only API key isolation, and non-lawyer regulatory disclaimers.

### 2. Practitioner Dashboard
- Contextual greeting: *"Good evening, [User]"*
- Quick action shortcuts: `[Ask LegalEase]`, `[Analyze Document]`, `[Create Draft]`.
- Statistics counter tracking documents analyzed, drafts generated, and saved sessions.
- *"Continue where you left off"* section resuming your active tenancy or commercial inquiry.

### 3. AI Legal Assistant
- **3-Column Workspace**:
  - **Left**: Searchable consultation catalog with rename and delete options.
  - **Center**: Visually structured message thread distinguishing general legal information, user-provided facts, AI suggestions, and verified sources.
  - **Right**: Legal Context Panel with active jurisdiction selector, attached document memory, and quick statutory fast-tracks.
- **Structured Response Format**:
  - Executive legal information summary
  - Key statutory & contractual points
  - Relevant context & jurisdictional considerations
  - Suggested practical next steps
  - Verified Indian Statutory Citations (Contract Act 1872, IT Act 2000, Transfer of Property Act 1882, DPDP Act 2023)
  - Neutral citation warning: *"Source verification is recommended"* when no exact central statute applies.
- **Quick Prompts**:
  - *"Help me understand my rental agreement"*
  - *"What should I check before signing a contract?"*
  - *"Explain this in simple Tamil"* (Provides vernacular legal conceptual summary followed by standard statutory terms)
  - *"Create a first-pass legal notice"*
  - *"Explain legal term: Liquidated Damages vs Penalty"*

### 4. 10-Point Document Analyzer
- Drag-and-drop file upload supporting **PDF**, **DOCX**, and **TXT** files (up to 15MB).
- Upload metadata display: File name, file size, detected page count, and real-time progress.
- Generates a comprehensive **10-Point Legal Breakdown**:
  1. Executive Summary
  2. Document Type Classification
  3. Contracting Parties (Preamble & roles)
  4. Critical Contractual Dates (Effective date, term, expiry)
  5. Financial Terms & Consideration
  6. Substantive Contractual Obligations
  7. Termination Conditions & Notice Periods
  8. Important Clauses Breakdown (Plain-language explanations, why it matters, document references)
  9. Potential Areas Requiring Attention (Neutral attention indicators: `Informational`, `Review recommended`, `Important to verify`)
  10. Specific Questions to Ask an Enrolled Advocate
- Actions: One-click handoff to AI Assistant for Q&A, PDF export report, and DOCX download.

### 5. Draft Studio
- Guided **5-Step Form Wizard** for 9 standard Indian instruments:
  - Non-Disclosure Agreement (NDA)
  - Employment Agreement
  - Freelance Agreement
  - Residential / Commercial Lease
  - Formal Offer Letter
  - Master Services Agreement (MSA)
  - Statutory Legal Notice
  - Consumer Complaint Draft (Consumer Protection Act, 2019)
  - Right to Information (RTI) Application (Section 6, RTI Act, 2005)
- **Live Split-Screen Workspace**:
  - Left: Guided parameter controls (Parties, effective dates, notice period, consideration, arbitration city, custom instructions).
  - Right: Live legal paper preview with numbered sections, recitals, and signature blocks.
- **Export Options**: Download as **PDF** (via PDFKit), **DOCX** (via docx library), or **TXT**.
- In-place text editor to modify covenants before exporting.

### 6. My Documents & Chat History
- Categorized document views: `All`, `Drafts`, `Analyzed`, `Generated`, `Favorites`.
- Search, filter, rename, favorite, delete, and download.
- Full session records with document attachment indicators.

### 7. Legal Knowledge Library
- Authenticated Indian statutory repository.
- Covers Indian Contract Act 1872 (Sections 10, 27, 73, 74), Information Technology Act 2000 (Sections 10A, 43A, 65B), Consumer Protection Act 2019, Transfer of Property Act 1882 (Sections 105–108), Arbitration and Conciliation Act 1996, RTI Act 2005, and DPDP Act 2023.
- Official IndiaCode and Ministry links. **Zero fabricated citations**.

---

## Technical Architecture

```
legalease/
├── server/                        # Node.js + Express REST API
│   ├── config/                    # Config & dual-mode Database adapter
│   ├── models/                    # Mongoose schemas + In-Memory repository fallback
│   ├── services/
│   │   ├── geminiService.js       # @google/genai with gemini-3.8-flash & fallback
│   │   ├── documentParser.js      # pdf-parse & mammoth text extractors
│   │   └── documentGenerator.js   # PDFKit & docx file generators
│   ├── middleware/                # JWT auth, Multer upload limits, professional error handler
│   ├── routes/                    # REST routes for Auth, Chat, Docs, Drafts, History, Library
│   ├── data/                      # Verified Indian statutory seed data
│   └── server.js                  # Entry point with Helmet, CORS, and rate limiting
└── client/                        # React 18 + Vite + Tailwind CSS
    ├── src/
    │   ├── context/               # AuthContext & LegalContext
    │   ├── components/            # Layout (Sidebar, Topbar, MobileNav), Legal & Common UI
    │   ├── pages/                 # Landing, Dashboard, Assistant, Analyzer, Studio, Library, Docs
    │   └── services/api.js        # Centralized HTTP client
```

---

## Getting Started

### Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+
- *(Optional)* MongoDB instance or MongoDB Atlas URI. **Note:** If MongoDB is not installed locally, LegalEase automatically starts in high-performance local repository mode with full data persistence during runtime.

### 1. Environment Configuration
Copy the configuration template:
```bash
# In server/
copy .env.example .env
```
Fill in your `AQ.Ab8RN6Jgfkn4kWCaQBVyB1hHxypqsLmHS2QCl-ux_6LN0dPIKQ` (if you want live Gemini calls). If left empty, LegalEase automatically operates its intelligent Indian legal fallback engine for offline evaluation.

### 2. Start Backend Server
```powershell
cd server
cmd /c "npm install"
cmd /c "npm start"
```
The server will start at `http://localhost:5000`.

### 3. Start Frontend Client (in a separate terminal)
```powershell
cd client
cmd /c "npm install"
cmd /c "npm run dev"
```
Open `http://localhost:3000` in your web browser.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Sign in with email and password |
| `POST` | `/api/auth/register` | Register new legal practitioner account |
| `POST` | `/api/auth/demo` | Instant demo login for evaluation |
| `GET` | `/api/auth/me` | Fetch authenticated session details |
| `POST` | `/api/chat` | Send query to AI Legal Assistant |
| `POST` | `/api/chat/feedback` | Record thumbs up/down quality signal |
| `POST` | `/api/documents/upload` | Upload PDF/DOCX/TXT for parsing (15MB limit) |
| `POST` | `/api/documents/analyze` | Run 10-point analysis on uploaded document |
| `GET` | `/api/documents` | List user documents with category filter |
| `GET` | `/api/documents/:id/export` | Download analysis report as PDF or DOCX |
| `POST` | `/api/drafts/generate` | Generate structured first-pass legal draft |
| `POST` | `/api/drafts/export/pdf` | Export legal draft to formatted PDF |
| `POST` | `/api/drafts/export/docx` | Export legal draft to Microsoft Word DOCX |
| `GET` | `/api/library` | Search verified Indian legal statutes |

---

## Legal Safety & Ethical Design Standards

1. **No "AI Lawyer" Claims**: The UI and system instructions consistently reinforce that LegalEase is an informational tool and drafting assistant.
2. **Neutral Risk Badges**: The Document Analyzer uses `Informational`, `Review recommended`, and `Important to verify` rather than declaring clauses illegal.
3. **Verified Sources**: Sources are shown in dedicated citation cards linking to official government repositories. If no statute squarely controls the query, the system explicitly advises: *"Source verification is recommended."*
4. **Backend Security**: API keys are strictly kept server-side. Sensitive documents are not retained in public models.
