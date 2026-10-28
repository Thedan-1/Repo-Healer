<div align="center">

# 🛠️ Repo-Healer

### Repo-Healer: Autonomous Codebase Self-Healing Agent with AST Scoping and Multi-Loop Verification

**Maintained by [Thedan-1](https://github.com/Thedan-1)**

[![Verification](https://img.shields.io/badge/Verification-real%20pytest%20results-emerald?style=for-the-badge&logo=pytest)](https://github.com/Thedan-1/Repo-Healer)
[![License MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](https://github.com/Thedan-1/Repo-Healer)
[![LLM Engine](https://img.shields.io/badge/Gemini_3.6-Pro-purple?style=for-the-badge&logo=google)](https://github.com/jiacheng-xu/repo-healer)
[![Multi-Provider](https://img.shields.io/badge/Model-Gemini%20%7C%20OpenAI%20%7C%20Ollama-blue?style=for-the-badge)](https://github.com/jiacheng-xu/repo-healer)

[Overview](#-overview) | [Key Features](#-key-features) | [System Architecture](#-system-architecture) | [Quick Start](#-quick-start) | [Multi-LLM Setup](#-multi-llm-setup) | [Project Structure](#-project-structure) | [License](#-license)

---

</div>

## 🌟 Overview

**Repo-Healer** is a production-grade autonomous software engineering agent designed to repair broken codebases automatically. It parses AST (Abstract Syntax Tree) structures across multi-file codebases, indexes symbols into vector embeddings for RAG retrieval, runs failing unit test suites (`pytest`), captures error tracebacks, and executes a self-healing loop using Large Language Models (LLM) to issue minimal, search/replace patches until all test suites pass.

---

## ✨ Key Features

- **AST Abstract Syntax Tree Scoping**: Extracts function nodes, classes, imports, and call dependency trees to compute cyclomatic complexity and pinpoint failure surfaces.
- **Chroma 1536-Dim Vector Retrieval (RAG)**: Indexes codebase symbols into high-dimensional vector embeddings for fast multi-file context retrieval.
- **Evidence-Based Verification**: Runs a fixed `python -m pytest -q` command in a temporary directory with a timeout and bounded output. A patch is never reported as passed based on an LLM prediction.
- **AST Static Security & Boundary Inspection**: Detects zero-division risks, unhandled exceptions, and hardcoded secret keys directly on syntax trees.
- **Multi-Provider LLM Integration**: Full support for Google Gemini (`gemini-3.6-pro`), OpenAI (`gpt-4o`), Ollama local models (`qwen2.5-coder:7b`), and custom endpoints (`DeepSeek`).
- **Minimal Search/Replace Patching**: Produces precise unified diff patches instead of rewriting entire multi-thousand-line source files.

---

## 🏗 System Architecture

```text
                               ┌───────────────────────────┐
                               │   Failing Unit Test Trace │
                               └─────────────┬─────────────┘
                                             ▼
┌─────────────────┐    AST Scope     ┌───────────────────────────┐
│ Codebase AST    ├─────────────────►│ Vector Context RAG        │
└─────────────────┘                  └─────────────┬─────────────┘
                                                   ▼
┌─────────────────┐   Search/Replace ┌───────────────────────────┐
│ Passed PyTest   │◄─────────────────┤ Gemini 3.6 / OpenAI / LLM │
└─────────────────┘      Patches     └───────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Requirements

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Installation & Running

```bash
# Clone the repository
git clone https://github.com/Thedan-1/Repo-Healer.git
cd Repo-Healer

# Install dependencies
npm install

# Start the development server (Frontend + Express API Server)
npm run dev
```

Open your browser at `http://localhost:3000` to access the Repo-Healer Web Dashboard.

### Verification API

`POST /api/verify` accepts `{ "files": [{ "path": "...", "content": "..." }], "testPath": "tests/test_core.py" }` and runs the fixed `python -m pytest -q` command against those files. The runner rejects absolute and traversal paths, limits repository size, caps output, and stops after 30 seconds by default. If no test file is supplied, the response is `not_run`; it is never reported as a pass.

---

## 🤖 Multi-LLM Setup

Repo-Healer supports flexible LLM provider switching via the system configuration modal:

1. **Google Gemini**: Uses `GEMINI_API_KEY` (Default: `gemini-3.6-pro` or `gemini-2.5-flash`).
2. **OpenAI (ChatGPT)**: Custom OpenAI API Key for `gpt-4o` and `o3-mini`.
3. **Ollama Local**: Connects to `http://localhost:11434` for offline local models (e.g., `qwen2.5-coder:7b`).
4. **Custom Provider**: Compatible with DeepSeek, VLLM, and OpenAI-standard API base URLs.

---

## 📁 Project Structure

```text
├── server.ts               # Express backend API & LLM proxy server
├── src/server/verification.ts # Restricted pytest runner and result parser
├── src/
│   ├── App.tsx             # Main application entry point & state orchestrator
│   ├── components/
│   │   ├── AgentTraceConsole.tsx # Real-time agent thought & step execution console
│   │   ├── AstIndexViewer.tsx    # AST syntax tree parser, call graph & security audit
│   │   ├── CodeDiffViewer.tsx    # Unified diff & patch preview component
│   │   ├── CodeEditorPanel.tsx   # Live code editor with syntax highlighting
│   │   ├── Header.tsx            # Header bar with repo selector & status indicators
│   │   ├── Sidebar.tsx           # Multi-repository target selector
│   │   └── SettingsModal.tsx     # System settings & LLM provider config
│   ├── data/
│   │   └── sampleRepos.ts        # Sample repositories with failing PyTest cases
│   └── types.ts            # Global TypeScript interface & type definitions
├── package.json            # Project dependencies & build scripts
├── vite.config.ts          # Vite build configuration
└── README.md               # Project documentation
```

---

## 📑 Author & Citation

Created and maintained by **[Thedan-1](https://github.com/Thedan-1)**.

```bibtex
@software{xu2026repohealer,
  author = {Thedan-1},
  title = {Repo-Healer: Autonomous Codebase Self-Healing Agent},
  year = {2026},
  publisher = {GitHub},
  url = {https://github.com/Thedan-1/Repo-Healer}
}
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).
