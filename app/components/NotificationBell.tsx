'use client';

import { getNotifications, markAsRead, type NotificationItem } from '@/app/lib/api/notifications';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shadcn/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shadcn/components/ui/popover';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { Bell, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar notificaciones
  useEffect(() => {
    if (!user?.id) return;
    getNotifications(user.id).then(setNotifications);
  }, [user?.id, isAuthenticated, isOpen]);

  // 👇 LÓGICA NUEVA: Al hacer clic, marcamos como leído
  const handleNotificationClick = async (notificationId: string) => {
    // 1. Actualización visual instantánea (quita el punto rojo y el fondo azul ya)
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );

    // 2. Guardamos en la base de datos
    await markAsRead(notificationId);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isAuthenticated && !process.env.MOCK_AUTH) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white animate-pulse" />
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
          <h4 className="font-semibold text-sm">Notificaciones</h4>
          {unreadCount > 0 ? (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {unreadCount} nuevas
            </span>
          ) : (
             <span className="text-xs text-muted-foreground">Todo leído</span>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-2">
              <Bell className="h-8 w-8 opacity-20" />
              <p className="text-sm">Todo al día</p>
            </div>
          ) : (
            <div className="grid">
              {notifications.map((n) => (
                <div 
                  key={n._id} 
                  // 👇 AQUI ESTÁ LA MAGIA DEL CLIC
                  onClick={() => !n.read && handleNotificationClick(n._id)}
                  className={`
                    relative flex flex-col p-4 border-b text-sm transition-all duration-200
                    ${!n.read 
                        ? 'bg-blue-50/50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100/50' 
                        : 'opacity-60'
                    }
                  `}
                >
                  <div className="flex justify-between items-start gap-2">
                      <p className={`leading-relaxed ${!n.read ? 'font-medium' : ''}`}>
                        {n.message}
                      </p>
                      {n.read && <Check className="h-3 w-3 text-muted-foreground mt-1" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                  {!n.read && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}