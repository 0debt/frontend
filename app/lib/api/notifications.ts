import { withApiBase } from '@/app/lib/config';

export interface NotificationItem {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/**
 * Obtiene notificaciones desde el Client Component.
 */
export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    // Usamos la ruta interna de Next (/api/...)
    const url = withApiBase(`/api/notifications/${userId}`, '');
    console.log('🔍 FETCHING URL:', url);
    
    // 🔥 IMPORTANTE: cache: 'no-store' obliga a pedir datos frescos siempre
    const res = await fetch(url, { cache: 'no-store' });
    
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

/**
 * Marca una notificación como leída
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    // Volvemos a usar el estándar /api/...
    const url = withApiBase(`/api/notifications/${notificationId}/read`, '');
    
    console.log('📝 MARKING AS READ:', notificationId, 'URL:', url);
    
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Evitamos caché en la respuesta de la actualización
    });

    console.log('📝 MARK AS READ RESPONSE:', res.status, res.ok);

    if (!res.ok) {
      console.error('Error marcando como leída:', res.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error de red al marcar como leída:', error);
    return false;
  }
}