# Step 1: Start Spring Boot in current terminal
Set-Location -Path ".\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "mvn spring-boot:run"
Set-Location -Path ".."  # Go back to root

# Step 2: Start bun dev:vehicle in new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "bun run dev:vehicle"

# Step 3: Start bun dev:station in new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "bun run dev:station"

# Step 4: Start bun dev:admin in new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "bun run dev:admin"