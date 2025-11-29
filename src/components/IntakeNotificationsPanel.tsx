import { Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIntakeNotifications } from '@/hooks/useIntakeNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

export const IntakeNotificationsPanel = () => {
  const { notifications, unreadCount, markAsRead, clearAll } = useIntakeNotifications();
  const navigate = useNavigate();
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OagTgwOUKzn77dmHAU2jdXvxnkpBSh+zPLaizsKGGS36eylUxELTKXh8bllHgU1iM/u0H8yBSl+y+3ajDwMFmW56+uhUBELSKPi8bxnHwU4h9Hs0oA0Bit7yu3cjDoLFW');
    audioRef.current.volume = 0.5;
  }, []);

  // Load inbox message count
  const loadInboxCount = async () => {
    try {
      const { count } = await supabase
        .from("patient_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      setInboxUnreadCount(count || 0);
    } catch (error) {
      console.error("Error loading inbox count:", error);
    }
  };

  // Set up real-time listener for new messages
  useEffect(() => {
    loadInboxCount();

    const channel = supabase
      .channel("inbox-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "patient_messages",
        },
        () => {
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.error("Error playing sound:", err));
          }
          
          // Reload count
          loadInboxCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    navigate('/intake-review', { state: { intakeId: id } });
  };

  const totalUnreadCount = unreadCount + inboxUnreadCount;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Intake forms and patient messages
          </SheetDescription>
        </SheetHeader>

        {/* Clinician Inbox Summary */}
        {inboxUnreadCount > 0 && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/clinician-inbox')}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Clinician Inbox</div>
                <div className="text-sm text-muted-foreground">
                  {inboxUnreadCount} unread message{inboxUnreadCount !== 1 ? 's' : ''}
                </div>
              </div>
              <Badge variant="destructive" className="text-sm">
                {inboxUnreadCount}
              </Badge>
            </Button>
            <Separator className="my-4" />
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {unreadCount} intake form{unreadCount !== 1 ? 's' : ''}
          </p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)] mt-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p>No pending intake forms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{notification.patient_name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.submitted_at), { 
                        addSuffix: true 
                      })}
                    </span>
                  </div>

                  {notification.red_flags.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">
                          {notification.red_flags.length} Red Flag{notification.red_flags.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <ul className="text-sm text-destructive space-y-1">
                        {notification.red_flags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1">⚠️</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {notification.incomplete_sections.length > 0 && (
                    <div>
                      <Badge variant="outline" className="text-xs mb-1">
                        {notification.incomplete_sections.length} Incomplete Section{notification.incomplete_sections.length !== 1 ? 's' : ''}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {notification.incomplete_sections.join(', ')}
                      </p>
                    </div>
                  )}

                  {notification.red_flags.length === 0 && notification.incomplete_sections.length === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Complete - Ready for review
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
