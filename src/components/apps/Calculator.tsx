import { useState } from "react";
import { Calculator as CalcIcon } from "lucide-react";

export const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue !== null && operation && !newNumber) {
      calculate();
    } else {
      setPreviousValue(current);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = () => {
    if (previousValue === null || operation === null) return;
    
    const current = parseFloat(display);
    let result = 0;
    
    switch (operation) {
      case "+":
        result = previousValue + current;
        break;
      case "-":
        result = previousValue - current;
        break;
      case "*":
        result = previousValue * current;
        break;
      case "/":
        result = previousValue / current;
        break;
    }
    
    setDisplay(result.toString());
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".");
      setNewNumber(false);
    }
  };

  const Button = ({ value, onClick, className = "" }: { value: string; onClick: () => void; className?: string }) => (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 font-bold text-lg transition-all hover:scale-105 active:scale-95 ${className}`}
    >
      {value}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm flex items-center gap-2">
        <CalcIcon className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-foreground">Calculator</h2>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-3">
          {/* Display */}
          <div className="p-6 rounded-2xl bg-muted/30 backdrop-blur border border-border/30 shadow-lg">
            <div className="text-right text-5xl font-bold text-foreground font-mono break-all min-h-[60px] flex items-center justify-end">
              {display}
            </div>
            {operation && (
              <div className="text-right text-sm text-muted-foreground mt-3 font-mono">
                {previousValue} {operation}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button value="7" onClick={() => handleNumber("7")} />
            <Button value="8" onClick={() => handleNumber("8")} />
            <Button value="9" onClick={() => handleNumber("9")} />
            <Button value="÷" onClick={() => handleOperation("/")} className="text-primary bg-primary/10" />
            
            <Button value="4" onClick={() => handleNumber("4")} />
            <Button value="5" onClick={() => handleNumber("5")} />
            <Button value="6" onClick={() => handleNumber("6")} />
            <Button value="×" onClick={() => handleOperation("*")} className="text-primary bg-primary/10" />
            
            <Button value="1" onClick={() => handleNumber("1")} />
            <Button value="2" onClick={() => handleNumber("2")} />
            <Button value="3" onClick={() => handleNumber("3")} />
            <Button value="−" onClick={() => handleOperation("-")} className="text-primary bg-primary/10" />
            
            <Button value="C" onClick={clear} className="text-destructive bg-destructive/20 hover:bg-destructive/30" />
            <Button value="0" onClick={() => handleNumber("0")} />
            <Button value="." onClick={handleDecimal} />
            <Button value="+" onClick={() => handleOperation("+")} className="text-primary bg-primary/10" />
            
            <button
              onClick={calculate}
              className="col-span-4 p-4 rounded-xl bg-primary hover:bg-primary/90 font-bold text-lg text-primary-foreground transition-all hover:scale-105 active:scale-95"
            >
              =
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
