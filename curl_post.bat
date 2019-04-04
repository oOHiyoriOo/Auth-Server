@echo off
title curl post
set /p url=url:
:start 
echo json on this format: "{\"test\":true}"
set /p json=json: 
curl -X POST -H "Content-Type: application/json" -d %json% %url%
echo.
timeout -nobreak -t 5 > nul
cls
goto :start 