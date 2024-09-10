import TelegramApiLib from 'node-telegram-bot-api';
import { TELEGRAM_TOKEN } from './utilities/static-util.js';

export class TelegramBot {
  private static _telegramBot: TelegramBot;

  static telegramBot(): any {
    if (!!this._telegramBot) return this._telegramBot;

    this._telegramBot = new TelegramApiLib(TELEGRAM_TOKEN, {polling: true});

    return this._telegramBot;
  }
}
