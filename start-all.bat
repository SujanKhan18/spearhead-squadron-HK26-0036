@echo off
echo ==============================================
echo   Starting Safe-Era Women Safety Application
echo ==============================================

start "Safe-Era Backend" cmd /k "cd backend && npm start"
start "Safe-Era Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Safe-Era is starting up:
echo   - Backend:  http://localhost:5001
echo   - Frontend: http://localhost:5173
echo.
