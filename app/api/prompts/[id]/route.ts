
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prompt = await prisma.assembledPrompt.findUnique({
      where: { id: params.id },
      include: {
        context: true,
        instructions: true,
        details: true,
        input: true,
      },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, contextId, instructionsId, detailsId, inputId, finalPromptText } = body;

    const prompt = await prisma.assembledPrompt.update({
      where: { id: params.id },
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

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.assembledPrompt.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
