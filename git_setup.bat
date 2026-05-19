@echo off
REM git_setup_and_push.bat
REM Run this from Command Prompt in C:\mindmate

cd /d C:\mindmate

echo.
echo === Git Configuration ===
git config --global user.name "JhonmarDatio"
git config --global user.email "202310975@gordoncollege.edu.ph"
echo User configured.

echo.
echo === Initializing Repository ===
if exist .git (
  echo Repository already exists.
) else (
  git init
  echo Repository initialized.
)

echo.
echo === Adding Files ===
git add .

echo.
echo === Creating Initial Commit ===
git commit -m "Initial commit"

echo.
echo === Git Status ===
git status

echo.
echo Done! Your repository is ready.
echo.
pause
