import { NextRequest, NextResponse } from 'next/server';
import { getAllPricings, addPricing, updatePricing, deletePricing, getPricingById } from '@/lib/data';
import { z } from 'zod';

const pricingSchema = z.object({
  name: z.string().min(1),
  pricePerKm: z.number().positive(),
  basePrice: z.number().nonnegative(),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const pricings = getAllPricings();
    return NextResponse.json(pricings);
  } catch (error) {
    console.error('Get pricings error:', error);
    return NextResponse.json({ error: 'Failed to fetch pricings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = pricingSchema.parse(body);

    const pricing = addPricing({
      name: validatedData.name,
      pricePerKm: validatedData.pricePerKm,
      basePrice: validatedData.basePrice,
      description: validatedData.description,
    });

    return NextResponse.json(pricing, { status: 201 });
  } catch (error) {
    console.error('Add pricing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid pricing data', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create pricing' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const pricing = getPricingById(id);
    if (!pricing) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    }

    updatePricing(id, updateData);
    const updated = getPricingById(id);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update pricing error:', error);
    return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const pricing = getPricingById(parseInt(id));
    if (!pricing) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    }

    deletePricing(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete pricing error:', error);
    return NextResponse.json({ error: 'Failed to delete pricing' }, { status: 500 });
  }
}
