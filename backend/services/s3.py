import boto3
import os
from dotenv import load_dotenv

load_dotenv()

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
    region_name=os.environ.get("AWS_REGION")
)

BUCKET_NAME = os.environ.get("AWS_BUCKET_NAME")

def upload_file(file_bytes: bytes, filename: str, user_id:str) -> str:
    key=f"documents/{user_id}/{filename}"

    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=file_bytes
    )

    return key;

def download_file(key:str) -> bytes:
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
    return response["Body"].read();

def delete_file(key:str) -> None:
    s3_client.delete_object(Bucket=BUCKET_NAME, Key=key)
