import asyncio
from telethon import TelegramClient
import json
import sys

API_ID = 26661409
API_HASH = '6ff71732df7655334142a8c2011fe5a0'
SESSION = 'telegram_session'


async def list_all_chats():
    client = TelegramClient(SESSION, API_ID, API_HASH)
    await client.connect()

    print('📋 СПИСОК ВСЕХ ЧАТОВ И КАНАЛОВ:\n')
    print(f'{"ID":<20} | {"Название":<40} | {"Тип"}')
    print('-' * 80)

    async for dialog in client.iter_dialogs():
        chat_type = 'Канал' if dialog.is_channel else 'Группа' if dialog.is_group else 'Личка'
        print(f'{dialog.id:<20} | {dialog.name:<40} | {chat_type}')

    await client.disconnect()


async def get_chats_list():
    """Return chats as JSON for API usage"""
    client = TelegramClient(SESSION, API_ID, API_HASH)
    await client.connect()

    chats = []
    async for dialog in client.iter_dialogs():
        chat_type = 'Канал' if dialog.is_channel else 'Группа' if dialog.is_group else 'Личка'
        chats.append({
            'id': dialog.id,
            'name': dialog.name,
            'type': chat_type
        })

    await client.disconnect()
    return chats


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--json':
        # Return JSON output
        chats = asyncio.run(get_chats_list())
        print(json.dumps(chats, ensure_ascii=False))
    else:
        asyncio.run(list_all_chats())