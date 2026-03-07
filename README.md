# Priority Planner 

A high-performance, mobile-first daily planner and habit tracker built with React Native. 

Designed to bridge the gap between long-term planning and daily execution, this application features rule-based task recurrence, dynamic tagging, and on-device data persistence.

## 🚀 Key Features

* **Rule-Based Recurrence:** Users can assign specific days of the week to a task (e.g., M/W/F). The application uses dynamic filtering to surface these tasks automatically on the correct days without database bloat.
* **Lazy-Evaluated Task Resets:** Recurring tasks automatically "uncheck" themselves at midnight. This is handled via lazy evaluation—storing arrays of completed timestamps rather than relying on heavy, battery-draining background cron jobs.
* **Dynamic Custom Tagging:** Users can generate custom tags on the fly (e.g., "Graph Theory", "Gym", "Job Hunt"). The app instantly computes a unique `Set` of all active tags and renders them as clickable filter chips.
* **Multi-Dimensional Filtering:** Tasks can be instantly filtered by priority tier (P1, P2, P3) or by user-generated tags.
* **Native OS Integration:** Leverages the device's native haptic engine for tactile feedback during CRUD operations, and utilizes native OS keyboard dictation for seamless Speech-to-Text input.

## 🧠 Technical Architecture

As a developer, my primary focus was balancing a fluid UI with scalable state management. 

* **Global State (Context API):** I opted for React's Context API over Redux. Given the centralized nature of the `Task` data array, Context provided the perfect balance of global accessibility across the "Today" and "Calendar" tabs without introducing unnecessary boilerplate.
* **Data Persistence (AsyncStorage):** The app features a custom `useEffect` hook layer inside the Context Provider that continuously syncs the active state to the device's local memory using `@react-native-async-storage/async-storage`. This ensures zero data loss across app restarts.
* **Optimized Rendering:** The `SwipeListView` component is configured to prevent clipping during layout animations, ensuring that checking off or deleting a task results in a buttery-smooth 700ms UI glide rather than a jarring snap.

## 🛠️ Built With

* **Framework:** React Native / Expo
* **Language:** TypeScript
* **Storage:** AsyncStorage
* **UI Components:** React Native Calendars, SwipeListView
* **Hardware APIs:** Expo Haptics

## 💻 Running Locally

To run this project on your own machine:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the Expo server: `npx expo start`
4. Scan the QR code with the Expo Go app on your physical iOS or Android device.