modify the dropdown content by fetching data from the DB
# Set personal as default
git config user.name "InduwaraSMPN"
git config user.email "pasindunaduninduwara@gmail.com"

remove the test endpoints


ssh-keygen -t ed25519 -C "pasindunaduninduwara@gmail.com" -f ~/.ssh/id_ed25519_InduwaraSMPN



continue...
Implement a comprehensive user management system for the admin dashboard at http://localhost:3002/dashboard/users that allows managing ALL users in the quota.app system, not just vehicle owners. Requirements: 1. **User Types to Manage**: The system should handle all three user types: - Vehicle owners (from vehicle_owners table) - Fuel station owners (from station_owners table) - Admin users (from admin_users table) 2. **Core Functionality**: - Display a unified list of all users with their type, status, and key information - Implement search and filtering by user type, status, and other relevant fields - Provide actions to view, edit, activate/deactivate, and delete users 3. **Backend Integration**: - Create or update backend API endpoints to fetch all user types - Ensure proper authentication and authorization for admin-only access - Use the PostgreSQL database connection string: "postgresql://admindatabasequotaapp:zNAj8TWuTh6:mfA@databasequotaapp.postgres.database.azure.com/database.quota.app?sslmode=require" Replace any existing mock data with real database queries and implement proper error states when API calls fail.