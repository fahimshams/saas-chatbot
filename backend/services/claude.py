from fastapi import APIRouter, HTTPException, Depends
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def connect_claude_api(context, messages):

    system_prompt=f"""You are a helpful assistant. 
    Answer questions using only the context below.
    If the answer is not in the context, say you don't have that information.

    Context:
    {context}"""

    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Content-Type": "application/json",
                "x-api-key": os.environ.get("ANTHROPIC_API_KEY"),
                "anthropic-version": "2023-06-01"
            },
            json={
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 300,
                "system": system_prompt,
                "messages": messages
            }
        )

        print(response.status_code)
        print(response.json())

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Claude API error")

        answer = response.json()["content"][0]["text"]

    except HTTPException:  
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")
    
    return answer