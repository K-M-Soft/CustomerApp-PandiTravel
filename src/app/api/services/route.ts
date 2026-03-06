import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addService, deleteService, getAllServices, updateService } from '@/lib/data';
import { isAdminRequest } from '@/lib/admin-auth';

const serviceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  sortOrder: z.number().int().nonnegative().default(0),
});

export async function GET() {
  try {
    return NextResponse.json(getAllServices());
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json({ error: 'Szolgáltatások lekérése sikertelen.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Nincs jogosultság.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = serviceSchema.parse(body);
    const created = addService(validatedData);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Érvénytelen szolgáltatás adat.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Szolgáltatás létrehozása sikertelen.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Nincs jogosultság.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = Number(body?.id);
    if (!id) {
      return NextResponse.json({ error: 'Hiányzik az ID.' }, { status: 400 });
    }

    const payload = serviceSchema.partial().parse(body);
    updateService(id, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update service error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Érvénytelen szolgáltatás adat.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Szolgáltatás frissítése sikertelen.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Nincs jogosultság.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ error: 'Hiányzik az ID.' }, { status: 400 });
    }

    deleteService(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json({ error: 'Szolgáltatás törlése sikertelen.' }, { status: 500 });
  }
}
