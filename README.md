# Plant Pal – Frontend 🌱

This is the frontend application for **Plant Pal**, my Ada Developers Academy capstone project.

Built with React, TypeScript, and React Router, it provides the user interface for managing plants, viewing weather alerts, and interacting with AI-generated plant data.

- **Main Capstone Repository:** [Plant Pal Main – Project Scope + Information](https://github.com/johendrickson/capstone)
- **Backend Repository:** [Plant Pal Backend – Flask API and database services](https://github.com/johendrickson/capstone-backend)

---

## Features

- **Responsive UI** – Clean, accessible interfaces for desktop and mobile.
- **Plant Management** – Add, edit, and view plants with AI autofill suggestions.
- **Weather Alerts & Reminders** – Displays alerts and reminders fetched from backend APIs.
- **Routing with React Router** – Smooth navigation between pages without reloads.
- **TypeScript** – Strongly typed components and API interactions.
- **Image Uploads** – Upload and display plant photos.
- **Tagging System** – Add and remove tags for plant categorization.

---

## Tech Stack

- **Framework:** React (Create React App)  
- **Language:** TypeScript  
- **Routing:** React Router  
- **Styling:** CSS Modules / Styled Components
- **API Client:** Axios and/or Fetch API for HTTP requests


---

## Environment Variables

The frontend uses the following environment variable:  

```env
REACT_APP_API_BASE_URL=https://example.com
```

Replace this URL with your backend API URL for local development or other environments.

## Local Setup

1. Clone the repository
```bash
  git clone https://github.com/your-username/plant-pal-frontend.git
  cd plant-pal-frontend
```

2. Install dependencies
```bash
  npm install
  # or
  yarn install
```

3. Create and configure .env

  Add your backend API base URL as shown above.

4. Start the development server
   
```bash
  npm start
  # or
  yarn start
```

---
## Testing

  Run tests with:
  
```bash
  npm test
  # or
  yarn test
```
