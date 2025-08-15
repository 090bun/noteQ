FROM python:3.12.7-slim
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy the pyproject.toml and uv.lock files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen --no-cache

COPY . .

CMD ["python", "topic_apps.py"]
