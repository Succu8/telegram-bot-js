const TelegramApiLib = require('node-telegram-bot-api');
const {ChartJSNodeCanvas} = require('chartjs-node-canvas');


const TELEGRAM_TOKEN = '7218810611:AAEAT87rJQRZRFCl4dMbJpeopMNf7dtrq-4';
const telegramBot = new TelegramApiLib(TELEGRAM_TOKEN, {polling: true});

telegramBot.setMyCommands([
  {command: '/start', description: 'Start'},
  {command: '/info', description: 'Info'}
]);

const data = {
    companies: [
      {code: 'microsoft', name: 'Microsoft', income: 120000, expenditure: 80000, profit: 40000, kpn: 10000},
      {code: 'apple', name: 'Apple', income: 130000, expenditure: 85000, profit: 45000, kpn: 11250},
      {code: 'alphabet', name: 'Alphabet', income: 140000, expenditure: 90000, profit: 50000, kpn: 12500},
      {code: 'pfizer', name: 'Pfizer', income: 150000, expenditure: 95000, profit: 55000, kpn: 13750},
    ],
    months: ['Январь', 'Февраль', 'Март', 'Апрель']
  }
;

telegramBot.on('message', async msg => {
  const chatId = msg.chat.id;

  if (msg.text === '/start') {
    await startCommandLogic(chatId, msg.from.first_name);
    return;
  }

  if (msg.text === '/info') {
    telegramBot.sendMessage(chatId, 'info command logic')
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
    const companies = data.companies.map(company => [{text: company.name, callback_data: company.code}]);

    return telegramBot.sendMessage(chatId, 'Выберите компанию:', {
      reply_markup: {
        inline_keyboard: companies
      },
    });
  }

  let selectedCompanyName;

  if (data.companies.some(company => {
    if (company.code === command) {
      selectedCompanyName = company.name;
      return true;
    }
    return false;
  })) {
    return telegramBot.sendMessage(chatId, `Вы выбрали ${selectedCompanyName}. Что хотите посмотреть?`, {
      reply_markup: {
        inline_keyboard: [
          [{text: 'Доход', callback_data: `${command}_income`}],
          [{text: 'Расход', callback_data: `${command}_expenditure`}],
          [{text: 'Прибыль', callback_data: `${command}_profit`}],
          [{text: 'КПН', callback_data: `${command}_kpn`}],
        ],
      },
    });
  }

  const [company, type] = command.split('_');

  if (['income', 'expenditure', 'profit', 'kpn'].includes(type)) {

    const selectedCompany = data.companies.find(x => x.code === company);

    const configData = {
      labels: data.months,
      datasets: [
        {
          label: 'Значения',
          data: [selectedCompany.income, selectedCompany.expenditure, selectedCompany.profit, selectedCompany.kpn],
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
