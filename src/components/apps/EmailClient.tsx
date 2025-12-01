import { useState } from "react";
import { Mail, Send, Inbox, Star, Trash2, Archive, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  folder: "inbox" | "sent" | "trash";
}

const SAMPLE_EMAILS: Email[] = [
  {
    id: "1",
    from: "admin@urbanshade.corp",
    to: "you@urbanshade.corp",
    subject: "Weekly Security Briefing",
    body: "All personnel are reminded to complete security protocols training by end of week. Facility access will be restricted for non-compliant staff.\n\nUrgent: New containment procedures for Zone 7.",
    timestamp: new Date(Date.now() - 3600000),
    read: false,
    starred: true,
    folder: "inbox"
  },
  {
    id: "2",
    from: "research@urbanshade.corp",
    to: "you@urbanshade.corp",
    subject: "Experiment Results - Subject Z-13",
    body: "Initial test results show promising adaptability metrics. Recommend proceeding to phase 2 trials.\n\nDetailed report attached in secure database.",
    timestamp: new Date(Date.now() - 7200000),
    read: true,
    starred: false,
    folder: "inbox"
  },
  {
    id: "3",
    from: "facilities@urbanshade.corp",
    to: "you@urbanshade.corp",
    subject: "Maintenance Schedule Update",
    body: "Power grid maintenance scheduled for 0300 hours. Backup generators will be online. Minimal disruption expected.",
    timestamp: new Date(Date.now() - 86400000),
    read: true,
    starred: false,
    folder: "inbox"
  }
];

export const EmailClient = () => {
  const [emails, setEmails] = useState<Email[]>(SAMPLE_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [folder, setFolder] = useState<"inbox" | "sent" | "trash">("inbox");
  const [composing, setComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newEmail, setNewEmail] = useState({ to: "", subject: "", body: "" });

  const filteredEmails = emails.filter(
    (email) =>
      email.folder === folder &&
      (email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendEmail = () => {
    if (!newEmail.to || !newEmail.subject || !newEmail.body) {
      toast.error("Please fill all fields");
      return;
    }

    const sent: Email = {
      id: Date.now().toString(),
      from: "you@urbanshade.corp",
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      timestamp: new Date(),
      read: true,
      starred: false,
      folder: "sent"
    };

    setEmails([...emails, sent]);
    setNewEmail({ to: "", subject: "", body: "" });
    setComposing(false);
    toast.success("Email sent successfully");
  };

  const handleDelete = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, folder: "trash" as const } : e));
    setSelectedEmail(null);
    toast.success("Email moved to trash");
  };

  const handleStar = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e));
  };

  const unreadCount = emails.filter(e => e.folder === "inbox" && !e.read).length;

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col bg-muted/20">
        <div className="p-4 border-b">
          <Button className="w-full" onClick={() => setComposing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            <button
              onClick={() => setFolder("inbox")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                folder === "inbox" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Inbox className="w-5 h-5" />
              <span className="flex-1 text-left">Inbox</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {unreadCount}
                </Badge>
              )}
            </button>

            <button
              onClick={() => setFolder("sent")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                folder === "sent" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Send className="w-5 h-5" />
              <span className="flex-1 text-left">Sent</span>
            </button>

            <button
              onClick={() => setFolder("trash")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                folder === "trash" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span className="flex-1 text-left">Trash</span>
            </button>
          </div>
        </ScrollArea>
      </div>

      {/* Email List */}
      <div className="w-96 border-r flex flex-col">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => {
                setSelectedEmail(email);
                setComposing(false);
                if (!email.read) {
                  setEmails(emails.map(e => e.id === email.id ? { ...e, read: true } : e));
                }
              }}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedEmail?.id === email.id ? "bg-muted" : ""
              } ${!email.read ? "bg-primary/5" : ""}`}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{email.from}</div>
                  <div className="text-sm text-muted-foreground truncate">{email.subject}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStar(email.id);
                  }}
                >
                  <Star className={`w-4 h-4 ${email.starred ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                </button>
              </div>
              <div className="text-xs text-muted-foreground">
                {email.timestamp.toLocaleString()}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Email Content / Compose */}
      <div className="flex-1 flex flex-col">
        {composing ? (
          <div className="flex-1 flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">New Message</h2>
              <Button variant="ghost" onClick={() => setComposing(false)}>Cancel</Button>
            </div>
            <Input
              placeholder="To:"
              value={newEmail.to}
              onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
            />
            <Input
              placeholder="Subject:"
              value={newEmail.subject}
              onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
            />
            <Textarea
              placeholder="Message body..."
              value={newEmail.body}
              onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
              className="flex-1 resize-none"
            />
            <div className="flex justify-end">
              <Button onClick={handleSendEmail}>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        ) : selectedEmail ? (
          <div className="flex-1 flex flex-col">
            <div className="border-b p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{selectedEmail.subject}</h2>
                  <div className="text-sm text-muted-foreground">
                    <div>From: {selectedEmail.from}</div>
                    <div>To: {selectedEmail.to}</div>
                    <div>{selectedEmail.timestamp.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleStar(selectedEmail.id)}>
                    <Star className={`w-4 h-4 ${selectedEmail.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedEmail.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6 whitespace-pre-wrap">{selectedEmail.body}</div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};