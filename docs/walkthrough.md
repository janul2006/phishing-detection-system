# Changes and Fixes Applied

I have completed the requested polishing and the confidence value integration. Since I incorporated a dark/light mode adaptable layout utilizing modern CSS strategies, here is a summary of all the implementations!

## 1. Backend Confidence Tracking

- **Modified** [main.py](file:///d:/IIT/phishing-detection-system/ai_service/main.py)  
  Added the machine learning model’s probability extraction using `model.predict_proba()`. The `/predict` endpoint now calculates the probability of the prediction and includes it as a `confidence` field alongside the prediction result. It maps accurately to your Laravel backend (which was already equipped to receive this property!).

## 2. Dynamic, Premium Styling

- **Modern Aesthetic**: Replaced standard Vite CSS templates with custom styling from the ground up focusing heavily on dynamic gradients, layout grids, shadows, and glassmorphism.
- **Dark/Light Mode Toggle**: Built a dynamic `theme` variable inside the application root (`App.jsx`) tied to a sun/moon floating button on the upper right, switching between specific CSS attribute hooks inside `index.css`.
- **Animations**:  
  - The Scan URL button pulses smoothly when disabled while scanning.
  - Hover states on glass cards implement a physical levitation look (scale/translate lifting with drop shadow increments).
  - Background has an animated dynamic radial gradient that smoothly orbits.

## 3. UI Component Rework

- **[History Table](file:///d:/IIT/phishing-detection-system/frontend/src/components/HistoryTable.jsx)**: Refined from raw grid templates into a rounded data grid equipped with dedicated "Status Badges" for _Safe_ vs _Phishing_ scenarios. We also added the **Confidence** column to expose the backend calculations here.
- **[Result Card](file:///d:/IIT/phishing-detection-system/frontend/src/components/ResultCard.jsx)**: Overhauled completely from colored DIV blobs into a sleek glassy interface.
  - **Confidence Progress Bar**: Integrated a bar graph that dynamically reveals the severity of the scan confidence.
- **[Header area](file:///d:/IIT/phishing-detection-system/frontend/src/App.css)**: Set up the application icon layout block as a colored box, ready for you to replace the text inner-emoji with your image logo per our discussion.

> [!TIP]
> The logo has been set inside `App.jsx` under the `div className="logo-placeholder"`. When you bring up your logo file, simply substitute the `<span>🛡️</span>` snippet with an `<img />` pointing to your asset!
