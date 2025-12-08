// frontend/app/lib/api/notifications.ts

export interface NotificationItem {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

import { withApiBase } from '@/app/lib/config';

/**
 * Obtiene notificaciones desde el Client Component.
 * Usa una URL absoluta basada en el entorno para evitar errores 404 en local.
 */
export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    // Usamos la ruta interna de Next para que el servidor añada el JWT
    const url = withApiBase(`/api/notifications/${userId}`, '');
    console.log('🔍 FETCHING URL (proxy):', url);
    const res = await fetch(url);
    
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