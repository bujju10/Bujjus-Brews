# Security Policy

## Supported Versions

Currently, only the latest commit on the `main` branch receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |
| Older   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please prioritize responsible disclosure. **Do not open a public GitHub issue.** Instead, please report the vulnerability privately via email to: **nishanthpravasthi@gmail.com**

Please include the following in your report:
* A clear description of the vulnerability.
* Step-by-step instructions to reproduce the issue.
* The potential impact of the vulnerability.

I will acknowledge receipt of your vulnerability report within 48 hours and strive to implement a patch or mitigation strategy promptly.

## API Key & Secrets Architecture

Because this is a static front-end application hosted via GitHub Pages, backend secret management is not natively supported. 

**Contributors and Fork Maintainers:**
1. **Never commit API keys** (such as the Google Gemini API key) to this public repository.
2. All local keys must be stored in `config.js`.
3. Ensure the `.gitignore` file remains active and continues to exclude `config.js` from version control.
4. If an API key is accidentally committed, consider it compromised and revoke it immediately via the Google AI Studio dashboard.
