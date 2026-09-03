FROM python:3.11-slim

WORKDIR /app

# build-essential lets pip fall back to a source build if a wheel is missing.
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# torch 2.5+ on Linux bundles ~1.5 GB of NVIDIA CUDA libs by default (cudnn, cublas,
# triton, nccl, cufft, cusolver, …), which OOMs any small instance even though we only
# use CPU. Install the CPU-only torch wheel first, then let the rest resolve against it.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch==2.4.1
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Trim BLAS thread pools — smaller RSS, plenty for embedding batches of ~1 report.
ENV PORT=8000 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
