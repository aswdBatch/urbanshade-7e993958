import { useState } from "react";
import { MessageCircle, Send, Search, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  status: "online" | "away" | "offline";
  unread: number;
}

const CONTACTS: Contact[] = [
  { id: "1", name: "Dr. Chen", role: "Research Lead", status: "online", unread: 2 },
  { id: "2", name: "Security Admin", role: "Security", status: "online", unread: 0 },
  { id: "3", name: "Dr. Martinez", role: "Biology", status: "away", unread: 1 },
  { id: "4", name: "Tech Support", role: "IT", status: "online", unread: 0 },
  { id: "5", name: "Facility Manager", role: "Operations", status: "offline", unread: 0 },
];

const SAMPLE_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      sender: "Dr. Chen",
      content: "Have you reviewed the latest experiment data?",
      timestamp: new Date(Date.now() - 3600000),
      isOwn: false
    },
    {
      id: "2",
      sender: "You",
      content: "Yes, the results are very promising. Subject Z-13 shows remarkable adaptation.",
      timestamp: new Date(Date.now() - 3300000),
      isOwn: true
    },
    {
      id: "3",
      sender: "Dr. Chen",
      content: "Agreed. We should schedule a team meeting to discuss phase 2.",
      timestamp: new Date(Date.now() - 1800000),
      isOwn: false
    }
  ],
  "2": [
    {
      id: "1",
      sender: "Security Admin",
      content: "Reminder: Security clearance renewal due this week.",
      timestamp: new Date(Date.now() - 7200000),
      isOwn: false
    }
  ]
};

export const InstantChat = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(SAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: "You",
      content: newMessage,
      timestamp: new Date(),
      isOwn: true
    };

    setMessages({
      ...messages,
      [selectedContact.id]: [...(messages[selectedContact.id] || []), message]
    });
    setNewMessage("");
  };

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-amber-500";
      case "offline": return "bg-gray-500";
    }
  };

  return (
    <div className="h-full flex bg-background">
      {/* Contacts List */}
      <div className="w-80 border-r flex flex-col bg-muted/20">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h2 className="font-bold text-lg">Instant Chat</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selectedContact?.id === contact.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10">
                      {contact.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(contact.status)}`} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-semibold truncate">{contact.name}</div>
                  <div className={`text-xs truncate ${selectedContact?.id === contact.id ? "opacity-80" : "text-muted-foreground"}`}>
                    {contact.role}
                  </div>
                </div>
                {contact.unread > 0 && (
                  <Badge className="bg-primary">{contact.unread}</Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/20">
                      {selectedContact.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(selectedContact.status)}`} />
                </div>
                <div>
                  <div className="font-bold">{selectedContact.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedContact.role} • {selectedContact.status}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(messages[selectedContact.id] || []).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] ${message.isOwn ? "order-2" : "order-1"}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                      </div>
                      <div className={`text-xs text-muted-foreground mt-1 ${message.isOwn ? "text-right" : "text-left"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Select a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};