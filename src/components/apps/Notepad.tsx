import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Notepad = () => {
  const [content, setContent] = useState("");

  const handleSave = () => {
    toast.success("Note saved successfully!");
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/10">
      <div className="border-b border-border/50 p-3 flex items-center gap-3 bg-background/50 backdrop-blur-sm">
        <FileText className="w-5 h-5 text-primary" />
        <span className="text-sm font-mono font-semibold text-foreground">NOTEPAD.TXT</span>
        <div className="flex-1" />
        <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your notes..."
          className="h-full border border-border/30 rounded-lg resize-none focus-visible:ring-2 focus-visible:ring-primary/50 font-mono text-base bg-background/50 backdrop-blur-sm"
        />
      </div>
    </div>
  );
};
