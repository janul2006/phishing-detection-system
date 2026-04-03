# Phishing Detection System Polish Plan

This plan addresses two improvements requested: fixing the missing confidence value from the machine learning backend, and polishing the UI to remove template CSS and introduce a premium, modern design.

## User Review Required

> [!WARNING]
> Please review the design choices for the frontend polish. I intend to use a modern dark/light mode adaptable "glassmorphism" style with vibrant gradient accents. If you have any specific color or aesthetic preferences, please let me know before I proceed!

## Proposed Changes

---

### Backend (AI Service)

We need to return the model's prediction confidence so it can be passed all the way through to the frontend.

#### [MODIFY] [main.py](file:///d:/IIT/phishing-detection-system/ai_service/main.py)
- Use `model.predict_proba(input_data)` to extract the probability.
- Calculate confidence as `max(probabilities) * 100`.
- Include the `confidence` field in the `/predict` FastAPI endpoint response.

---

### Frontend Components

The React UI will be overhauled to make use of modern CSS and animations, and to display the newly available confidence metric.

#### [MODIFY] [App.jsx](file:///d:/IIT/phishing-detection-system/frontend/src/App.jsx)
- Update layout structure to support the modern design layout.

#### [MODIFY] [ScanForm.jsx](file:///d:/IIT/phishing-detection-system/frontend/src/components/ScanForm.jsx)
- Implement a floating-label input style with modern focus outline.
- Add micro-animations structure to the scan button (e.g. pulse effect when scanning).

#### [MODIFY] [ResultCard.jsx](file:///d:/IIT/phishing-detection-system/frontend/src/components/ResultCard.jsx)
- Transform into a sleek, glass-like card.
- **New Feature**: Render the `confidence` value prominently using a dynamic score/progress indicator.

#### [MODIFY] [HistoryTable.jsx](file:///d:/IIT/phishing-detection-system/frontend/src/components/HistoryTable.jsx)
- Refine the table into a sleek, responsive data grid.
- Include a new "Confidence" column mapping to `scan.confidence`.

---

### Global Styling

#### [MODIFY] [index.css](file:///d:/IIT/phishing-detection-system/frontend/src/index.css) & [App.css](file:///d:/IIT/phishing-detection-system/frontend/src/App.css)
- Remove all default Vite template CSS.
- Establish a global CSS variable system with premium color palettes (backgrounds, surfaces, vibrant accents like vivid purple/blue gradients).
- Add utility micro-animations.

## Open Questions

1. Should we add any specific logo or branding elements to the header?
2. Are you fine with a dark mode default, or prefer a specific light theme?

## Verification Plan

### Automated Tests
- Test the FastAPI `/predict` payload via a cURL command or python script.

### Manual Verification
- Start the `node` (Vite) server and view the frontend.
- Enter a test URL to ensure both the confidence value is successfully calculated and returned, and the UI looks premium with working animations.
