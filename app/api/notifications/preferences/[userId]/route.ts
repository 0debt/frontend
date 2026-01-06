import { fetchWithAuth } from "@/app/lib/api"
import { isMockAuthEnabled as isMockEnabled } from "@/app/lib/mock-data/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params

  if (isMockEnabled) {
    return NextResponse.json({
        globalEmailNotifications: true,
        alertOnNewGroup: true,
        alertOnExpenseCreation: true,
        emailSummaryFrequency: 'weekly'
    });
  }

  try {
    // El Gateway mapea /preferences al servicio de notificaciones
    const res = await fetchWithAuth(`/preferences/${userId}`, {
      cache: 'no-store'
    })

    if (!res.ok) {
      // Si no existe, devolvemos objeto vacío
      if (res.status === 404) return NextResponse.json({});
      return new NextResponse(res.statusText, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching preferences:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
