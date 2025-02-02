import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
    try {
        const { title, content } = await req.json();

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that suggests a single category for notes based on their title and content. Respond with just the category name, nothing else."
                },
                {
                    role: "user",
                    content: `Please suggest a category for a note with the following details:\nTitle: ${title}\nContent: ${content}`
                }
            ],
            model: "gpt-4o-mini",
            max_tokens: 10,
            temperature: 0.3,
        });

        const suggestion = completion.choices[0].message.content?.trim();
        return NextResponse.json({ category: suggestion });
    } catch (error) {
        console.error('Error generating category suggestion:', error);
        return NextResponse.json(
            { error: 'Failed to generate category suggestion' },
            { status: 500 }
        );
    }
} 