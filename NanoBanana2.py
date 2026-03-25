import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
import requests
import time



VETREX_TOKEN = 'TOKEN'
bot = telebot.TeleBot(VETREX_TOKEN)

STICKER_ID = 'CAACAgIAAxkBAAIMcmjDndyMvCb2OBQhIGobGVZU4f6JAAK0IwACmEspSN65vs0qW-TZNgQ'
START_PHOTO = 'https://t.me/VETREX_PHOTO/2'

VETREX_CHANNEL = 'https://t.me/VETREX_AI'
VETREX_DEV = 'https://t.me/VETREX_3' 

vetrex_users = {}

def get_main_keyboard():
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton('• Create Image •', callback_data='create_image'))
    markup.add(InlineKeyboardButton('• Edit Image •', callback_data='edit_image'))
    markup.add(
        InlineKeyboardButton('• Channel •', url=VETREX_CHANNEL),
        InlineKeyboardButton('• Developer •', url=VETREX_DEV)
    )
    return markup

def get_back_keyboard():
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton('• Back •', callback_data='back'))
    return markup

@bot.message_handler(commands=['start'])
def start_command(message):
    chat_id = message.chat.id
    first_name = message.from_user.first_name
    from_id = message.from_user.id
    vetrex_users[chat_id] = {'state': None, 'images': []}
    
    s = f"[{first_name}](tg://user?id={from_id})"
    text = f"• Welcome {s}\n• To NanoBanana2 Bot for creating and editing images\n• Powered by advanced AI\n• You can generate new images or edit existing ones\n• High quality and creativity limited only by your imagination 🎨"
    
    bot.send_photo(chat_id, START_PHOTO, caption=text, parse_mode='Markdown', reply_markup=get_main_keyboard())

@bot.callback_query_handler(func=lambda call: True)
def callback_query(call):
    chat_id = call.message.chat.id
    first_name = call.from_user.first_name
    from_id = call.from_user.id
    s = f"[{first_name}](tg://user?id={from_id})"
    
    if call.data == 'back':
        vetrex_users[chat_id] = {'state': None, 'images': []}
        text = f"• Welcome {s}\n• To NanoBanana2 Bot for creating and editing images\n• Powered by advanced AI\n• You can generate new images or edit existing ones\n• High quality and creativity limited only by your imagination 🎨"
        try:
            bot.edit_message_caption(caption=text, chat_id=chat_id, message_id=call.message.message_id, parse_mode='Markdown', reply_markup=get_main_keyboard())
        except:
            bot.delete_message(chat_id, call.message.message_id)
            bot.send_photo(chat_id, START_PHOTO, caption=text, parse_mode='Markdown', reply_markup=get_main_keyboard())

    elif call.data == 'create_image':
        vetrex_users[chat_id] = {'state': 'create', 'images': []}
        bot.edit_message_caption(caption="• Please send the text prompt to create your image 😊:", chat_id=chat_id, message_id=call.message.message_id, reply_markup=get_back_keyboard())

    elif call.data == 'edit_image':
        vetrex_users[chat_id] = {'state': 'edit', 'images': []}
        bot.edit_message_caption(caption="• Please send up to 9 images you want to edit:", chat_id=chat_id, message_id=call.message.message_id, reply_markup=get_back_keyboard())

@bot.message_handler(content_types=['photo'])
def handle_photo(message):
    chat_id = message.chat.id
    user_data = vetrex_users.get(chat_id, {'state': None, 'images': []})
    
    if user_data.get('state') == 'edit':
        images_list = user_data.get('images', [])
        
        if len(images_list) >= 9:
            return 
            
        file_id = message.photo[-1].file_id
        file_info = bot.get_file(file_id)
        file_url = f"https://api.telegram.org/file/bot{VETREX_TOKEN}/{file_info.file_path}"
        
        images_list.append(file_url)
        vetrex_users[chat_id]['images'] = images_list
        
        
        if len(images_list) == 1:
            bot.reply_to(message, "*• Now, send the text prompt to edit the images:*", parse_mode='Markdown', reply_markup=get_back_keyboard())

@bot.message_handler(content_types=['text'])
def handle_text(message):
    chat_id = message.chat.id
    user_data = vetrex_users.get(chat_id, {'state': None, 'images': []})
    state = user_data.get('state')

    if state == 'create':
        vetrex_users[chat_id]['state'] = None
        process_vetrex_api(chat_id, message.text, "https://vetrex.site/v1/images/generations", {"prompt": message.text, "model": "nano-banana-2"})

    elif state == 'edit':
        images_list = user_data.get('images', [])
        
        if len(images_list) == 0:
            bot.send_message(chat_id, "• Please send at least one image first,\n• Then send the text prompt for editing:", reply_markup=get_back_keyboard())
            return
            
        vetrex_users[chat_id]['state'] = None
        vetrex_users[chat_id]['images'] = []
        process_vetrex_api(chat_id, message.text, "https://vetrex.site/v1/images/edits", {"prompt": message.text, "model": "nano-banana-2", "images": images_list})
        
    elif message.text != '/start':
        bot.send_message(chat_id, "<b>• Please choose a command from the menu first ✨</b>", parse_mode='HTML', reply_markup=get_back_keyboard())

def process_vetrex_api(chat_id, user_prompt, api_url, payload):
    sticker_msg = bot.send_sticker(chat_id, STICKER_ID)
    
    try:
        post_res = requests.post(api_url, json=payload, timeout=10).json()
        
        if post_res.get('status') == 'pending':
            task_id = post_res['task_id']
            
            while True:
                time.sleep(5)
                get_res = requests.get(f"https://vetrex.site/v1/images/results/{task_id}", timeout=10).json()
                
                if get_res.get('status') == 'completed':
                    final_url = get_res['data'][0]['url']
                    caption = f"<b><blockquote>{user_prompt[:1000]}</blockquote></b>"
                    bot.send_photo(chat_id, final_url, caption=caption, parse_mode='HTML', reply_markup=get_back_keyboard())
                    break
                
                elif get_res.get('status') == 'failed':
                    error_msg = get_res.get('python_error', 'Unknown generation error')
                    bot.send_message(chat_id, f"*• Sorry, an error occurred:*\n`{error_msg}`", parse_mode='Markdown', reply_markup=get_back_keyboard())
                    break
        else:
            bot.send_message(chat_id, "*• Sorry, could not start the task. •*", parse_mode='Markdown', reply_markup=get_back_keyboard())
            
    except Exception as e:
        bot.send_message(chat_id, f"*• Server Connection Error:*\n`{e}`", parse_mode='Markdown', reply_markup=get_back_keyboard())
        
    finally:
        try:
            bot.delete_message(chat_id, sticker_msg.message_id)
        except:
            pass

if __name__ == "__main__":
    print("VETREX Bot is running...")
    bot.polling(none_stop=True, timeout=60)
