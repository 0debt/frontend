import { NextRequest, NextResponse } from 'next/server';

// ✅ El nombre en params debe ser 'userId' porque tu carpeta es [userId]
export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // 1. Next.js extrae el valor de la URL y lo pone en userId
    const { userId: notificationId } = await context.params;

    // 2. Definimos la URL (Gateway en Prod / Localhost en Dev)
    const API_URL = process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    // Construimos la ruta final al backend
    const backendUrl = `${API_URL}/notifications/${notificationId}/read`;

    console.log(`[PROXY PATCH] Conectando con: ${backendUrl}`);

    const res = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Vital para que no guarde el estado antiguo
    });

    if (!res.ok) {
      console.error(` El Backend falló: ${res.status}`);
      return new NextResponse(res.statusText, { status: res.status });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(" Error en el Proxy:", error);
    return new NextResponse("Error de conexión", { status: 500 });
  }
}