import { NextRequest, NextResponse } from 'next/server';
import { getAllDistances, addDistance, updateDistance, deleteDistance, getDistance } from '@/lib/data';
import { z } from 'zod';

const distanceSchema = z.object({
  from_location: z.string().min(1),
  to_location: z.string().min(1),
  kilometers: z.number().positive(),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const distances = getAllDistances();
    return NextResponse.json(distances);
  } catch (error) {
    console.error('Get distances error:', error);
    return NextResponse.json({ error: 'Failed to fetch distances' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = distanceSchema.parse(body);

    // Check if distance already exists
    const existing = getDistance(validatedData.from_location, validatedData.to_location);
    if (existing) {
      return NextResponse.json(
        { error: 'Distance already exists for these locations' },
        { status: 400 }
      );
    }

    const distance = addDistance({
      from_location: validatedData.from_location,
      to_location: validatedData.to_location,
      kilometers: validatedData.kilometers,
      description: validatedData.description,
    });

    return NextResponse.json(distance, { status: 201 });
  } catch (error) {
    console.error('Add distance error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid distance data', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create distance' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const fromLoc = searchParams.get('from');
    const toLoc = searchParams.get('to');

    let distance;
    if (fromLoc && toLoc) {
      distance = getDistance(fromLoc, toLoc);
    }

    if (!distance) {
      return NextResponse.json({ error: 'Distance not found' }, { status: 404 });
    }

    updateDistance(id, updateData);
    const updated = getDistance(distance.from_location, distance.to_location);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update distance error:', error);
    return NextResponse.json({ error: 'Failed to update distance' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    deleteDistance(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete distance error:', error);
    return NextResponse.json({ error: 'Failed to delete distance' }, { status: 500 });
  }
}
