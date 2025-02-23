import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJIS = ['👍', '👎', '❤️', '😊', '😂', '🎉', '🤔', '👀', '🔥', '✨'];

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1">
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
