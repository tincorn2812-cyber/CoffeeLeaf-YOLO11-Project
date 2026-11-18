@echo off
chcp 65001 >nul
title CafeLeaf AI - Tạo Link Công Khai (Cloudflare Tunnel)

echo ============================================================================
echo   CAFELEAF AI - TẠO LINK TRUY CẬP CHO NGƯỜI KHÁC QUA INTERNET
echo ============================================================================
echo.
echo [*] Đang kiểm tra kết nối với Web Server (Port 8080)...
netstat -ano | findstr ":8080" >nul
if %errorlevel% neq 0 (
    echo [CANH BAO] Web Server Spring Boot chua duoc bat tren port 8080!
    echo Vui long chay file "khoi_dong_he_thong.bat" truoc khi tao link.
    echo.
)

echo [*] Dang tao duong dan cong khai HTTPS bao mat qua Cloudflare...
echo [*] Link co the gui cho ban be, thay co mo tren dien thoai bat ky dau...
echo ============================================================================
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8080
pause
