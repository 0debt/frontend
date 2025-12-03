'use client';

import { getNotifications, type NotificationItem } from '@/app/lib/api/notifications';
import { useAuth } from '@/app/providers/AuthProvider'; //
import { Button } from '@/shadcn/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shadcn/components/ui/popover';
import { ScrollArea } from '@/shadcn/components/ui/scroll-area';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth(); //
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar notificaciones
  useEffect(() => {
    // Verificamos si hay usuario y tiene 'sub' (que es el userId en Mongo)
    if (isAuthenticated && user?.id) { 
      getNotifications(user.id).then((data) => {
        setNotifications(data);
      });
    }
  }, [isAuthenticated, user, isOpen]);

  // Si no está logueado, no mostramos nada
  if (!isAuthenticated) return null;

  // Contamos las no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

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
          {unreadCount > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {unreadCount} nuevas
            </span>
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
                  className={`p-4 border-b text-sm hover:bg-muted/50 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <p className="leading-relaxed">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}