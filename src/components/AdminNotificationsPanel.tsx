import { Bell, CheckCheck, FileText, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AdminNotificationsPanel() {
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useAdminNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    // Mark as read
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    // Navigate to the relevant entity
    if (notification.entity_type === "episode" && notification.entity_id) {
      navigate(`/episodes/${notification.entity_id}`);
    } else if (notification.entity_type === "intake_form" && notification.entity_id) {
      navigate(`/admin/intakes?highlight=${notification.entity_id}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "intake_converted":
        return <FileText className="h-4 w-4 text-primary" />;
      case "episode_discharged":
        return <UserCheck className="h-4 w-4 text-accent-foreground" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="flex flex-row items-center justify-between pb-4">
          <SheetTitle>Clinical Activity</SheetTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="text-xs gap-1"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">No notifications yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                You'll see clinical activity here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors hover:bg-accent",
                    !notification.read_at && "bg-accent/50 border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.read_at && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
