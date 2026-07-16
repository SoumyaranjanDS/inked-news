import os

def setup_ai():
    api_key = os.getenv("GROQ")
    if api_key:
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            return client
        except ImportError:
            print("Please install groq: pip install groq")
    return None

def generate_summary_and_moderation(model, article_text, headline):
    """
    Returns a dictionary with 'summary' and 'moderation_status'.
    In a full production scenario, you would enforce a JSON schema here.
    """
    if not model:
        # Fallback if no API key
        return {
            "summary": article_text[:200] + "...",
            "moderation_status": "Clean",
            "confidence": 100
        }
        
    prompt = f"""
    You are an expert news editor and content moderator.
    Read the following article and provide two things:
    1. A simpler, rewritten version of the description in your own words. It should be engaging and completely avoid direct pasting of the original text.
    2. A moderation verdict: 'Clean' if it is safe for general audiences, or 'Flagged' if it contains explicit, dangerous, or highly controversial content.

    Headline: {headline}
    Article/Description: {article_text}

    Format your response EXACTLY like this:
    SUMMARY: <your rewritten description>
    VERDICT: <Clean or Flagged>
    """
    
    try:
        response = model.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3,
        )
        text = response.choices[0].message.content
        
        # Simple string parsing
        summary = ""
        verdict = "Clean"
        
        for line in text.split('\n'):
            if line.startswith('SUMMARY:'):
                summary = line.replace('SUMMARY:', '').strip()
            elif line.startswith('VERDICT:'):
                verdict = line.replace('VERDICT:', '').strip()
                
        if not summary:
            summary = article_text[:200] + "..."
            
        return {
            "summary": summary,
            "moderation_status": verdict,
            "confidence": 95 if verdict == "Clean" else 80
        }
    except Exception as e:
        print(f"AI Generation failed: {e}")
        # Raise exception so the main queue can handle rate limits (e.g. 429) and retry
        raise e
