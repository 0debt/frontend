// frontend/app/lib/api/notifications.ts

export interface NotificationItem {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 1. CONFIGURACIÓN DINÁMICA
// Leemos la variable de entorno pública.
// - En Local: Usará 'http://localhost:4000' (definido en tu .env.local o por defecto aquí)
// - En Producción: Usará la URL del Gateway que configuren en Coolify
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Obtiene notificaciones desde el Client Component.
 * Usa una URL absoluta basada en el entorno para evitar errores 404 en local.
 */
export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    // 2. PETICIÓN CON URL COMPLETA
    // Construimos la URL: "http://localhost:4000/notifications/123..."
    console.log('🔍 FETCHING URL:', `${API_URL}/notifications/${userId}`);
    const res = await fetch(`${API_URL}/notifications/${userId}`);
    
    if (!res.ok) {
      console.error('Error fetching notifications:', res.status, res.statusText);
      return [];
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error de red al buscar notificaciones:', error);
    return [];
  }
}