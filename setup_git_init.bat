@echo off
REM setup_git_init.bat - Configure git and initialize repository for MindMate
REM USAGE: Run this from an elevated or normal Command Prompt: C:\mindmate\setup_git_init.bat

echo Checking for git...
ngit --version 2>nul
if %errorlevel% neq 0 (
  echo Git is not found in PATH. Please install Git: https://git-scm.com/download/win
  pause
  exit /b 1
)
echo Git found.

:: Configure user if not already set
ngit config --global user.name 1>nul 2>nul
if %errorlevel% neq 0 (
  echo Setting git user.name and user.email
ngit config --global user.name "yes4"
ngit config --global user.email "202310975@gordoncollege.edu.ph"
) else (
  echo Global git user already configured:
  git config --global user.name
  git config --global user.email
)

:: Initialize repo if not already a git repo
nif exist .git (
  echo Repository already initialized.
) else (
  echo Initializing git repository...
  git init
n)

:: Add and commit
necho Adding files...
ngit add .
echo Committing...
ngit commit -m "Initial commit from setup script" 2>nul
nif %errorlevel% neq 0 (
  echo No changes to commit or commit failed.
) else (
  echo Commit created.
)
echo Done.
pause
