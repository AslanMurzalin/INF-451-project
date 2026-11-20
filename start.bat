@echo off
title Launch Student Feedback System (Sprint 5)
echo ==========================================================
echo Starting AI-Enhanced Student Feedback Analysis System
echo ==========================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Backend - FastAPI" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

ping 127.0.0.1 -n 3 >nul

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "Frontend - Vite" cmd /k "cd /d %~dp0frontend && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

ping 127.0.0.1 -n 4 >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo System launched successfully!
echo - Frontend URL: http://localhost:5173
echo - Backend API: http://127.0.0.1:8000/docs
echo.
pause
