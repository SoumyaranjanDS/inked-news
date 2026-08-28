import os
import json
import urllib.request
import urllib.error

def setup_ai():
    # Fetch OpenRouter key from environment variables
    api_key = os.getenv("OPENROUTER")
    if not api_key:
        print("Warning: OPENROUTER API key not found in .env")
    return api_key

def generate_summary_and_moderation(settings, article_text, headline):
    """
    Returns a dictionary with 'summary' and 'moderation_status'.
    """
    active_model = settings.get("active_model", "openrouter")
    api_keys = settings.get("api_keys", {})
    api_key = api_keys.get(active_model)
    
    if not api_key:
        print(f"No API key for {active_model}, returning raw text.")
        return {
            "summary": article_text[:200] + "...",
            "moderation_status": "Clean",
            "confidence": 100
        }
        
    custom_prompt = settings.get("custom_prompt", "")
    if not custom_prompt:
        custom_prompt = """You are an expert news editor and content moderator.
Read the following article and provide two things:
1. A concise, engaging, and accurate SHORT SUMMARY of the article (3-4 sentences max). 
2. A moderation verdict: 'Clean' if it is safe for general audiences, or 'Flagged' if it contains explicit, dangerous, or highly controversial content.

Format your response EXACTLY like this:
REWRITE: <your short summary>
VERDICT: <Clean or Flagged>"""

    prompt = f"""
    {custom_prompt}

    Headline: {headline}
    Article/Description: {article_text}
    """
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "meta-llama/llama-3.1-8b-instruct", 
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3
    }
    
    try:
        req = urllib.request.Request(url, headers=headers, data=json.dumps(data).encode('utf-8'), method='POST')
        with urllib.request.urlopen(req) as response:
            res_body = response.read()
            res_json = json.loads(res_body)
            text = res_json['choices'][0]['message']['content']
        
        # Simple string parsing
        summary = ""
        verdict = "Clean"
        
        lines = text.split('\n')
        rewrite_lines = []
        in_rewrite = False
        
        for line in lines:
            line_upper = line.upper()
            if 'VERDICT:' in line_upper:
                verdict = line_upper.split('VERDICT:')[-1].strip()
                in_rewrite = False
            elif 'REWRITE:' in line_upper:
                in_rewrite = True
                # Clean up the REWRITE string itself
                idx = line_upper.find('REWRITE:')
                content_part = line[idx + 8:].strip()
                if content_part:
                    rewrite_lines.append(content_part)
            elif in_rewrite:
                rewrite_lines.append(line.strip())
                
        summary = '\n'.join(rewrite_lines).strip()
                
        if not summary:
            # Fallback: if we couldn't parse it, just return the raw text (filtering out the VERDICT if present)
            clean_text = [l.strip() for l in lines if 'VERDICT:' not in l.upper()]
            summary = '\n'.join(clean_text).strip()
            
        # Last resort fallback
        if not summary:
            summary = article_text[:200] + "..."
            
        return {
            "summary": summary,
            "moderation_status": verdict,
            "confidence": 95 if verdict == "Clean" else 80
        }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"AI Generation failed: {e.code} - {err_msg}")
        raise e
    except Exception as e:
        print(f"AI Generation failed: {e}")
        raise e
