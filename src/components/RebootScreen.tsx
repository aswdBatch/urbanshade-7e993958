import { useEffect, useState } from "react";

interface RebootScreenProps {
  onComplete: () => void;
}

export const RebootScreen = ({ onComplete }: RebootScreenProps) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [stage, setStage] = useState<"commands" | "black">("commands");

  const rebootMessages = [
    { text: "[  OK  ] Stopping all processes", duration: 400 },
    { text: "[  OK  ] Unmounting file systems", duration: 500 },
    { text: "[  OK  ] Stopping containment systems", duration: 600 },
    { text: "[  OK  ] Stopping security services", duration: 400 },
    { text: "[  OK  ] Stopping network services", duration: 500 },
    { text: "[  OK  ] Flushing system cache", duration: 300 },
    { text: "[  OK  ] Reached target Reboot", duration: 300 },
    { text: "", duration: 200 },
    { text: "[ INFO ] System restart initiated", duration: 400 },
    { text: "[ INFO ] Preparing for reboot...", duration: 500 },
    { text: "", duration: 200 },
    { text: "Reboot in progress...", duration: 600 },
  ];

  useEffect(() => {
    let currentIndex = 0;
    
    const showNextMessage = () => {
      if (currentIndex < rebootMessages.length) {
        const item = rebootMessages[currentIndex];
        if (item) {
          setMessages(prev => [...prev, item.text || ""]);
          const duration = item.duration || 500;
          currentIndex++;
          setTimeout(showNextMessage, duration);
        } else {
          currentIndex++;
          setTimeout(showNextMessage, 100);
        }
      } else {
        setTimeout(() => {
          setStage("black");
          setTimeout(onComplete, 1500);
        }, 500);
      }
    };

    showNextMessage();
  }, [onComplete]);

  if (stage === "black") {
    return <div className="fixed inset-0 bg-black" />;
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white font-mono">
      <div className="w-full max-w-3xl px-8">
        <div className="space-y-1 mb-6">
          {messages.map((msg, i) => (
            <div key={i} className="text-sm text-yellow-400 animate-fade-in">
              {msg}
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-8 text-center animate-pulse">
          Press DEL to enter BIOS Setup
        </div>
      </div>
    </div>
  );
};
