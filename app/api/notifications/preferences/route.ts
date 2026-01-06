import { fetchWithAuth } from "@/app/lib/api";
import { API_GATEWAY_URL } from "@/app/lib/config";
import { isMockAuthEnabled as isMockEnabled } from "@/app/lib/mock-data/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (isMockEnabled) {
    return NextResponse.json({ status: 'success' });
  }

  try {
    const body = await req.json();

    // El Gateway mapea /preferences (POST) al servicio de notificaciones
    const res = await fetchWithAuth('/preferences', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      return new NextResponse(res.statusText, { status: res.status });
    }

    const data = await res.json();

    // Send welcome email after successfully saving preferences
    try {
      await fetch(`${API_GATEWAY_URL}/email/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: body.email, name: body.name || 'User' })
      });
    } catch (emailError) {
      // Log error but don't fail the request - preferences were saved successfully
      console.error("Error sending welcome email:", emailError);
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error saving preferences:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
