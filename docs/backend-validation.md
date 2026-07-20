# Backend Validation

This document lists the local validation steps used after backend router changes.

## Python Compile Checks

```powershell
python -m py_compile .\backend\app\routers\topics.py
python -m py_compile .\backend\app\routers\users.py
python -m py_compile .\backend\app\routers\learning_logs.py
python -m py_compile .\backend\app\routers\resources.py
python -m py_compile .\backend\app\main.py