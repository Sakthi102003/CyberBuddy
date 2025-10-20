# Rate Limiting Configuration

## Overview
This document explains how CyberBuddy handles API rate limits, particularly for the Gemini API.

## Problem
Gemini API has rate limits that vary by tier:
- **Free tier**: ~15 requests per minute (RPM)
- **Paid tier**: Higher limits depending on the plan

When these limits are exceeded, you get a `429 Too Many Requests` error.

## Solution

### Backend (Python/FastAPI)

#### 1. Request Pacing
The backend enforces a minimum interval between API calls:
```python
MIN_CALL_INTERVAL_SECONDS = 2.0  # ~30 RPM, conservative for free tier
```

**Configuration**: Set via environment variable `MIN_CALL_INTERVAL_SECONDS`

#### 2. Concurrency Limiting
Limits simultaneous API calls using a semaphore:
```python
MAX_CONCURRENT_CALLS = 1  # Only 1 call at a time
```

**Configuration**: Set via environment variable `MAX_CONCURRENT_CALLS`

#### 3. Retry Logic with Exponential Backoff
When rate limits are hit, the backend automatically retries with increasing delays:
- **Retries**: 5 attempts
- **Base delay**: 2 seconds
- **Max delay**: 32 seconds
- **Backoff multiplier**: 3x for rate limit errors, 2x for other errors

```python
# Example delay progression for rate limit errors:
# Attempt 1: 2-3 seconds
# Attempt 2: 6-9 seconds
# Attempt 3: 18-27 seconds
# Attempt 4: 32 seconds (capped)
```

### Frontend (React)

#### 1. Automatic Retry on 429
The frontend API client automatically retries failed requests:
```javascript
maxRetries = 3
baseDelay = 2000ms  // 2 seconds
```

Delay progression:
- Attempt 1: 2 seconds
- Attempt 2: 4 seconds
- Attempt 3: 8 seconds

#### 2. User-Friendly Error Messages
Clear error messages for different scenarios:
- ⚠️ Rate limit errors: "The AI service is experiencing high demand..."
- 🔒 Authentication errors: "Your session has expired..."
- ⚙️ API configuration errors: "Please contact the administrator..."

## Configuration

### Environment Variables (Backend)

Add to `backend/.env`:

```env
# Rate limiting configuration
MIN_CALL_INTERVAL_SECONDS=2.0  # Minimum seconds between API calls
MAX_CONCURRENT_CALLS=1          # Maximum simultaneous API calls

# Gemini configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash   # Or gemini-1.5-pro
```

### Adjusting for Different Tiers

**Free Tier** (15 RPM):
```env
MIN_CALL_INTERVAL_SECONDS=2.0
MAX_CONCURRENT_CALLS=1
```

**Paid Tier** (60+ RPM):
```env
MIN_CALL_INTERVAL_SECONDS=1.0
MAX_CONCURRENT_CALLS=3
```

**High Volume** (1000+ RPM):
```env
MIN_CALL_INTERVAL_SECONDS=0.1
MAX_CONCURRENT_CALLS=10
```

## Monitoring

### Backend Logs
Watch for these messages:
```
Rate limit hit. Retrying in 3.45s (attempt 2/5)
Error occurred. Retrying in 2.12s (attempt 1/5)
All 5 attempts failed. Last error: ...
```

### Frontend Console
Check browser console for:
```
Rate limit hit. Retrying in 2s... (attempt 1/3)
Network error. Retrying in 4s... (attempt 2/3)
```

## Best Practices

1. **Start Conservative**: Use lower limits initially and increase based on monitoring
2. **Monitor API Usage**: Track your Gemini API quota usage in Google Cloud Console
3. **Upgrade When Needed**: If consistently hitting limits, consider upgrading to a paid tier
4. **User Communication**: Keep users informed when delays occur
5. **Implement Queuing**: For high-traffic applications, consider implementing a message queue

## Troubleshooting

### Still Getting 429 Errors?

1. **Check API Key Tier**: Verify your Gemini API key tier in Google Cloud Console
2. **Increase Delay**: Try `MIN_CALL_INTERVAL_SECONDS=3.0` or higher
3. **Reduce Concurrency**: Ensure `MAX_CONCURRENT_CALLS=1`
4. **Monitor Usage**: Check if you're hitting daily/monthly quotas
5. **Multiple Keys**: Consider rotating between multiple API keys (enterprise)

### Too Slow?

1. **Verify Tier**: Make sure you're using the correct settings for your API tier
2. **Increase Concurrency**: Only if your tier supports it
3. **Reduce Delay**: Lower `MIN_CALL_INTERVAL_SECONDS` carefully
4. **Upgrade**: Consider upgrading to a higher Gemini API tier

## Testing

Test rate limiting locally:
```bash
# Send multiple rapid requests
for i in {1..10}; do
  curl -X POST http://localhost:8000/chat \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"message":"Test","session_id":"test-session"}' &
done
```

You should see:
- Sequential processing (not simultaneous)
- Automatic retries on errors
- Eventual success after delays

## Resources

- [Gemini API Quotas](https://ai.google.dev/gemini-api/docs/quota)
- [Google Cloud Console](https://console.cloud.google.com/)
- [FastAPI Rate Limiting](https://fastapi.tiangolo.com/)
