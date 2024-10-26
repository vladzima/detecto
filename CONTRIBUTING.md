# Contributing to Detecto

First of all, thank you for taking the time to contribute! 🎉

## Getting Started

1. **Fork** the repository and **clone** your fork locally:
   ```bash
   git clone https://github.com/vladzima/detecto.git
   cd detecto
   npm install
   ```

2. Make sure you have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/get-npm) installed.

3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes in the new branch.
2. **Test** your changes before submitting a PR:
   ```bash
   npm run test
   ```
3. Run **linting** to ensure code style:
   ```bash
   npm run lint
   ```

4. Once you're done, **commit** your changes using Commitizen:
   ```bash
   git add .
   npm run commit
   ```
   - We use [Commitizen](https://github.com/commitizen/cz-cli) to ensure consistent commit messages. Follow the prompts to create a meaningful commit message.

5. **Push** your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** (PR) on GitHub:
   - Include a detailed description of your changes.
   - Reference related issues if applicable.

## Code Style Guidelines

- We follow [ESLint](https://eslint.org/) for consistent code quality.
- Please ensure your code matches the existing formatting and conventions.

## Reporting Issues

If you encounter any bugs or have feature requests, please [open an issue](https://github.com/YOUR_USERNAME/detecto/issues).

---

Thanks for helping to make Detecto better! 💡
