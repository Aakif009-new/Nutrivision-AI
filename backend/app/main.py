import os
import gc

# Configure lightweight execution environment for Render Free Tier (512MB RAM)
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["YOLO_CONFIG_DIR"] = "/tmp"

try:
    import torch
    torch.set_num_threads(1)
    torch.set_num_interop_threads(1)
    torch.set_grad_enabled(False)
except Exception:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.models.response_schemas import HealthCheckResponse
from app.services.model_runner import YOLO_AVAILABLE, ONNX_AVAILABLE

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Vercel deployed frontend and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://nutrivision-ai.vercel.app",
        "https://nutrivision-ai-cv.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get(f"{settings.API_V1_STR}/health", response_model=HealthCheckResponse, tags=["Health"])
def health_check():
    """
    Health check endpoint for Render/Vercel monitoring and container probes.
    """
    return HealthCheckResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        models_loaded=YOLO_AVAILABLE or ONNX_AVAILABLE
    )


@app.get("/", tags=["Health"])
def root_redirect():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
