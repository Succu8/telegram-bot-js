const TelegramApiLib = require('node-telegram-bot-api');
const {ChartJSNodeCanvas} = require('chartjs-node-canvas');
const XLSX = require('xlsx');

const TELEGRAM_TOKEN = '7218810611:AAEAT87rJQRZRFCl4dMbJpeopMNf7dtrq-4';
const telegramBot = new TelegramApiLib(TELEGRAM_TOKEN, {polling: true});

const workbook = XLSX.readFile('Data-test-companies.xlsx');

telegramBot.setMyCommands([
  {command: '/start', description: 'Start'},
  {command: '/info', description: 'Info'}
]);

let currentSheet;
let currentCompany;
let currentSheetFinancesType;

telegramBot.on('message', async msg => {
  const chatId = msg.chat.id;

  if (msg.text === '/start') {
    await startCommandLogic(chatId, msg.from.first_name);
    return;
  }

  if (msg.text === '/info') {
    await telegramBot.sendMessage(chatId, 'info command logic')
    return;
  }

  return telegramBot.sendMessage(chatId, 'Oops, повторите еще раз!');
})

const startCommandLogic = async (chatId, firstName) => {
  await telegramBot.sendSticker(chatId, 'https://data.chpic.su/stickers/s/StonksssssS/StonksssssS_001.webp');

  await telegramBot.sendMessage(chatId, `Рады приветствовать Вас, ${firstName} 🎉
Мы готовы предоставить самые актуальные финансовые отчеты за первый квартал 📊`)

  await telegramBot.sendMessage(chatId, 'Давайте приступим, нажмите кнопку "Начать" для продолжение:', {
    reply_markup: {
      inline_keyboard: [[{text: 'Начать', callback_data: 'start_report'}]]
    },
  });
}

telegramBot.on('callback_query', async (callbackQuery) => {
  const command = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (command === 'start_report') {
    const inlineKeyboardCompanies =
      workbook.SheetNames.map((name) => [{text: name, callback_data: name}]);

    return telegramBot.sendMessage(chatId, 'Выберите компанию:', {
      reply_markup: {
        inline_keyboard: inlineKeyboardCompanies
      },
    });
  }

  const selectedCompany = workbook.SheetNames.find((name) => name === command);

  if (selectedCompany) {
    currentCompany = selectedCompany;
    currentSheet = workbook.Sheets[currentCompany];
    currentSheetFinancesType = [`${currentSheet['B1'].v}`, `${currentSheet['C1'].v}`, `${currentSheet['D1'].v}`, `${currentSheet['E1'].v}`]

    return telegramBot.sendMessage(chatId, `Вы выбрали ${currentCompany} Что хотите посмотреть?`, {
      reply_markup: {
        inline_keyboard: [
          [{text: 'Доход', callback_data: currentSheetFinancesType[0]}],
          [{text: 'Расход', callback_data: currentSheetFinancesType[1]}],
          [{text: 'Прибыль', callback_data: currentSheetFinancesType[2]}],
          [{text: 'КПН', callback_data: currentSheetFinancesType[3]}],
        ],
      },
    });
  }

  if (currentSheetFinancesType.includes(command)) {
    const jsonData = XLSX.utils.sheet_to_json(currentSheet);

    const months = jsonData.map(x => x[currentSheet['A1'].v]);
    const financesData = jsonData.map(x => x[command]);

    const configData = {
      labels: months,
      datasets: [
        {
          label: command,
          data: financesData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };

    const configuration = {
      type: 'bar',
      data: configData,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      },
    };

    const chartJSNodeCanvas = new ChartJSNodeCanvas({width: 1024, height: 600});
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);

    return telegramBot.sendPhoto(chatId, image);
  }

  return telegramBot.sendMessage(chatId, 'Oops, повторите еще раз!');
});
