@echo off
chcp 65001 >nul
title Relais du mentor IA
cd /d "%~dp0"
node --env-file=cles.env serveur.mjs
echo.
pause
