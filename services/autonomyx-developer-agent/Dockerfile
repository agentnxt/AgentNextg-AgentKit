FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# git needed at runtime for diff collection in workspaces
RUN apt-get update && apt-get install -y --no-install-recommends \
      git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install -r requirements.txt \
 && pip install PyJWT==2.9.0

COPY . .

ENV HOST=0.0.0.0 \
    PORT=8080 \
    WORKSPACES_DIR=/workspaces \
    DATABASE_PATH=/data/review_sessions.db

EXPOSE 8080

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
