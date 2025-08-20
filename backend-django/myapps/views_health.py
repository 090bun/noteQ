import os, socket, time, datetime as dt
from django.http import JsonResponse
from django.db import connection

START_TS = time.time()

def _base_payload():
    return {
        "status": "ok",
        "service": os.getenv("SERVICE_NAME", "django"),
        "host": socket.gethostname(),
        "uptime_sec": round(time.time() - START_TS, 1),
        "version": os.getenv("GIT_SHA", "dev"),
        "now": dt.datetime.utcnow().isoformat() + "Z",
    }

def healthz(request):
    return JsonResponse(_base_payload(), status=200)

def readyz(request):
    payload = _base_payload()
    checks = {}
    ok = True
    try:
        with connection.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
        checks["db"] = "ok"
    except Exception as e:
        ok = False
        checks["db"] = f"error: {e.__class__.__name__}"
    payload["checks"] = checks
    return JsonResponse(payload, status=200 if ok else 503)
