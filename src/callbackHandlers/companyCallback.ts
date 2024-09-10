import XLSX from 'xlsx';
import { TelegramBot } from '../telegram-bot.js';
import { addToMap, getValueFromMap } from '../app-context.js';
import { FILE_PATH } from '../utilities/static-util.js';

const workbook = () => {
  try {
    return XLSX.readFile(FILE_PATH);
  } catch (e) {
    return null;
  }
};

const telegramBot = TelegramBot.telegramBot();

export const companyCallback = async (chatId: string, selectedCompany: string) => {

  if (!workbook()) await telegramBot.sendMessage(chatId, 'Oops, файл, необходимый для создания графиков, не был найден по указанному пути!');

  addToMap('selected_company', selectedCompany);
  addToMap('current_sheet', workbook().Sheets[getValueFromMap('selected_company')]);
  addToMap('current_finance_types', [
    `${getValueFromMap('current_sheet')?.['B1'].v}`,
    `${getValueFromMap('current_sheet')?.['C1'].v}`,
    `${getValueFromMap('current_sheet')?.['D1'].v}`,
    `${getValueFromMap('current_sheet')?.['E1'].v}`
  ])

  return telegramBot.sendMessage(chatId, `Вы выбрали ${getValueFromMap('selected_company')} Что хотите посмотреть?`, {
    reply_markup: {
      inline_keyboard: [
        [{text: 'Доход', callback_data: getValueFromMap('current_finance_types')[0]}],
        [{text: 'Расход', callback_data: getValueFromMap('current_finance_types')[1]}],
        [{text: 'Прибыль', callback_data: getValueFromMap('current_finance_types')[2]}],
        [{text: 'КПН', callback_data: getValueFromMap('current_finance_types')[3]}],
      ],
    },
  });
}
