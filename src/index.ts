import XLSX from 'xlsx';
import { startCommandLogic, tryAgainLogic } from './botCommands/startCommandLogic.js';
import { TelegramBot } from './telegram-bot.js';
import { infoCommandLogic } from './botCommands/infoCommandLogic.js';
import { getValueFromMap } from './app-context.js';
import { financeTypeCallback } from './callbackHandlers/financeTypeCallback.js';
import { companyCallback } from './callbackHandlers/companyCallback.js';
import { startReportCallback } from './callbackHandlers/startReportCallback.js';
import { FILE_PATH } from './utilities/static-util.js';

const telegramBot = TelegramBot.telegramBot();

const workbook = () => {
  try {
    return XLSX.readFile(FILE_PATH);
  } catch (e) {
    return null;
  }
};

telegramBot.setMyCommands([
  {command: '/start', description: 'Start'},
  {command: '/info', description: 'Info'}
]);

telegramBot.on('message', async (msg: { [index: string]: any }) => {
  const chatId = msg['chat'].id;

  if (msg['text'] === '/start') {
    await startCommandLogic(chatId, msg['from'].first_name);
    return;
  }

  if (msg['text'] === '/info') {
    await infoCommandLogic(chatId);
    return;
  }

  return telegramBot.sendMessage(chatId, 'Oops, повторите еще раз!');
});

telegramBot.on('callback_query', async (callbackQuery: { [index: string]: any }) => {
  const command = callbackQuery['data'];
  const chatId = callbackQuery['message'].chat.id;

  try {
    // startReportCallback
    if (command === 'start_report') {
      if (!workbook()) {
        await telegramBot.sendMessage(chatId, 'Oops, файл, необходимый для создания графиков, не был найден по указанному пути!');
        return;
      }

      await startReportCallback(chatId, workbook());

      return;
    }

    // companyCallback
    if (!workbook()) {
      await telegramBot.sendMessage(chatId, 'Oops, файл, необходимый для создания графиков, не был найден по указанному пути!');
      return;
    }
    const selectedCompany = workbook().SheetNames.find((name) => name === command);

    if (selectedCompany) {
      await companyCallback(chatId, selectedCompany);
      return;
    }

    // financeTypeCallback
    if (getValueFromMap('current_finance_types')?.includes(command)) {
      await financeTypeCallback(chatId, command);
      await tryAgainLogic(chatId);
      return;
    }
  } catch (e) {
    await telegramBot.sendMessage(chatId, 'Сервис временно недоступен. Пожалуйста, повторите попытку позже.');
  }

  return telegramBot.sendMessage(chatId, 'Oops, повторите еще раз!');
});
