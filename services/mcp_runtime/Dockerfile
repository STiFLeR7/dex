FROM python:3.11-slim

WORKDIR /app

# Install build deps if needed (usually simple pure python is fine)
COPY services/mcp_runtime/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service code. Assumes build context is project root.
COPY services/mcp_runtime /app/services/mcp_runtime
COPY services/prompt_registry /app/services/prompt_registry
COPY services/tools /app/services/tools

ENV PYTHONPATH=/app

CMD ["uvicorn", "services.mcp_runtime.main:app", "--host", "0.0.0.0", "--port", "8000"]
