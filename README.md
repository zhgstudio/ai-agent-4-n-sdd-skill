# 4+N SDD — Modular Spec-Driven Development for AI Agents

> **Stop vibe coding. Start spec driving.** A lightweight topology-based workflow that prevents AI attention dilution, fake progress checkmarks, and historical context pollution.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/zhgstudio/ai-agent-4-n-sdd-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/zhgstudio/ai-agent-4-n-sdd-skill/actions/workflows/ci.yml)
[![Platform: OpenCode](https://img.shields.io/badge/Platform-OpenCode-8A2BE2)](#)
[![Platform: Claude Code](https://img.shields.io/badge/Platform-Claude%20Code-000)](#)
[![Platform: Cursor](https://img.shields.io/badge/Platform-Cursor-0078D4)](#)

---

## The Pain

AI coding agents suffer from three fatal flaws:

| # | Problem | Symptom |
|---|---------|---------|
| 1 | **Attention Dilution** | Stuffing all design into one file → AI gets confused as context grows |
| 2 | **Fake Checkmarks** | Marking tasks done before tests pass → broken code ships |
| 3 | **History Pollution** | Old review docs pile up → AI stitches new logic onto dead designs |

**4+N SDD solves all three** by physically isolating global specs from modular designs.

---

## The 4+N Topology

> *This is the structure generated in **your project** when you use the skill. This repository itself only contains `SKILL.md`.*

```
├── docs/
│   ├── SPEC.md             # 👑 1. Global Requirements (WHAT)
│   ├── ARCHITECTURE.md     # 🏛️ 2. Global Architecture (HOW)
│   ├── PLAN.md             # 🏃 3. Execution Plan (milestones)
│   │
│   └── modules/            # 📦 N. Isolated Module Designs
│       ├── {module_a}/     # schema.sql, api.md
│       └── {module_b}/     # protocol.md, state.md
└── AGENTS.md               # 👑 4. Global Agent Behavior Contract
```

<details>
<summary><b>This repo structure</b> (click to expand)</summary>

```
├── ai-agent-4-n-sdd/
│   └── SKILL.md              # The core workflow skill
├── README.md
├── README.zh.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
└── .github/
    └── workflows/ci.yml
```

</details>

**Why this works:** Global files stay small and focused. Module files are only loaded when that module is being worked on. No cross-module contamination. No oversized context windows.

---

## The 5-Stage Protocol

```
Stage 1: SPEC.md      → Human writes requirements
Stage 2: ARCHITECTURE → AI derives architecture from spec
Stage 3: Modules      → Per-module deep-dive designs
Stage 4: PLAN.md      → Micro-task breakdown
Stage 5: TDD & Code   → Test-first, no fake checkmarks
```

Each stage ends with a **human review gate**. Nothing advances without explicit approval.

---

## Quick Start

### 1. Install the skill

```bash
# Clone the repository, then copy the skill directory
git clone --depth 1 https://github.com/zhgstudio/ai-agent-4-n-sdd-skill.git /tmp/sdd-skill
cp -r /tmp/sdd-skill/ai-agent-4-n-sdd .opencode/skills/
rm -rf /tmp/sdd-skill
```

Or if you only want the skill directory (no git history):

```bash
# Linux / macOS
mkdir -p .opencode/skills/
curl -sL https://github.com/zhgstudio/ai-agent-4-n-sdd-skill/archive/main.tar.gz | tar -xz --strip=2 -C .opencode/skills/ ai-agent-4-n-sdd-skill-main/ai-agent-4-n-sdd

# Windows PowerShell
mkdir .opencode\skills\ -Force
curl -L https://github.com/zhgstudio/ai-agent-4-n-sdd-skill/archive/main.tar.gz -o $env:TEMP\sdd.tar.gz
tar -xzf $env:TEMP\sdd.tar.gz -C .opencode\skills\ --strip-components 2 ai-agent-4-n-sdd-skill-main/ai-agent-4-n-sdd
Remove-Item $env:TEMP\sdd.tar.gz
```

For **Claude Code** and **Cursor**, follow the same approach but install to `.claude/skills/` or `.cursor/` respectively.

### 2. Start a new session

```
"Read .opencode/skills/ai-agent-4-n-sdd/SKILL.md. My new project idea is: [your one-liner].
Follow the skill strictly and start Stage 1 — generate docs/SPEC.md."
```

### 3. Iterate through the stages

Human reviews → AI implements → Tests pass → Git commit → Next stage.

---

## Platform Support

| Platform | Integration |
|----------|-------------|
| OpenCode | `.opencode/skills/` |
| Claude Code | `.claude/skills/` |
| Cursor | `.cursorrules` |
| Any AI CLI | Load SKILL.md as system prompt |

---

## Comparison: SDD vs Traditional AI Coding

| Aspect | Traditional (Vibe Coding) | 4+N SDD |
|--------|---------------------------|---------|
| Context size | Grows unbounded | Physically scoped |
| Task tracking | Self-reported | Test-verified |
| Design docs | One giant file | 4+N isolated files |
| Human review | Once at end | Per-stage gates |
| History handling | `_v2.md` garbage | Git-based overwrite |
| Module isolation | None | Directory-level |

---

## Why 4+N SDD?

- **Smaller context** = better AI reasoning
- **Test gates** = no fake progress
- **Git-native** = clean version history
- **Human-in-the-loop** = you stay in control
- **Platform-agnostic** = works with any AI coding tool

---

## Contributing

PRs, issues, and ideas welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT © zhgstudio
