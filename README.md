# Telegram Monitor Web Interface

A simple web interface for configuring and managing Telegram monitoring with real-time event logging.

## Features

- Web-based Telegram authorization (no command line input needed)
- Chat selection interface with search functionality
- Keyword management
- N8N webhook configuration and testing
- Real-time monitoring with live event logging
- All configuration stored in `config.json`

## Installation

1. Clone the repository
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python main.py
   ```
4. Open your browser and navigate to `http://localhost:8000`

## Usage

1. **Telegram Settings**: Enter your API ID, API Hash, Phone number, and Session name
2. **Authorization**: Click "Авторизоваться" to start the authorization process
3. **Chat Selection**: Click "Получить список чатов" to load your chats, select the ones to monitor
4. **Keywords**: Add keywords to monitor in messages
5. **Webhook**: Configure your N8N webhook URL
6. **Monitoring**: Click "Запустить мониторинг" to start monitoring

## API Endpoints

- `POST /api/telegram/save` - Save Telegram settings
- `POST /api/telegram/auth/start` - Start Telegram authorization
- `POST /api/telegram/auth/code` - Submit authorization code
- `POST /api/telegram/auth/password` - Submit 2FA password
- `GET /api/chats/list` - Get list of chats
- `POST /api/chats/save` - Save selected chats
- `POST /api/keywords/add` - Add keyword
- `DELETE /api/keywords/{word}` - Delete keyword
- `POST /api/webhook/save` - Save webhook URL
- `POST /api/webhook/test` - Test webhook
- `POST /api/monitor/start` - Start monitoring
- `POST /api/monitor/stop` - Stop monitoring
- `GET /api/monitor/status` - Get monitoring status
- `GET /api/monitor/logs` - Stream monitoring logs (SSE)

## Files

- `main.py` - FastAPI backend
- `index.html` - Web interface
- `authorize.py` - Original authorization script (not used in web interface)
- `list_chats.py` - Chat listing script
- `monitor.py` - Monitoring script
- `config.json` - Configuration file (created automatically)