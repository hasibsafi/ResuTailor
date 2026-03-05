"use client";

import { useCallback } from "react";
import { Bold } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BoldToggleButtonProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (newValue: string) => void;
}

export function BoldToggleButton({ textareaRef, value, onChange }: BoldToggleButtonProps) {
  const handleToggleBold = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    // Check if already bold: selection is wrapped with ** on both sides
    const alreadyBold =
      before.endsWith("**") && after.startsWith("**");

    let newValue: string;
    let newStart: number;
    let newEnd: number;

    if (alreadyBold) {
      // Remove the ** markers
      newValue = before.slice(0, -2) + selected + after.slice(2);
      newStart = start - 2;
      newEnd = end - 2;
    } else {
      // Add ** markers
      newValue = before + "**" + selected + "**" + after;
      newStart = start + 2;
      newEnd = end + 2;
    }

    onChange(newValue);

    // Restore selection after React re-render
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    });
  }, [textareaRef, value, onChange]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleBold}
      className="mt-1 h-7 w-7 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      title="Bold (select text first)"
      type="button"
    >
      <Bold className="h-3.5 w-3.5" />
    </Button>
  );
}
