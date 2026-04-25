FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    COMFYUI_DATA_DIR=/data

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git \
       libgl1 \
       libglib2.0-0 \
       libsm6 \
       libxext6 \
       libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN python -m pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . .

RUN mkdir -p "${COMFYUI_DATA_DIR}" /app/input /app/output /app/temp

EXPOSE 8080

CMD ["sh", "-c", "python main.py --listen 0.0.0.0 --port ${PORT:-8080} --base-directory ${COMFYUI_DATA_DIR}"]
