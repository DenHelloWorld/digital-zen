# Documentation

This directory contains documentation for the Digital Zen Chrome extension project.

## Documents

### Installation & Setup

#### [Browser Installation Guide](./browser-installation.md) 🌐

**Purpose:** Complete guide for installing Digital Zen extension in different browsers.

**Contents:**

- Supported browsers (Chrome, Edge, Brave, Firefox, Opera, Vivaldi)
- Step-by-step installation instructions for each browser
- Quick reference table
- Common troubleshooting issues
- Testing across multiple browsers
- Production installation information

**Use this when:**

- Installing the extension for development
- Testing on different browsers
- Troubleshooting installation issues
- Setting up the extension for the first time

---

### Development & Testing

#### [Testing Guide](./testing-guide.md) 🧪

**Purpose:** Complete guide to running and writing tests in the Digital Zen project.

**Contents:**

- Quick start guide
- Running tests (with and without build)
- Test structure and organization
- Writing tests for helpers, components, and services
- Best practices and patterns
- Debugging tests
- Code coverage

**Use this when:**

- Setting up testing environment
- Learning how to run tests
- Understanding test commands and options
- Looking for examples of how to write tests

#### [Testing Best Practices](./testing-best-practices.md) 📋

**Purpose:** Best practices and patterns for testing modern Angular 21+ code.

**Contents:**

- Testing helper functions (pure functions)
- Testing standalone components (DZ_01)
- Testing with Signals (DZ_04)
- Testing with inject() (DZ_02)
- Testing patterns (AAA, organization, async)
- Code coverage goals
- Anti-patterns to avoid

**Use this when:**

- Writing new tests
- Following modern Angular testing patterns
- Ensuring high code quality
- Learning testing best practices

#### [Coding Guidelines](./coding-guidelines.md) 📐

**Purpose:** Complete coding standards and conventions for the Digital Zen project.

**Contents:**

- Angular patterns (standalone components, inject(), OnPush)
- Reactivity with Signals
- Template syntax (built-in control flow)
- TypeScript conventions
- UI text management
- Logging
- Styling with SCSS and BEM

**Use this when:**

- Writing new code
- Reviewing code
- Understanding project patterns
- Ensuring consistency across the codebase

---

### Chrome Web Store Publication

#### [Chrome Web Store Readiness Report](./chrome-web-store-readiness.md)

**Purpose:** Comprehensive research and analysis of the extension's readiness for Chrome Web Store publication.

**Contents:**

- Current state analysis (strengths and weaknesses)
- Chrome Web Store requirements checklist
- Feature completeness analysis
- Store listing content requirements
- Technical requirements and permissions
- Quality & testing requirements
- Localization considerations
- Security & privacy analysis
- Competitive analysis
- Action plan with timeline estimates
- Risk assessment
- Budget considerations
- Resources & references

**Use this when:**

- Planning for Chrome Web Store submission
- Understanding what's missing for publication
- Making strategic decisions about features
- Preparing for the review process

---

### [Publication Checklist](./publication-checklist.md)

**Purpose:** Actionable, condensed checklist for implementing the recommendations from the readiness report.

**Contents:**

- Phase 1: Critical requirements (before submission)
- Phase 2: Recommended improvements (post-launch)
- Phase 3: Future enhancements
- Pre-submission final checklist
- Practical tips for design, screenshots, and submission

**Use this when:**

- Actually working on publication tasks
- Tracking progress toward submission
- Ensuring nothing is forgotten before submitting
- Managing the publication project

---

## How to Use These Documents

### For Installation

1. **Start with [browser-installation.md](./browser-installation.md)** to install the extension in your browser
2. **Follow the step-by-step guide** for your specific browser
3. **Check troubleshooting section** if you encounter issues

### For Developers

1. **Start with [coding-guidelines.md](./coding-guidelines.md)** to understand the coding patterns
2. **Read [testing-guide.md](./testing-guide.md)** to learn how to run and write tests
3. **Follow [testing-best-practices.md](./testing-best-practices.md)** when writing tests
4. **Run `npm run test:ci`** before committing to ensure all tests pass

### For Publication

1. **Start with the Readiness Report** to understand the full scope of what's needed
2. **Use the Publication Checklist** as your daily task list
3. **Check off items** as you complete them
4. **Refer back to the Readiness Report** for detailed guidance on each topic

## Contributing

If you find issues or have suggestions for improving these documents, please:

- Open an issue on GitHub
- Submit a pull request with improvements
- Discuss in team meetings

## Document Maintenance

These documents should be updated:

- When coding patterns or best practices change
- When test infrastructure is updated
- When Chrome Web Store requirements change
- After completing major milestones
- Before each submission/resubmission
- After receiving reviewer feedback

---

**Last Updated:** January 6, 2026
