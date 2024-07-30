import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { CreateTipDto } from '../tip/dto';
import { TipCategory, TipPriority } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import OpenAI from "openai";
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TelegramService {
    private bot: TelegramBot;
    private openai: OpenAI;

    constructor(private prisma: PrismaService) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN is not set');
        }
        this.bot = new TelegramBot(token, { polling: true });

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set');
        }
        this.openai = new OpenAI({ apiKey });

        this.setupListeners();
    }

    private setupListeners() {
        this.bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, 'Welcome! Send a voice note with details about a piracy event to submit a tip.');
        });

        this.bot.on('message', (msg) => {
            if (msg.text && !msg.text.startsWith('/')) {
                this.handleTipCreation(msg);
            }
        });

        this.bot.on('voice', (msg) => {
            this.handleVoiceNote(msg);
        });
    }

    private async handleTipCreation(msg: TelegramBot.Message) {
        const chatId = msg.chat.id;
        if (!msg.text) {
            await this.bot.sendMessage(chatId, 'Please provide text for the tip.');
            return;
        }
        const parts = msg.text.split('|').map(part => part.trim());

        if (parts.length !== 4) {
            await this.bot.sendMessage(chatId, 'Please send a voicenote describing the details of the tip, or send us a message with your tip in this format: Title | Description | Category | Location');
            return;
        }

        const [title, description, category, location] = parts;

        const tipData: CreateTipDto = {
            title,
            description,
            category: TipCategory.GENERAL,
            datetime: new Date().toISOString(),
            location,
            priority: TipPriority.MEDIUM,
            reward: 0,
        };

        try {
            const createdTip = await this.createTelegramTip(msg.from.id.toString(), tipData);
            const referenceNumber = createdTip.id.substring(0, 6) + createdTip.id.substring(createdTip.id.length - 4);
            // format this message so that it is easier to read
            await this.bot.sendMessage(
                chatId, 
                `Your tip has been successfully logged in the Multichoice Piracy Bounty Program.
            
Reference number: ${referenceNumber}

Summary of your tip:

Title:
${tipData.title}

Description:
${tipData.description}

Location:
${tipData.location}

Date:
${new Date(tipData.datetime).toLocaleString()}

Thank you for your contribution, we will review your tip and get back to you shortly.`
            );
        } catch (error) {
            console.error('Error creating tip:', error);
            await this.bot.sendMessage(chatId, 'Failed to create tip. Please try again.');
        }
    }

    private async handleVoiceNote(msg: TelegramBot.Message) {
        const chatId = msg.chat.id;
        const voiceNote = msg.voice;

        if (voiceNote) {
            const fileId = voiceNote.file_id;
            try {
                const fileInfo = await this.bot.getFile(fileId);
                const filePath = fileInfo.file_path;
                if (!filePath) {
                    throw new Error('File path is undefined');
                }
                const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;

                const localFilePath = await this.downloadFile(fileUrl, fileId);
                const transcription = await this.transcribeAudio(localFilePath);
                fs.unlinkSync(localFilePath);  // Clean up the local file after transcription

                const tipData = await this.processTipFromTranscription(transcription);
                const createdTip = await this.createTelegramTip(msg.from.id.toString(), tipData);

                const referenceNumber = createdTip.id.substring(0, 6) + createdTip.id.substring(createdTip.id.length - 4);
                await this.bot.sendMessage(
                    chatId, 
                    `Your tip has been successfully logged in the Multichoice Piracy Bounty Program.
                
Reference number: ${referenceNumber}

Summary of your tip:

Title:
${tipData.title}

Description:
${tipData.description}

Location:
${tipData.location}

Date:
${new Date(tipData.datetime).toLocaleString()}

Thank you for your contribution, we will review your tip and get back to you shortly.`
                );
            } catch (error) {
                console.error('Error handling voice note:', error);
                await this.bot.sendMessage(chatId, 'Failed to process the voice note. Please try again.');
            }
        }
    }

    private async downloadFile(fileUrl: string, fileId: string): Promise<string> {
        const tmpDir = path.join(__dirname, '../../tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir);
        }

        const localFilePath = path.join(tmpDir, `${fileId}.ogg`);
        const response = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'stream',
        });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(localFilePath);
            response.data.pipe(writer);
            writer.on('finish', () => resolve(localFilePath));
            writer.on('error', reject);
        });
    }

    private async transcribeAudio(filePath: string): Promise<string> {
        const file = fs.createReadStream(filePath);
        const response = await this.openai.audio.transcriptions.create({
            file,
            model: 'whisper-1',
        });
        return response.text;
    }

    private async processTipFromTranscription(transcription: string): Promise<CreateTipDto> {
        const prompt = `
        Analyze the following transcription of a piracy event tip:
        "${transcription}"
        
        Provide a response in the following JSON format:
        {
            "title": "A brief, high-level summary of the content",
            "location": "The location mentioned in the tip, or 'Unknown' if not specified"
        }
        `;

        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        const content = response.choices[0].message.content;
        const parsedContent = JSON.parse(content);

        return {
            title: parsedContent.title,
            description: transcription,
            category: TipCategory.GENERAL,
            datetime: new Date().toISOString(),
            location: parsedContent.location,
            priority: TipPriority.MEDIUM,
            reward: 0,
        };
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
}