import time
from django.utils.deprecation import MiddlewareMixin
import re

class CollapseLeadingSlashesMiddleware:
    def __init__(self, get_response): self.get_response = get_response
    def __call__(self, request):
        # 只把「前導」的連續斜線壓成一個
        request.path_info = re.sub(r'^/+', '/', request.path_info)
        return self.get_response(request)
    
class TimingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._t0 = time.perf_counter()

    def process_response(self, request, response):
        t0 = getattr(request, "_t0", None)
        if t0 is not None:
            dt_ms = (time.perf_counter() - t0) * 1000
            response["X-Process-Time-ms"] = f"{dt_ms:.1f}"
        return response
