---
name: opensdd
description: "Open Spec-Driven Documentation — 编码前规范阶段工作流。为 AI 智能体提供需求规格、架构设计、模块详细设计、任务计划、入口指引共 5 类文档的规范化生成流程，产物作为后续 AI 自主编码阶段的契约依据。"
metadata:
  author: zhgstudio
  version: 3.0.0
---

# OpenSDD — 编码前规范阶段工作流

## 技能概述

本技能解决的是 **AI 自主编码前"先想清楚再写"** 的问题。通过 4 个角色的分阶段协作，生成 5 类规范文档，作为后续编码阶段的契约依据。

**核心原则**：本技能不涉及任何代码编写，只产出文档。所有文档经过人类多轮评审定稿后，才进入编码阶段。

---

## 核心目录拓扑

```text
docs/
├── SPEC.md                 # 👑 1. 需求规格（PM Agent 产出）
├── ARCHITECTURE.md         # 🏛️ 2. 总体架构设计（Architect Agent 产出）
├── PLAN.md                 # 📋 3. 任务计划（Project Manager Agent 产出）
├── AGENTS.md               # 📖 4. 入口指引（多阶段增量积累，人类最终锁定）
│
└── modules/                # 📦 N. 模块详细设计
    ├── 01-{name}/
    │   └── DESIGN.md       # 模块详细设计文档
    ├── 02-{name}/
    │   └── DESIGN.md
    └── ...
```

### 命名规范

- 模块目录使用 **两位数字 + 连字符 + 英文短名** 格式，如 `01-auth`、`02-task-core`
- 模块目录名必须与 `ARCHITECTURE.md` 中的模块引用表中的名称严格一致
- 两位数字仅用于排序提示。新增模块时使用下一个可用序号，不要求严格连续。中间如需插入，可接受序号不连续

### 文档作用

| 文档 | 作用 | 使用者 |
|------|------|--------|
| `SPEC.md` | 原始需求的全面细化，覆盖业务边界、用户旅程、优先级、非功能性约束 | 所有角色 |
| `ARCHITECTURE.md` | 总体架构设计 + 公共设计（技术栈、命名风格、错误处理），按模块引用到对应 DESIGN.md | Architect、Designer |
| `modules/{NN}-{name}/DESIGN.md` | 该模块的详细设计，代码开发必须严格遵循 | Designer、编码阶段的开发者 |
| `PLAN.md` | 基于 DESIGN.md 拆分的开发任务跟踪表，仅含任务条目和完成状态，不含方案细节 | 编码阶段的开发者 |
| `AGENTS.md` | 编码阶段的入口指引。包含项目规则、质量要求、操作范围、任务规范，AI 编码前必读 | 编码阶段的开发者 |

---

## 四角色模型

| 角色 | 阶段 | 读 | 写 |
|------|------|----|----|
| **PM Agent**（产品经理） | 阶段一 | 无（新会话） | `docs/SPEC.md`、追加 `AGENTS.md` 质量验收标准 |
| **Architect Agent**（架构师） | 阶段二 | `SPEC.md`（只读） | `docs/ARCHITECTURE.md`、写入 `AGENTS.md` 主体 |
| **Designer Agent**（模块设计师） × N | 阶段三 | `ARCHITECTURE.md` + 被依赖模块的 `DESIGN.md` | `docs/modules/{NN}-{name}/DESIGN.md` |
| **Project Manager Agent**（项目经理） | 阶段四 | 全部已定稿设计文档 | `docs/PLAN.md`、追加 `AGENTS.md` 任务规范 |

每个角色启动新的 AI 会话，只加载职责范围内的文件。每阶段产物经人类评审定稿后，才能进入下一阶段。

---

## 整体流程

```
阶段一 ───→ 阶段二 ───→ 阶段三 ───→ 阶段四 ───→ 定稿
PM Agent    Architect   Designer     PM Agent     人类审查
SPEC.md     ARCH.md    模块 DESIGN   PLAN.md      锁定全部文档
             AGENTS.md   (串行逐个)  追加 AGENTS    AGENTS.md
                         设计完成                   最终定稿
```

### 核心约束

- 每个阶段以人类明确回复"定稿"为晋级条件
- 阶段三中，模块按依赖顺序串行推进，无依赖模块优先
- 一个模块产出设计文件后即进入人类评审，不等所有模块完成
- 所有文档均使用**中文**编写

---

## 阶段执行契约

### 阶段一：需求规格（PM Agent）

- **角色**：产品经理（PM Agent）
- **上下文**：新会话，无任何预加载文件
- **输入**：人类口述的原始想法
- **输出**：`docs/SPEC.md`
- **行为**：
  1. 使用**中文**在 `docs/SPEC.md` 中生成需求规格初稿
  2. 内容须覆盖：业务背景与目标、功能需求（用户旅程/用例）、数据需求、非功能性约束（性能、安全、兼容性）、边界与排除项
  3. 需求项尽量细化，每条需求可独立理解和验证
  4. 不讨论技术实现方案
  5. 本轮评审通过后，**在 `AGENTS.md` 中追加"质量验收标准"章节**，记录 SPEC.md 中提炼出的全局质量要求（如：响应时间 < 200ms、支持 1000 并发等）
- **晋级条件**：人类明确回复"SPEC.md 定稿"，并提交 Git

### 阶段二：总体架构设计（Architect Agent）

- **角色**：架构师（Architect Agent）
- **上下文**：仅加载 `docs/SPEC.md`（只读）+ `AGENTS.md`（只读，了解质量验收标准）
- **输入**：定稿的 `docs/SPEC.md`、已有的 `AGENTS.md`
- **输出**：`docs/ARCHITECTURE.md`、写入 `AGENTS.md` 主体
- **行为**：
  1. 以 SPEC.md 为唯一上下文，使用**中文**生成 `docs/ARCHITECTURE.md`
  2. `ARCHITECTURE.md` 必须包含以下章节：

     #### 技术栈标准
     明确全系统技术栈、框架版本、构建工具、包管理方式。

     #### 全局编码规范
     命名风格（如 camelCase）、文件组织结构、错误返回格式（Error Envelope）、日志规范。

     #### 模块引用表
     以表格列出所有模块及其两位数字编号，格式：
     ```markdown
     ## 模块引用表
     | 编号 | 模块名 | 功能简述 | 详细设计 |
     |------|--------|----------|----------|
     | 01 | auth | 用户认证 | docs/modules/01-auth/DESIGN.md |
     | 02 | task-core | 任务核心 | docs/modules/02-task-core/DESIGN.md |
     ```
     - **编号** = 两位数字，与模块目录名一致
     - **模块名** = 英文短名，与目录名一致
     - **详细设计** = 指向该模块 DESIGN.md 的引用路径

     #### 模块依赖矩阵
     ```markdown
     ## 模块依赖矩阵
     | 模块 | 依赖 | 所需接口 |
     |------|------|----------|
     | 02-task-core | 01-auth | POST /auth/verify |
     | 03-api-gateway | 01-auth, 02-task-core | … |
     ```

     #### 公共设计
     跨模块共用的设计决策：认证方案、数据流拓扑、部署架构概览（如适用）。

  3. <span id="arch-design-boundary"></span>**重要职责边界**：`ARCHITECTURE.md` 只写整体架构和公共设计，具体的模块内部设计放在对应模块的 `DESIGN.md` 中。`ARCHITECTURE.md` 中通过模块引用表引用到各 `DESIGN.md`，这样编码阶段的开发者只需要阅读 `AGENTS.md` + `ARCHITECTURE.md`（公共部分）+ 当前模块的 `DESIGN.md`

  4. **写入 `AGENTS.md` 主体**，以"## "为章节标题追加以下章节：
     - 文件操作范围（AI 可读/可写的目录白名单）
     - 提交规范（Commit 消息格式）
     - 测试要求（最小覆盖率、必须通过的测试范围）
     - 升级条件（什么情况下暂停并请求人类介入）
     - 跨模块规则（允许读取的模块接口文件列表等）
- **晋级条件**：人类明确回复"ARCHITECTURE.md 定稿"，并提交 Git

### 阶段三：模块详细设计（Designer Agent）

- **角色**：模块设计师（Designer Agent）
- **上下文**：`ARCHITECTURE.md` + `AGENTS.md`（了解质量标准和规则）+ 被依赖模块的 `DESIGN.md`（只读接口章节）
- **输入**：定稿的 `ARCHITECTURE.md`、`SPEC.md`
- **输出**：`docs/modules/{NN}-{name}/DESIGN.md`
- **前置条件**：人类明确指定当前要设计的模块名
- **行为**：
  1. **按依赖顺序串行**：先做无依赖模块，再做有依赖模块。一次只做一个模块
  2. **创建模块目录**：`docs/modules/{NN}-{name}/`，其中 `NN` 和 `name` 必须与 `ARCHITECTURE.md` 模块引用表严格一致
  3. **在模块目录下生成 `DESIGN.md`**，使用**中文**，内容须包含：
     - 模块概述与职责边界
     - 核心数据结构（概念模型、实体字段、关系，不含具体 DDL）
     - 接口定义（入参、出参、错误码）
     - 核心逻辑流程 / 状态机（可选）
     - 该模块需要实现的功能特性列表（feature list），每条以 `### F-{NNN}` 编号

     示例：
     ```markdown
     ### F-001: 用户注册接口
     实现 `POST /auth/register` 端点，接收邮箱+密码，返回 token。

     ### F-002: 用户登录接口
     实现 `POST /auth/login` 端点，验证凭证，返回 token。
     ```

  4. **标准继承**：所有字段命名和异常处理必须 100% 继承 `ARCHITECTURE.md` 的规范
  5. **只读约束**：读取被依赖模块的 `DESIGN.md` 时，只允许读取接口定义章节，不允许读取内部实现细节
  6. **不予许设计师写入 `AGENTS.md`**——设计师发现的模块专属约束写在 `DESIGN.md` 中即可，只有全局性约束才进入 `AGENTS.md`，而这种约束在架构阶段已被定义
- **晋级条件**：人类对该模块的 DESIGN.md 微评审通过，明确回复"{模块名}设计定稿"，并提交 Git。然后才能进入下一个模块的设计

### 阶段四：任务计划（Project Manager Agent）

- **角色**：项目经理（Project Manager Agent）
- **上下文**：全部已定稿文档（`SPEC.md`、`ARCHITECTURE.md`、各模块 `DESIGN.md`、`AGENTS.md`）
- **输入**：所有已定稿的设计文档
- **输出**：`docs/PLAN.md`、追加 `AGENTS.md`
- **行为**：
  1. 阅读所有已定稿的 `DESIGN.md`，提取每个模块中的 F-{NNN} 特性列表
  2. 在 `docs/PLAN.md` 中生成**任务跟踪表**。每个任务须包含：
     - `[ ]` 未完成 / `[x]` 已完成
     - 任务 ID（`T-{NNN}`）
     - 任务描述（简述，**不涉及方案细节**——方案细节在 DESIGN.md 中）
     - **引用到 DESIGN.md 的具体章节**（格式：`[01-auth/DESIGN.md#F-001]`）
     - 依赖关系（如有）

     格式示例：
     ```markdown
     ## 模块：01-auth
     - [ ] T-001: 实现用户注册接口 [01-auth/DESIGN.md#F-001]
     - [ ] T-002: 实现用户登录接口 [01-auth/DESIGN.md#F-002] depends: T-001
     ```

  3. **不涉及方案细节**——PLAN.md 是纯粹的任务跟踪，不写如何实现、不写技术细节
  4. 按模块分组，同一个模块的任务连续排列
  5. 任务按依赖关系拓扑排序
  6. **追加 `AGENTS.md`**：在 AGENTS.md 末尾追加"PLAN.md 任务规范"章节，说明 PLAN.md 的格式、任务标记规则、引用约定
- **晋级条件**：人类明确回复"PLAN.md 定稿"，并提交 Git

### 最终定稿（人类）

- 人类审查全部 5 类文档的完整性和一致性
- 确认 `AGENTS.md` 已覆盖编码阶段所需的所有指引
- **锁定 `AGENTS.md`**，作为编码阶段的入口文件
- 提交 Git，标记 OpenSDD 阶段完成，准备进入编码阶段

---

## 变更传播协议

当需求或设计需要修改时：

1. **标记影响范围**：评估受变更影响的文档（SPEC / ARCH / DESIGN / PLAN）
2. **保存旧状态**：在当前分支 `git add -A && git commit -m "snapshot: pre-change backup"`
3. **修改源头文档**：从受影响的最上游文档开始修改（如需求变更 → SPEC.md；架构变更 → ARCHITECTURE.md）
4. **级联更新**：
   - `SPEC.md` 变更 → 评审是否需要更新 `ARCHITECTURE.md` → 受影响模块的 `DESIGN.md`
   - `ARCHITECTURE.md` 变更 → 评审各 `DESIGN.md` 是否需要同步更新
   - `DESIGN.md` 变更 → 更新 `PLAN.md` 中的引用关系，确保 `[NN-name/DESIGN.md#F-NNN]` 可追溯链完整
5. **重新评审**：仅重新评审受影响的文档和模块

---

## 与编码阶段的关系

本技能产出的 5 类文档作为编码阶段的契约依据：

- 编码阶段的 AI 开发者**必须先读取 `AGENTS.md`** 了解项目规则
- 然后根据当前要开发的模块，读取 `ARCHITECTURE.md`（公共设计部分）+ 对应模块的 `DESIGN.md`
- 通过 `PLAN.md` 了解任务优先级和完成状态
- 严格遵循 `DESIGN.md` 中的接口定义和数据结构实现代码
- **跨模块接口变更必须升级给人类仲裁**，不允许编码阶段私自修改接口契约

---

## 核心禁令

- **禁止越权**：PM 不讨论技术方案，Architect 不写模块设计细节，Designer 不写代码，Project Manager 不修改设计内容
- **禁止创建垃圾文件**：不允许创建 `_v2.md`、`_final.md`、`.bak.md` 等版本残留文件，一律物理覆盖
- **禁止跨模块注意力污染**：Designer 在设计模块 A 时只允许读取被依赖模块的接口部分
- **禁止脱离引用**：PLAN.md 的每条任务必须引用对应 `DESIGN.md` 的章节
- **禁止 AI 操作远程仓库**：仅允许 `git add` 和 `git commit`，不允许创建/切换分支，不允许 `push`、`merge`、`rebase`
- **文档语言**：所有文档使用中文编写

---

## 各阶段会话启动提示词模板

### 阶段一：启动 PM Agent

```
请读取 SKILL.md。
我的新项目是：[一句话描述]。
请以产品经理（PM Agent）角色启动阶段一。
在 docs/SPEC.md 中使用中文生成需求规格初稿。
请严格按照技能规范执行，不讨论技术实现。
```

### 阶段二：启动 Architect Agent

```
请读取 SKILL.md。
请以架构师（Architect Agent）角色启动阶段二。
读取 docs/SPEC.md（只读）。
使用中文生成 docs/ARCHITECTURE.md。
按照技能规范追加 AGENTS.md 主体章节。
请严格按照技能规范执行，不写模块细节、不写代码。
```

### 阶段三：启动 Designer Agent

```
请读取 SKILL.md。
请以模块设计师（Designer Agent）角色启动阶段三。
读取 docs/ARCHITECTURE.md。
当前要设计的模块是：[模块名，如 01-auth]。
使用中文在 docs/modules/{NN}-{name}/ 下生成本模块的 DESIGN.md。
特征列表以 F-{NNN} 编号。
请严格按照技能规范执行，一次只做一个模块。
```

### 阶段四：启动 Project Manager Agent

```
请读取 SKILL.md。
请以项目经理（Project Manager Agent）角色启动阶段四。
读取所有已定稿的 docs/SPEC.md、docs/ARCHITECTURE.md、docs/modules/*/DESIGN.md。
在 docs/PLAN.md 中使用中文生成任务跟踪表。
每条任务引用对应 DESIGN.md 的 F-{NNN} 章节。
追加 AGENTS.md 的 PLAN.md 任务规范章节。
请严格按照技能规范执行，不涉及方案细节。
```
