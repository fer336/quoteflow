from minio import Minio
import os
from io import BytesIO

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio.qeva.xyz")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "admin")
MINIO_SECRET_KEY = os.getenv(
    "MINIO_SECRET_KEY", "mVP4gDqBqewpo008UZ1TiDbdWWhUVWpWq"
)  # Fallback for dev
MINIO_BUCKET = "budgetpro-logos"
MINIO_SECURE = os.getenv("MINIO_USE_SSL", "true").lower() == "true"


def get_minio_client():
    return Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE,
    )


def upload_file(file_data: bytes, file_name: str, content_type: str) -> str:
    client = get_minio_client()

    # Ensure bucket exists
    if not client.bucket_exists(MINIO_BUCKET):
        client.make_bucket(MINIO_BUCKET)
        # Set public policy just in case (optional, depends on need)
        # For now, we rely on presigned URLs or public bucket if configured in MinIO console

    # Upload
    client.put_object(
        MINIO_BUCKET,
        file_name,
        BytesIO(file_data),
        len(file_data),
        content_type=content_type,
    )

    # Construct URL (Assuming public access or handled by frontend proxy)
    protocol = "https" if MINIO_SECURE else "http"
    return f"{protocol}://{MINIO_ENDPOINT}/{MINIO_BUCKET}/{file_name}"


def get_file_content(file_name: str) -> bytes:
    """Download file content for internal use (e.g. PDF generation)"""
    client = get_minio_client()
    response = None
    try:
        response = client.get_object(MINIO_BUCKET, file_name)
        return response.read()
    except Exception as e:
        print(f"Error fetching file from MinIO: {e}")
        return None
    finally:
        if response:
            response.close()
            response.release_conn()


def get_file_content_with_metadata(file_name: str) -> tuple[bytes | None, str | None]:
    """Download file content and persisted content type."""
    client = get_minio_client()
    response = None
    try:
        response = client.get_object(MINIO_BUCKET, file_name)
        content_type = getattr(response, "headers", {}).get("Content-Type")
        return response.read(), content_type
    except Exception as e:
        print(f"Error fetching file metadata from MinIO: {e}")
        return None, None
    finally:
        if response:
            response.close()
            response.release_conn()
