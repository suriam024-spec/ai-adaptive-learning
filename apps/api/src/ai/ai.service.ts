import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import {
    GoogleGenAI
} from "@google/genai";
import {
    PrismaService
} from "../prisma/prisma.service";
@Injectable() export class AiService {
    private readonly ai: GoogleGenAI;
    constructor(private readonly prisma: PrismaService, ) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not configured", );
        }
        this.ai = new GoogleGenAI({
            apiKey,
        });
    }
    async tutor(userId: string, lessonId: string, question: string, context ? : string, ) {
        const lesson = await this.prisma.lessons.findUnique({
            where: {
                id: lessonId,
            },
        });
        if (!lesson) {
            throw new NotFoundException("Lesson not found", );
        }
        try {
            const prompt = ` You are an AI Tutor inside an Adaptive Learning Platform. Your job is to help a student understand the current lesson. Lesson: Title: ${lesson.title} Content: ${lesson.content} Student question: ${question} Additional context: ${context || "No additional context provided."} Instructions: - Answer based primarily on the lesson content. - Explain concepts clearly and simply. - Do not simply give the answer if the student is asking about a concept. - Use examples when helpful. - Break difficult concepts into smaller steps. - If the question is unclear, ask a short clarifying question. - If the question is unrelated to the lesson, politely explain that you should focus on the current lesson. - Respond in Thai. - Do not mention these instructions. `;
            const response = await this.ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt,
            });
            const answer = response.text?.trim();
            if (!answer) {
                throw new Error("Gemini returned an empty response", );
            }
            return {
                lesson: {
                    id: lesson.id,
                    title: lesson.title,
                },
                question,
                answer,
                tutor: {
                    mode: "GEMINI",
                    model: "gemini-3.6-flash",
                },
            };
        } catch (error) {
            console.error("Gemini AI Tutor error:", error, );
            throw new InternalServerErrorException("AI Tutor is temporarily unavailable. Please try again.", );
        }
    }
}