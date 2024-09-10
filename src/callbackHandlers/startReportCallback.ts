import { TelegramBot } from '../telegram-bot.js';

const telegramBot = TelegramBot.telegramBot();

export const startReportCallback = async (chatId: string, workbook: any) => {
  const inlineKeyboardCompanies =
    workbook.SheetNames.map((name: string) => [{text: name, callback_data: name}]);

  await telegramBot.sendMessage(chatId, 'Выберите компанию:', {
    reply_markup: {
      inline_keyboard: inlineKeyboardCompanies
    },
  });

  return;
};
