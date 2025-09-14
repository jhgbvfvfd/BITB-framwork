import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error('TELEGRAM_TOKEN is not set.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
console.log('Bot is running...');

// Buttons with a splash of emoji flair
const platformButtons = [
  ['🤖 Android', '🍎 iOS'],
  ['🌐 Web']
];
const platformLabels = platformButtons.flat();

const listTemplates = () => {
  const sitesDir = path.join(__dirname, 'sites');
  try {
    return fs
      .readdirSync(sitesDir)
      .filter(name => fs.statSync(path.join(sitesDir, name)).isDirectory());
  } catch (err) {
    console.error('Failed to read sites directory:', err.message);
    return [];
  }
};

bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome! Select your platform:', {
    reply_markup: {
      keyboard: platformButtons,
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

bot.onText(/\/templates/, msg => {
  const chatId = msg.chat.id;
  const templates = listTemplates();
  if (!templates.length) {
    bot.sendMessage(chatId, 'No templates available.');
    return;
  }
  const keyboard = templates.map(name => [name]);
  bot.sendMessage(chatId, 'Available site templates:', {
    reply_markup: {
      keyboard,
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

bot.on('message', msg => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const templates = listTemplates();

  if (platformLabels.includes(text)) {
    bot.sendMessage(chatId, `You selected platform: ${text}`);
  } else if (templates.includes(text)) {
    bot.sendMessage(chatId, `You chose template: ${text}`);
  } else if (!text.startsWith('/')) {
    bot.sendMessage(chatId, `You said: ${text}`);
  }
});
