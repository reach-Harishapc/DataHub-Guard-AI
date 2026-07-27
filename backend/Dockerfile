FROM python:3.12-slim

WORKDIR /app

# System dependencies for python packages if any
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend source code
# Since main.py expects to be run with `backend.main`, we copy it inside a backend directory
COPY . /app/backend

# Ensure Python path is set so it can resolve "backend.main"
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
