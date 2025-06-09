
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [totalComponents, totalPrompts, componentsByType] = await Promise.all([
      prisma.cidiComponent.count(),
      prisma.assembledPrompt.count(),
      prisma.cidiComponent.groupBy({
        by: ['type'],
        _count: {
          type: true,
        },
      }),
    ]);

    const componentStats = {
      CONTEXT: 0,
      INSTRUCTIONS: 0,
      DETAILS: 0,
      INPUT: 0,
    };

    componentsByType.forEach((item) => {
      componentStats[item.type] = item._count.type;
    });

    return NextResponse.json({
      totalComponents,
      totalPrompts,
      componentsByType: componentStats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
