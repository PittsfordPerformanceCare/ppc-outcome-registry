import { useState, useRef, useEffect } from 'react';
import { useTeamChat, TeamMember, TeamMessage } from '@/hooks/useTeamChat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  User,
  Stethoscope,
  Shield,
  Building2
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  clinician: { 
    icon: <Stethoscope className="h-3 w-3" />, 
    label: 'Clinician',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  },
  admin: { 
    icon: <Shield className="h-3 w-3" />, 
    label: 'Admin',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  },
  owner: { 
    icon: <Building2 className="h-3 w-3" />, 
    label: 'Owner',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
  },
};

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
}

interface TeamMemberListProps {
  members: TeamMember[];
  loading: boolean;
  onSelectMember: (id: string) => void;
}

function TeamMemberList({ members, loading, onSelectMember }: TeamMemberListProps) {
  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No team members available
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {members.map(member => {
        const roleConfig = ROLE_CONFIG[member.role];
        return (
          <button
            key={member.id}
            onClick={() => onSelectMember(member.id)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{member.name}</span>
                {member.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] text-[10px]">
                    {member.unreadCount}
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className={cn("text-[10px] mt-1", roleConfig.color)}>
                {roleConfig.icon}
                <span className="ml-1">{roleConfig.label}</span>
              </Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface MessageThreadProps {
  messages: TeamMessage[];
  currentUserId: string;
  selectedMember: TeamMember | undefined;
  onBack: () => void;
  onSend: (body: string) => Promise<void>;
  sendingMessage: boolean;
}

function MessageThread({ 
  messages, 
  currentUserId, 
  selectedMember, 
  onBack, 
  onSend,
  sendingMessage 
}: MessageThreadProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when thread opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || sendingMessage) return;
    const msg = inputValue;
    setInputValue('');
    await onSend(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedMember) return null;

  const roleConfig = ROLE_CONFIG[selectedMember.role];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{selectedMember.name}</p>
          <Badge variant="secondary" className={cn("text-[10px]", roleConfig.color)}>
            {roleConfig.icon}
            <span className="ml-1">{roleConfig.label}</span>
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    isOwn ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      isOwn 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}
                  >
                    {msg.body}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sendingMessage}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim() || sendingMessage}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TeamChatPanelProps {
  trigger?: React.ReactNode;
}

export function TeamChatPanel({ trigger }: TeamChatPanelProps) {
  const [open, setOpen] = useState(false);
  const {
    teamMembers,
    messages,
    currentUserId,
    selectedMemberId,
    loading,
    sendingMessage,
    selectMember,
    sendMessage,
  } = useTeamChat();

  const totalUnread = teamMembers.reduce((sum, m) => sum + m.unreadCount, 0);
  const selectedMember = teamMembers.find(m => m.id === selectedMemberId);

  const handleBack = () => {
    selectMember('');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            {totalUnread > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 min-w-[20px] text-[10px] p-0 flex items-center justify-center"
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[400px] p-0 flex flex-col">
        {!selectedMemberId ? (
          <>
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Team Chat
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <TeamMemberList 
                members={teamMembers} 
                loading={loading}
                onSelectMember={selectMember} 
              />
            </ScrollArea>
          </>
        ) : (
          <MessageThread
            messages={messages}
            currentUserId={currentUserId || ''}
            selectedMember={selectedMember}
            onBack={handleBack}
            onSend={sendMessage}
            sendingMessage={sendingMessage}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
