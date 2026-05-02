<div align="center">
  
# 🧠 MakeSense AI
**Context-Aware Assistant & Automated Decision Engine**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)

*A proactive, intelligent assistant that transforms raw intent into actionable Google Workspace execution.*

</div>

---

## 🎯 Project Overview
**MakeSense AI** is a lightweight, strictly-typed AI context engine designed to streamline how professionals interact with their digital environments. Bridging the gap between natural language intention and deterministic rule-based automation, the system evaluates conversational context, assesses user behavior, and directly controls Google Calendar, Gmail, and Google Drive without context-switching.

## 🛑 Problem Statement
Modern professionals constantly context-switch between disparate applications—checking emails, logging histories, and booking calendars. The cognitive load required to juggle these platforms drains productivity. Standard chatbots can answer questions, but they lack the underlying deterministic agency to actively pivot and *do the work* on behalf of the user when repetitive behaviors or time-of-day bounds are detected.

## 💡 Solution Approach
We constructed a dual-layer architecture:
1. **The Contextual Extractor:** Analyzes conversational streams, tracks the precise time of day, limits noise strictly to the last 5 relevant messages, and extracts implicit intents.
2. **The Declarative Decision Engine:** Evaluates the user's intent against behavioral rules. If a user repeats a task, the engine safely flags an "Automation Suggestion." If returning after an absence, it flags a "Summary Need." 
If no hard logic rule intercepts, the action routes cleanly to deep-integrated Google Workspace SDKs (Calendar/Drive/Gmail) where execution takes place natively.

## ✨ Key Features
- 💠 **Premium Glassmorphism Web UI**: A minimal, beautiful frontend client styled with modern translucent mesh-gradients and micro-animations.
- 🕒 **Context-Aware Limitations**: Actively understands message context, tracking session states and dropping stale tokens to keep reasoning sharp.
- ⚙️ **Behavioral Rules Engine**: Intelligent triggers that dynamically suggest automations or wrap-ups based on real-time activity metrics.
- 📅 **Google Calendar QuickAdd**: Natural language scheduling mapping directly into Google servers.
- 📧 **Gmail Summarization**: Pulls most recent emails and parses snippets cleanly into conversational boundaries.
- ☁️ **Omni-Logging (Google Drive)**: Securely stores system execution traces globally into Drive plaintext logs.

## 🛠️ Tech Stack
- **Environment**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Integrations**: `googleapis` SDK, Google OAuth 2.0
- **Testing**: Jest Test Suite
- **Frontend**: Vanilla HTML5, CSS3 (Inter Typography + UI/UX Best Practices)

## 🚀 Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Tusharcode007/makeSENSE.git
   cd makeSENSE
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Duplicate the example file and input your Google OAuth Application tokens (Detailed below).
   ```bash
   cp .env.example .env
   ```

4. **Launch the Core Engine**
   ```bash
   npm run dev
   ```
   Navigate immediately to `http://localhost:3000` to interact with the elegant Chat UI!

## 🤝 Example Usage

- **User**: `"Schedule a meeting tomorrow at 5"`
  - *MakeSense AI Engine identifies intent -> Routes to Calendar API -> Returns successful Event ID.*
- **User**: `"Summarize my recent emails"`
  - *MakeSense AI Engine identifies intent -> Traverses Gmail Inbox -> Formats beautiful conversational snippet.*
- **User**: `"Check my schedule"` *(Spamming action 3 times in a row)*
  - *MakeSense Decision Engine successfully overrides -> "I noticed you repeatedly check your schedule. Would you like me to automate this routine going forward?"*

## 🌐 Google Services Integration
To ensure the backend natively controls your workspace, this application is tethered to standard Google Developer definitions via OAuth 2.0.
1. Create a Web Application Client in the **Google Cloud Console**.
2. **Enable APIs**: `Google Calendar API`, `Gmail API`, `Google Drive API`.
3. **Set Required Scopes**:
   - `.../auth/calendar` / `.../auth/calendar.events`
   - `.../auth/drive.readonly` / `.../auth/drive.file`
   - `.../auth/gmail.readonly` / `.../auth/gmail.compose`
4. Set allowed Redirect URI to `http://localhost:3000/auth/callback`.

## ⚙️ Assumptions & Constraints
- Assumes the end-user operates primarily strictly within the Google Ecosystem.
- Assumes the runtime operates locally over `http://localhost:3000`. Production deployment would require rigid updating of HTTPS OAuth boundaries on the Google Console and an external database to persist tokens rather than utilizing standard runtime memory variables.
- The Engine explicitly drops conversation history beyond exactly 5 iterations to maintain memory and compute strictness over context bloating.

---
*Built with precision for Advanced Hackathon Deployments.*
