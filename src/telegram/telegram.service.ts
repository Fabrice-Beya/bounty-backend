import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { CreateTipDto } from '../tip/dto';
import { TipCategory, TipPriority } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TelegramService {
    private bot: TelegramBot;

    constructor(private prisma: PrismaService) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        this.bot = new TelegramBot(token, { polling: true });
        this.setupListeners();
    }

    private setupListeners() {
        this.bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, 'Welcome! Use /createtip to submit a new tip.');
        });

        this.bot.onText(/\/createtip/, (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, 'Please provide the tip details in the following format:\nTitle | Description | Category | Location');
        });

        this.bot.on('message', (msg) => {
            if (msg.text && !msg.text.startsWith('/')) {
                this.handleTipCreation(msg);
            }
        });
    }

    private async handleTipCreation(msg: TelegramBot.Message) {
        console.log(msg);
        const chatId = msg.chat.id;
        const parts = msg.text.split('|').map(part => part.trim());

        if (parts.length !== 4) {
            this.bot.sendMessage(chatId, 'Invalid format. Please use: Title | Description | Category | Location');
            return;
        }

        const [title, description, category, location] = parts;

        const tipData: CreateTipDto = {
            title,
            description,
            category: this.mapCategory(category),
            datetime: new Date().toISOString(),
            location,
            priority: TipPriority.MEDIUM,
            reward: 0,
        };

        try {
            const createdTip = await this.createTelegramTip(msg.from.id.toString(), tipData);
            const referenceNumber = createdTip.id.substring(0, 6) + createdTip.id.substring(createdTip.id.length - 4);
            this.bot.sendMessage(chatId, `Your Tip has successfully been logged in the Multichoice Piracy Bounty Program. This is your reference number for future communication: ${referenceNumber}. We look forward to working with you to bring the perpetrators to justice.`);
        } catch (error) {
            this.bot.sendMessage(chatId, 'Failed to create tip. Please try again.');
        }
    }

    async createTelegramTip(telegramUserId: string, createTipDto: CreateTipDto) {
        let telegramUser = await this.prisma.telegramUser.findUnique({ where: { id: telegramUserId } });
        if (!telegramUser) {
            telegramUser = await this.prisma.telegramUser.create({
                data: { id: telegramUserId }
            });
        }

        const { ...tipData } = createTipDto;
        return this.prisma.tip.create({
            data: {
                ...tipData,
                telegramUser: { connect: { id: telegramUserId } },
            },
        });
    }

    async sendMessage(userId: string, message: string) {
        try {
            await this.bot.sendMessage(userId, message);
        } catch (error) {
            console.error('Failed to send Telegram message:', error);
        }
    }

    private mapCategory(category: string): TipCategory {
        switch (category.toLowerCase()) {
            case 'general': return TipCategory.GENERAL;
            case 'sighting': return TipCategory.SIGHTING;
            case 'intelligence': return TipCategory.INTELLIGENCE;
            case 'evidence': return TipCategory.EVIDENCE;
            default: return TipCategory.OTHER;
        }
    }
}