# 🌍 AIVA Backend

**AIVA (Artificial Intelligence for a Vitalized Earth)** - Flask backend that gives Earth a digital voice through sentiment analysis and AI-powered emotional responses.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
# Get your key from: https://makersuite.google.com/app/apikey
```

### 3. Download TextBlob Data
```bash
python -c "import textblob; textblob.download_corpora()"
```

### 4. Run the Server
```bash
python app.py
```

Server will run at: `http://localhost:5000`

## 📡 API Endpoints

### POST /analyze
Analyze user message and get AIVA's emotional response.

**Request:**
```json
{
  "message": "The forests are burning."
}
```

**Response:**
```json
{
  "sentiment": "negative",
  "eco_emotion": "hurt", 
  "color": "#ff4444",
  "aiva_response": "I can feel my lungs ache... my green heart turns to smoke. Please help me breathe again.",
  "user_message": "The forests are burning."
}
```

### GET /environment
Get current environmental data with AIVA's commentary.

**Response:**
```json
{
  "air_quality": 78,
  "forest_health": 62,
  "temperature": 24.5,
  "ocean_ph": 8.1,
  "co2_levels": 395,
  "mood": "recovering",
  "aiva_commentary": "My forests breathe a little easier today... thank you.",
  "overall_health": 70.0
}
```

### POST /chat
Extended chat with conversation history.

**Request:**
```json
{
  "message": "How are you feeling today?",
  "history": [
    {"user": "Hello AIVA", "aiva": "Hello, dear soul..."}
  ]
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "AIVA is alive and listening."
}
```

## 🧠 Features

- **Sentiment Analysis**: Uses TextBlob to analyze emotional tone
- **Emotion Mapping**: Converts sentiment to colors and eco-emotions
- **Gemini Integration**: AI-powered Earth-voice responses
- **Environment Simulation**: Mock environmental data with commentary
- **CORS Enabled**: Ready for frontend integration
- **Conversation Memory**: Chat endpoint supports conversation history

## 🔧 Configuration

### Environment Variables (.env)
```
GEMINI_API_KEY=your_api_key_here
FLASK_ENV=development
PORT=5000
```

### Emotion Mapping
- **Positive** → Joyful (Green: #00ff88)
- **Negative** → Hurt (Red: #ff4444)  
- **Neutral** → Calm (Blue: #00aaff)

## 🧪 Testing

### Test Analyze Endpoint
```bash
curl -X POST http://localhost:5000/analyze \
     -H "Content-Type: application/json" \
     -d '{"message": "The oceans are healing."}'
```

### Test Environment Endpoint
```bash
curl http://localhost:5000/environment
```

### Test Health Check
```bash
curl http://localhost:5000/health
```

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production (with Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:8080 app:app
```

## 🛡️ Security Features

- Input validation and sanitization
- Error handling with graceful fallbacks
- CORS configuration for secure cross-origin requests
- Environment variable protection

## 🌱 Next Steps

1. Add real environmental data APIs
2. Implement user memory/sessions
3. Add WebSocket support for real-time chat
4. Multi-language support
5. Advanced emotion detection

---

**AIVA Backend** - Where technology meets Earth's heartbeat 🌍💚