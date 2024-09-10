import { TelegramBot } from '../telegram-bot.js';
import * as fs from 'fs';
import { FILE_PATH } from '../utilities/static-util.js';

const telegramBot = TelegramBot.telegramBot();

export const infoCommandLogic = async (chatId: string) => {
  await telegramBot.sendMessage(chatId, 'Документ, используемый для создания графиков:');

  return telegramBot.sendDocument(chatId, fs.createReadStream(FILE_PATH))
    .then(() => {
      console.log('Файл успешно отправлен!');
    })
    .catch((err: any) => {
      console.error('Ошибка при отправке файла:', err);
    });
};
