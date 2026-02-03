# Cactus Fashions - Task Scheduler

A comprehensive Google Apps Script project for managing tasks, scheduling, and workflow tracking for fashion manufacturing operations.

## Project Overview

This system provides a complete solution for managing general tasks and workflows in the fashion industry. It includes features for task creation, priority management, decision tracking, and delegation with a user-friendly interface.

## Key Features

- **Task Management**: Create and track tasks with categories, priorities, and due dates
- **Dynamic Dropdowns**: Auto-populated dropdowns for categories, priorities, decisions, and team members
- **Delegation System**: Assign tasks to specific team members
- **Priority Tracking**: Organize tasks by priority levels (High, Medium, Low)
- **Decision Tracking**: Record decisions made for each task
- **Data Management**: Google Sheets integration for data persistence
- **Responsive UI**: Modern Bootstrap 5 interface with mobile-friendly design
- **Real-time Updates**: Instant task creation and data synchronization
- **Toast Notifications**: User-friendly feedback system for all operations

## Directory Structure

```
src/
├── Code.js                          # Main entry point and routing
├── appsscript.json                  # Apps Script configuration
├── menu.js.js                       # Application menu configuration
├── backend/
│   ├── constants/
│   │   ├── development.js           # Development environment constants
│   │   └── production.js            # Production constants and sheet IDs
│   ├── tasks/
│   │   ├── dropdown.js              # Backend functions for dropdown data
│   │   └── index.js                 # Task management logic
│   └── utils/
│       ├── ScriptError.js           # Custom error handling
│       ├── ScriptResponse.js        # Response formatting utilities
│       ├── SheetManager.js          # Google Sheets operations
│       └── utils.js                 # General utility functions
└── frontend/
    ├── new-task/
    │   ├── index.html               # New task form interface
    │   └── index.js.html           # Frontend JavaScript for task creation
    ├── partials/
    │   ├── head.html                # HTML head section
    │   └── logo.html                # Application logo
    └── utils/
        ├── bootstrap.js.html        # Bootstrap 5 JavaScript
        ├── loaderAndToast.html      # Loading spinner and toast notifications
        ├── toast.js.html            # Toast notification system
        └── utils.js.html            # Frontend utility functions
```

## Core Components

### Backend Modules

- **SheetManager**: Handles all Google Sheets operations (CRUD, data retrieval, updates)
- **Task Dropdown**: Provides data for categories, priorities, decisions, and team member dropdowns
- **Task Index**: Manages task creation, ID generation, and data persistence
- **Utilities**: Common functions for error handling, response formatting, and data manipulation

### Frontend Modules

- **New Task**: Interactive form for creating tasks with validation and real-time feedback
- **Shared Components**: Reusable UI components (toasts, loaders, Bootstrap integration)
- **Utilities**: Frontend helper functions for dropdown population and DOM manipulation

## Task Management Workflow

1. **Task Creation**: Users fill out the new task form with:
   - Category selection
   - Priority level (High, Medium, Low)
   - Task description
   - Due date (optional)
   - Decision tracking
   - Team member delegation

2. **Data Validation**: Frontend validates required fields before submission

3. **Task Storage**: Backend generates unique 4-digit ID and stores task in Google Sheets

4. **Confirmation**: Success notification displayed with form reset

## Data Structure

### Dropdown Data Format

The dropdown sheet contains columns:

- `category`: Task categories (e.g., Design, Production, Quality)
- `priority`: Priority levels (High, Medium, Low)
- `decision`: Decision options (e.g., Approved, Pending, Rejected)
- `delegate to`: Team members (format: "name-email")

### Task Data Format

Tasks are stored with the following fields:

- `id`: Auto-generated 4-digit unique identifier (0001, 0002, etc.)
- `timestamp`: Creation timestamp
- `category`: Task category
- `task`: Task description
- `priority`: Priority level
- `due date`: Task due date
- `decision`: Decision made
- `delegate to`: Assigned team member

## Configuration

- **appsscript.json**: Apps Script project settings, timezone, and runtime configuration
- **production.js**: Sheet IDs and production environment constants
- **.clasp.json**: Deployment configuration (not in repository)

## Scripts

- `format`: Runs Prettier to format code in the `src/` directory
- `postinstall`: Checks and installs clasp globally

## Dependencies

- `@google/clasp`: Google Apps Script CLI tool for deployment
- `prettier`: Code formatting tool for consistent code style

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd scheduler
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Apps Script**:
   - Set up your Google Apps Script project
   - Create a Google Spreadsheet with two sheets: "Dropdowns" and "All Tasks"
   - Update `src/backend/constants/production.js` with your sheet IDs:
     ```javascript
     const SCHEDULER_SS_ID = 'your-spreadsheet-id';
     const DROPDOWN_SHEET = 'Dropdowns';
     const ALL_TASKS_SHEET = 'All Tasks';
     ```
   - Configure `.clasp.json` with your script ID

4. **Setup Dropdown Data**:
   - In the "Dropdowns" sheet, add columns: category, priority, decision, delegate to
   - Populate with your task categories, priority levels, decision options, and team members

5. **Deploy the project**:

   ```bash
   clasp push
   ```

6. **Format code**:
   ```bash
   npm run format
   ```

## Deployment

1. Push changes to Apps Script: `clasp push`
2. Create deployments: `clasp deploy`
3. Manage deployments: `clasp deployments`

## Documentation

For detailed information about clasp commands and deployment, see: [npm-clasp documentation](https://www.npmjs.com/package/@google/clasp)

## Google Sheets Structure

The system uses Google Sheets with the following main sheets:

- **Dropdowns Sheet**: Contains categories, priorities, decisions, and team member data
- **All Tasks Sheet**: Stores all created tasks with timestamps and unique IDs

## Error Handling

- Custom error classes for consistent error reporting
- Toast notifications for user feedback
- Comprehensive logging for debugging
- Graceful error recovery in frontend components
