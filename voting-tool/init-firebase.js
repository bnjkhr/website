// Firebase initialization script - run once to create demo apps
const admin = require('firebase-admin');

// Initialize Firebase Admin (make sure to set environment variables)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

async function initializeApps() {
  const demoApps = [
    {
      name: 'Datenplaner V2',
      description: 'Tool zur Verwaltung und Planung von Datenprojekten'
    },
    {
      name: 'Gym App',
      description: 'Fitness-Tracking und Workout-Planung'
    },
    {
      name: 'Website',
      description: 'Persönliche Website und Portfolio'
    }
  ];

  console.log('Creating demo apps...');

  for (const app of demoApps) {
    try {
      const docRef = await db.collection('apps').add(app);
      console.log(`✅ Created app: ${app.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Error creating app ${app.name}:`, error);
    }
  }

  console.log('Demo apps initialization complete!');
  process.exit(0);
}

// Check if apps already exist
async function checkAndInit() {
  try {
    const appsSnapshot = await db.collection('apps').limit(1).get();

    if (appsSnapshot.empty) {
      console.log('No apps found. Initializing demo apps...');
      await initializeApps();
    } else {
      console.log('Apps already exist. No initialization needed.');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error checking apps:', error);
    process.exit(1);
  }
}

checkAndInit();