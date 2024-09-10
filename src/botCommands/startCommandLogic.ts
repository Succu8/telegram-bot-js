import { TelegramBot } from '../telegram-bot.js';

const telegramBot = TelegramBot.telegramBot();

export const startCommandLogic = async (chatId: number, firstName: string) => {
  await telegramBot.sendSticker(chatId, 'https://data.chpic.su/stickers/s/StonksssssS/StonksssssS_001.webp');

  await telegramBot.sendMessage(chatId, `Рады приветствовать Вас, ${firstName} 🎉
Мы готовы предоставить самые актуальные финансовые отчеты за первый квартал 📊`);

  await telegramBot.sendMessage(chatId, 'Давайте приступим, нажмите кнопку "Начать" для продолжение:', {
    reply_markup: {
      inline_keyboard: [[{text: 'Начать', callback_data: 'start_report'}]]
    },
  });
};

export const tryAgainLogic = async (chatId: number) => {
  await telegramBot.sendMessage(chatId, 'Для повторного запроса, нажмите кнопку "Повторить":', {
    reply_markup: {
      inline_keyboard: [[{text: 'Повторить', callback_data: 'start_report'}]]
    },
  });
};
