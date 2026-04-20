# Read -> Chunk -> Embed -> Store
import chromadb
from sentence_transformers import SentenceTransformer
from PyPDF2 import PdfReader
import io

embedder = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.Client()

def extract_text_from_pdf(file_bytes:bytes) -> str:
    pdf = PdfReader(io.BytesIO(file_bytes))
    text=""
    for page in pdf.pages:
        text += page.extract_text()
    return text


def chunk_text(text:str) -> list:
    chunks = [c.strip() for c in text.split("\n\n") if c.strip()]

    return chunks

def embed_document(user_id:str, document_id:str, file_bytes:bytes):
    # Extract text
    text = extract_text_from_pdf(file_bytes)

    # Chunk it
    chunks = chunk_text(text)

    # Create per-user collection
    collection_name = f"user_{user_id}_{document_id}".replace("-", "_")
    collection = chroma_client.create_collection(collection_name)

    # Embed and Store
    embeddings = embedder.encode(chunks).tolist()
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"chunk_{i}" for i in range(len(chunks))]
    )

    return collection_name

def query_collection(collection_name:str, question:str, n_results:int = 2) -> str:
    collection = chroma_client.get_collection(collection_name)
    query_vector = embedder.encode([question]).tolist()
    results = collection.query(
        query_embeddings=query_vector,
        n_result=n_results
    )

    return "\n\n".join(results["documents"][0])

