@echo off

rem Navigate to the project root
cd /d "C:\Users\brian\OneDrive\Desktop\UPFYP\Start\cold_room_project"

rem Activate the virtual environment
call venv\Scripts\activate.bat

rem Start the Flask backend in a new command prompt window
start cmd /k "python app.py"

rem Navigate to the frontend directory
cd frontend

rem Start the React app in a new command prompt window
start cmd /k "npm start"

rem Exit the batch file
exit
