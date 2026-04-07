import os

from celery.schedules import crontab

broker_url = os.environ.get("REDIS_URL", "redis://redis:6379/0")
result_backend = os.environ.get("REDIS_URL", "redis://redis:6379/0")
timezone = "UTC"
enable_utc = True
task_track_started = True
worker_prefetch_multiplier = 1
task_serializer = "json"
result_serializer = "json"
accept_content = ["json"]

beat_schedule = {
    "daily-incremental-scrape": {
        "task": "worker.tasks.incremental_scrape_task",
        "schedule": crontab(hour=7, minute=0),
    },
    "weekly-full-scrape": {
        "task": "worker.tasks.full_scrape_task",
        "schedule": crontab(hour=6, minute=0, day_of_week=0),
    },
    "daily-alerts": {
        "task": "worker.tasks.send_alerts_task",
        "schedule": crontab(hour=8, minute=0),
    },
}
