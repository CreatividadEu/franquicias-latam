FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY worker/requirements.txt worker/requirements.txt
COPY scraper/requirements.txt scraper/requirements.txt

RUN pip install --no-cache-dir -r worker/requirements.txt -r scraper/requirements.txt

COPY worker ./worker
COPY scraper ./scraper

CMD ["celery", "-A", "worker.tasks", "worker", "--loglevel=info", "--concurrency=2"]
