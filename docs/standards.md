# Phase 13 & 14: System Standards & GitHub open Source Guides

This guide establishes the development guidelines, version control practices, deployment check sheets, and GitHub community standards.

---

### Part 1: GitHub open Source Standards

#### 1. Code of Conduct
We adopt the Contributor Covenant v2.1.
* **Our Pledge**: To provide a welcoming, hostile-free, and supportive environment for all contributors, regardless of experience level, identity, or background.
* **Our Standards**: Active listening, professional collaboration, constructive feedback, and polite interaction. Unacceptable behaviors include harassment, personal attacks, and non-consensual physical contact or advances.

#### 2. Contributing Guidelines
* **Branch Strategy**: Fork, clone, branch off `main` using prefix `feature/`, `bugfix/`, or `docs/`.
* **Coding Standards**: All code must conform to ES6 specifications, use clean ESLint rules, and pass test scripts.
* **Pull Request Rules**:
  - Link a corresponding issue.
  - Include screenshots for visual changes.
  - Complete the PR template.
  - Ensure 100% build tests pass.

#### 3. Bug Report Template
```markdown
---
name: Bug report
about: Create a report to help us improve.
title: "[BUG] "
labels: bug
assignees: ''
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error '...'

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment details:**
 - OS: [e.g. Windows, macOS]
 - Browser: [e.g. Chrome, Firefox]
 - Node Version: [e.g. v18.16.0]
```

#### 4. Pull Request Template
```markdown
## Description
Provide a summary of the changes and the issues solved.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Please describe the tests that you ran to verify your changes.

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] New and existing unit tests pass locally with my changes
```

---

### Part 2: Git Workflow & Semantic Commits

We follow the **Angular Commit Message Convention**:
`<type>(<scope>): <subject>`

* **`feat`**: A new feature (e.g., `feat(ui): add rating component to feedback modal`).
* **`fix`**: A bug fix (e.g., `fix(api): escape special characters in prompt builder`).
* **`docs`**: Documentation changes (e.g., `docs(readme): add installation steps for Vite`).
* **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons).
* **`refactor`**: A code change that neither fixes a bug nor adds a feature.
* **`perf`**: A code change that improves performance.
* **`test`**: Adding missing tests or correcting existing tests.

---

### Part 3: Project Roadmap & Release Strategy

#### Milestone 1: Requirement Analysis & Design (Week 1)
- Complete system architecture design.
- Define database entity relationships.
- Establish baseline prompt definitions.

#### Milestone 2: API & persistence Core (Week 2)
- Deploy PostgreSQL database schema.
- Implement Express routes, middleware, and AI services.
- Achieve 100% route test coverage.

#### Milestone 3: Interface & Integration (Week 3)
- Connect React views to backend REST controllers.
- Complete responsive layouts and theme controls.
- Conduct integrated verification runs.

#### Milestone 4: Security Audit & Delivery (Week 4)
- Run vulnerability tests.
- Deliver university-grade final reports and internship deliverables.
- Prepare viva answers.
