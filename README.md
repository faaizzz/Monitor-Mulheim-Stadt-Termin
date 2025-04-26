# Mulheim Stadt Termin TS

This project is designed to automate and test various functionalities related to the Mulheim Stadt Termin system using Playwright. It includes test cases for different scenarios and generates reports for test results.

## Project Structure

```
example.spec.ts
package.json
playwright.config.ts
media/
    beep-extended.mp3
    beep.wav
playwright-report/
    index.html
test-results/
tests/
    extend-rp.spec.ts
    invite-friends-family.spec.ts
    request-pr-skilled-worker.spec.ts
    ummeldung-abmeldung.spec.ts
tests-examples/
    demo-todo-app
```

### Key Files and Directories

- **example.spec.ts**: Example test specification.
- **package.json**: Contains project dependencies and scripts.
- **playwright.config.ts**: Configuration file for Playwright.
- **media/**: Contains media files used in tests.
- **playwright-report/**: Stores the generated test reports.
- **test-results/**: Contains test result artifacts.
- **tests/**: Directory containing test specifications for various scenarios.
- **tests-examples/**: Example tests for demonstration purposes.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd mulheim-stadt-termin-ts
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running Tests

To execute all tests, run:
```bash
npx playwright test
```

To run a specific test file, use:
```bash
npx playwright test tests/<test-file-name>.spec.ts
```

## Generating Reports

After running tests, a report will be generated in the `playwright-report/` directory. To view the report, open the `index.html` file in a browser:
```bash
open playwright-report/index.html
```

## Media Files

The `media/` directory contains audio files used during test execution, such as notification sounds.

## Example Tests

The `tests-examples/` directory includes example tests, such as the `demo-todo-app`, to demonstrate Playwright's capabilities.

## Contributing

Feel free to submit issues or pull requests to improve this project.

## License

This project is licensed under the MIT License.