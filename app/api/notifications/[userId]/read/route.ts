import { fetchWithAuth } from '@/app/lib/api';
import { NextRequest, NextResponse } from 'next/server';

// ✅ El nombre en params debe ser 'userId' porque tu carpeta es [userId]
export async function PATCH(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // 1. Next.js extrae el valor de la URL y lo pone en userId
    const { userId: notificationId } = await context.params;

    // 2. Usar fetchWithAuth para incluir el token JWT automáticamente
    const res = await fetchWithAuth(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      console.error(`[PROXY PATCH] El Backend falló: ${res.status}`);
      return new NextResponse(res.statusText, { status: res.status });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[PROXY PATCH] Error en el Proxy:", error);
    return new NextResponse("Error de conexión", { status: 500 });
  }
}