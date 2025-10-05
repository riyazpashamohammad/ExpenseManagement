npx expo start (or npx expo start -c)
eas update --> to build
# ExpenseTrackerTS

ExpenseTrackerTS is a cross-platform expense management app built with React Native, Expo, and TypeScript. It allows users to track expenses, view reports, and manage users/groups with Firebase backend integration.

## Features
- User authentication (Firebase)
- Add, edit, and view expenses
- Dashboard with summary and charts
- Expense reports (daily, monthly, yearly, category-wise)
- Group and user management (admin only)
- Notifications
- Custom themes and UI

## Screens
- **LoginScreen**: User authentication
- **DashboardScreen**: Overview of expenses and quick actions
- **AddExpenseScreen**: Add new expense with details
- **ReportScreen**: Visualize expenses with charts and summaries
- **UserManagementScreen**: Admin management of users and roles
- **NotificationsScreen**: View app notifications

## Tech Stack
- React Native (Expo)
- TypeScript
- Firebase (Auth, Firestore)
- React Navigation
- React Native Paper
- Chart libraries: react-native-chart-kit, victory-native

## Setup & Installation
1. Install dependencies:
	```bash
	npm install
	```
2. Start the development server:
	```bash
	npx expo start
	# or to clear cache
	npx expo start -c
	```
3. Build with EAS (Expo Application Services):
	```bash
	eas update
	# or use eas build for production builds
	eas build --platform android --profile preview    for preview apk
	```

## Project Structure
- `ExpenseTrackerTS/`
  - `src/`
	 - `components/` - Reusable UI components
	 - `context/` - Auth and notification context providers
	 - `hooks/` - Custom hooks for expenses and reports
	 - `navigation/` - App navigation setup
	 - `screens/` - Main app screens
	 - `services/` - Firebase integration
	 - `theme/` - Theme and styles
	 - `types/` - TypeScript types

## Firebase Setup
Update `src/services/firebase.ts` with your Firebase config if deploying your own instance.

## Contributing
Pull requests and issues are welcome!

## License
MIT


## Publishing to Google Play Store
To publish this app to the Play Store, follow these steps:
1. **Update app details**: Edit `app.json` and `eas.json` with your app name, icon, and other metadata.
2. **Generate a signed APK/AAB**:
	- Run `eas build --platform android --profile production` for a production build.
	- Download the build artifact from Expo.
3. **Prepare Play Store assets**:
	- App icon (512x512 PNG)
	- Feature graphic (1024x500 PNG)
	- Screenshots (min. 2, recommended 5-8)
	- Short and long app descriptions
	- Privacy policy URL
4. **Create a developer account**: Register at [Google Play Console](https://play.google.com/console).
5. **Upload your APK/AAB**: Follow Play Console instructions to upload, fill in app details, and submit for review.
6. **Set up privacy and policies**: Ensure your app complies with Google Play policies, including data privacy and user consent.
7. **Release and monitor**: After approval, monitor crash reports and user feedback for future updates.

For more details, see the [official Expo guide](https://docs.expo.dev/submit/android/) and [Google Play launch checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist).