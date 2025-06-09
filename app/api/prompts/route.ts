
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const prompts = await prisma.assembledPrompt.findMany({
      include: {
        context: true,
        instructions: true,
        details: true,
        input: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contextId, instructionsId, detailsId, inputId, finalPromptText } = body;

    if (!name || !finalPromptText) {
      return NextResponse.json(
        { error: 'Name and final prompt text are required' },
        { status: 400 }
      );
    }

    const prompt = await prisma.assembledPrompt.create({
      data: {
        name,
        finalPromptText,
        contextId: contextId || null,
        instructionsId: instructionsId || null,
        detailsId: detailsId || null,
        inputId: inputId || null,
      },
      include: {
        context: true,
        instructions: true,
        details: true,
        input: true,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
