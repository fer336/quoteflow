"""MinIO storage adapter stub."""


class MinioStorageAdapter:
    def upload(self, *, object_name, content, content_type):
        raise NotImplementedError(
            "Wrap the legacy MinIO service here during migration."
        )

    def download(self, *, object_name):
        raise NotImplementedError(
            "Wrap the legacy MinIO service here during migration."
        )

    def delete(self, *, object_name):
        raise NotImplementedError(
            "Wrap the legacy MinIO service here during migration."
        )
