
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let where: any = {};

    if (type && type !== 'all') {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const components = await prisma.cidiComponent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, tags, type } = body;

    // Validation
    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    // Prepare data for database
    const componentData = {
      title,
      content,
      category: category || null,
      tags: tags || [],
      type,
    };

    const component = await prisma.cidiComponent.create({
      data: componentData,
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error: any) {
    console.error('Error creating component:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create component',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
