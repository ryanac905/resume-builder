import React, { useRef, useEffect } from 'react';

/**
 * Lightweight rich-text editor (resume.io style).
 * Stores HTML. Uses contentEditable + execCommand for formatting.
 */
export default function RichText({ value, onChange, placeholder }) {
  const ref = useRef(null);

  // Set the initial HTML once on mount. We intentionally do NOT sync on every
  // `value` change to avoid the caret jumping while the user types.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = () => {
    if (onChange && ref.current) onChange(ref.current.innerHTML);
  };

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    if (ref.current) ref.current.focus();
    handleInput();
  };

  const handleFontSize = (e) => {
    const size = e.target.value;
    if (size) {
      // execCommand fontSize uses 1–7 size keywords
      document.execCommand('fontSize', false, size);
      if (ref.current) ref.current.focus();
      handleInput();
    }
    e.target.value = ''; // reset back to the label
  };

  const ToolbarButton = ({ cmd, title, children }) => (
    <button
      type="button"
      className="rt-btn"
      title={title}
      // preventDefault keeps the text selection inside the editor
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => exec(cmd)}
    >
      {children}
    </button>
  );

  return (
    <div className="richtext">
      <div className="richtext-toolbar">
        <ToolbarButton cmd="bold" title="Bold"><b>B</b></ToolbarButton>
        <ToolbarButton cmd="italic" title="Italic"><i>I</i></ToolbarButton>
        <ToolbarButton cmd="underline" title="Underline"><u>U</u></ToolbarButton>
        <span className="rt-divider" />
        <select
          className="rt-select"
          title="Font size"
          defaultValue=""
          onMouseDown={(e) => e.stopPropagation()}
          onChange={handleFontSize}
        >
          <option value="" disabled>Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="6">Heading</option>
        </select>
        <span className="rt-divider" />
        <ToolbarButton cmd="insertUnorderedList" title="Bullet list">• List</ToolbarButton>
        <ToolbarButton cmd="insertOrderedList" title="Numbered list">1. List</ToolbarButton>
      </div>
      <div
        ref={ref}
        className="richtext-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder || 'Start typing...'}
      />
    </div>
  );
}
