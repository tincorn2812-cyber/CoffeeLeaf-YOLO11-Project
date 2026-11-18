@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo   KHOI DONG HE THONG CAFELEAF AI (FASTAPI 8000 + WEB 8080)
echo ============================================================

REM 1. Giai phong cong 8000 (FastAPI) va 8080 (Spring Boot) neu dang bi chiem
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [+] Dang tat tien trinh cu tren cong 8000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo [+] Dang tat tien trinh cu tren cong 8080 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

REM 2. Khoi dong FastAPI AI Microservice (Port 8000) trong cua so moi
echo [+] Dang khoi dong FastAPI AI Microservice tai http://localhost:8000 ...
start "CafeLeaf AI Microservice (Port 8000 - Swagger /docs)" cmd /k "cd /d ""%~dp0.."" && .\venv\Scripts\python.exe -m uvicorn api_server:app --host 0.0.0.0 --port 8000"

REM 3. Cho 2 giay de FastAPI nạp model vao RAM truoc khi Web bat
timeout /t 2 /nobreak >nul

REM 4. Khoi dong Web Spring Boot tai http://localhost:8080
echo [+] Dang khoi dong Web Spring Boot tai http://localhost:8080 ...
call .\mvnw.cmd spring-boot:run
pause
