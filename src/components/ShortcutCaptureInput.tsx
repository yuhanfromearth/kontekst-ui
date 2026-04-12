import { useRef, useState } from "react";
import { Input } from "#/components/ui/input";
import { SHORTCUT_VALIDATION_ERROR } from "#/lib/shortcut";

interface ShortcutCaptureInputProps {
  value: string;
  onChange: (v: string) => void;
  onError: (e: string | null) => void;
}

export function ShortcutCaptureInput({
  value,
  onChange,
  onError,
}: ShortcutCaptureInputProps) {
  const [capturing, setCapturing] = useState(false);
  const [preview, setPreview] = useState("");
  const pressedLetters = useRef<Set<string>>(new Set());
  const metaHeld = useRef(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.key === "Escape") {
      pressedLetters.current.clear();
      metaHeld.current = false;
      setPreview("");
      return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      onChange("");
      onError(null);
      pressedLetters.current.clear();
      setPreview("");
      return;
    }

    if (e.key === "Meta") {
      // Sticky toggle: press+release ⌘ first, then the letter, so the browser
      // never sees Cmd+letter as a chord (prevents new-tab, etc.)
      metaHeld.current = !metaHeld.current;
      setPreview(metaHeld.current ? "cmd+..." : "");
      return;
    }

    if (["Control", "Shift", "Alt"].includes(e.key)) {
      onError(SHORTCUT_VALIDATION_ERROR);
      return;
    }

    const key = e.key.toLowerCase();
    if (!/^[a-z0-9]$/.test(key)) {
      onError(SHORTCUT_VALIDATION_ERROR);
      return;
    }

    if (metaHeld.current) {
      onChange(`cmd+${key}`);
      onError(null);
      metaHeld.current = false;
      pressedLetters.current.clear();
      setPreview("");
    } else {
      pressedLetters.current.add(key);
      setPreview(Array.from(pressedLetters.current).sort().join("+"));
      onError(null);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Meta is sticky (handled on keydown), ignore modifier releases
    if (["Meta", "Control", "Shift", "Alt"].includes(e.key)) return;

    const key = e.key.toLowerCase();
    if (pressedLetters.current.has(key) && pressedLetters.current.size > 0) {
      const sc = Array.from(pressedLetters.current).sort().join("+");
      onChange(sc);
      pressedLetters.current.clear();
      setPreview("");
    }
  };

  const handleBlur = () => {
    setCapturing(false);
    pressedLetters.current.clear();
    if (metaHeld.current) {
      metaHeld.current = false;
      setPreview("");
    }
  };

  const displayValue = capturing && preview ? preview : value;

  return (
    <Input
      id="shortcut"
      value={displayValue}
      readOnly
      placeholder="Click and press shortcut…"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={() => setCapturing(true)}
      onBlur={handleBlur}
      className={capturing ? "ring-2 ring-ring" : ""}
    />
  );
}
