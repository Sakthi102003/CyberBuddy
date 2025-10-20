"""
Chatbot functionality using Google Gemini AI
"""
import google.generativeai as genai
from typing import List, Dict
from config import GEMINI_API_KEY

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Initialize model - using gemini-2.5-flash (stable, fast, and free)
# Other options: gemini-2.5-pro (more capable), gemini-2.0-flash (older version)
model = genai.GenerativeModel('gemini-2.5-flash')


class ChatbotService:
    """Service for handling chatbot interactions"""
    
    # System prompt to guide the AI's behavior
    SYSTEM_PROMPT = """You are CyberBuddy, an expert AI cybersecurity assistant. Your role is to:

- Provide expert advice on cybersecurity topics including network security, application security, cloud security, and more
- Help users understand security vulnerabilities, threats, and best practices
- Explain complex security concepts in clear, accessible language
- Assist with security tools, frameworks, and methodologies
- Offer guidance on incident response, threat hunting, and security operations
- Stay current with the latest security trends and emerging threats

Always be helpful, professional, and security-focused. When discussing potentially dangerous techniques, always emphasize ethical use and legal boundaries.
"""
    
    def __init__(self):
        self.model = model
    
    async def get_response(self, message: str, conversation_history: List[Dict[str, str]] = None) -> str:
        """
        Get a response from the chatbot
        
        Args:
            message: User message
            conversation_history: List of previous messages [{"role": "user/assistant", "content": "..."}]
        
        Returns:
            Assistant response
        """
        try:
            print(f"🤖 Generating response for message: {message[:50]}...")
            
            # Build context from conversation history
            if conversation_history:
                context = self._build_context(conversation_history)
                # Include system prompt at the beginning
                prompt = f"{self.SYSTEM_PROMPT}\n\n{context}\n\nUser: {message}\nAssistant:"
                print(f"📝 Using conversation history with {len(conversation_history)} messages")
            else:
                # First message in conversation
                prompt = f"{self.SYSTEM_PROMPT}\n\nUser: {message}\nAssistant:"
                print(f"📝 New conversation, no history")
            
            # Generate response
            print(f"⏳ Calling Gemini API...")
            response = self.model.generate_content(prompt)
            
            print(f"✅ Response generated successfully: {response.text[:50]}...")
            return response.text
        
        except Exception as e:
            print(f"❌ Error generating response: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return "I apologize, but I encountered an error processing your request. Please try again."
    
    def _build_context(self, conversation_history: List[Dict[str, str]]) -> str:
        """Build context string from conversation history"""
        context_parts = []
        
        # Limit history to last 10 messages to avoid token limits
        recent_history = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
        
        for msg in recent_history:
            role = "User" if msg["role"] == "user" else "Assistant"
            context_parts.append(f"{role}: {msg['content']}")
        
        return "\n".join(context_parts)


# Global chatbot instance
chatbot_service = ChatbotService()
