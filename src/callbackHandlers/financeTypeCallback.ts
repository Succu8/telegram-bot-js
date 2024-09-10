import { getValueFromMap } from '../app-context.js';
import { TelegramBot } from '../telegram-bot.js';
import XLSX from 'xlsx';
import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const telegramBot = TelegramBot.telegramBot();

export const financeTypeCallback = async (chatId: string, command: string) => {
  const jsonData = XLSX.utils.sheet_to_json(getValueFromMap('current_sheet'));

  const months = jsonData.map((x: { [index: string]: any }) => x[getValueFromMap('current_sheet')['A1'].v]);
  const financesData = jsonData.map((x: { [index: string]: any }) => x[command]);

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
  } as ChartConfiguration;

  const chartJSNodeCanvas = new ChartJSNodeCanvas({width: 1024, height: 600});
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);

  return telegramBot.sendPhoto(chatId, image);
};
