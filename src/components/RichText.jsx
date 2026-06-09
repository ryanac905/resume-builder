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

  // Apply an exact pixel font size to the selection (Word-style numeric sizes).
  // execCommand('fontSize') only supports 1–7, so we tag with size 7 then
  // rewrite those <font> tags into spans carrying the real px size.
  const handleFontSize = (e) => {
    const px = e.target.value;
    e.target.value = '';
    if (!px || !ref.current) return;
    document.execCommand('fontSize', false, '7');
    ref.current.querySelectorAll('font[size="7"]').forEach((f) => {
      const span = document.createElement('span');
      span.style.fontSize = px + 'px';
      while (f.firstChild) span.appendChild(f.firstChild);
      f.replaceWith(span);
    });
    ref.current.focus();
    handleInput();
  };

  const handleFontFamily = (e) => {
    const family = e.target.value;
    e.target.value = '';
    if (!family || !ref.current) return;
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('fontName', false, family);
    ref.current.focus();
    handleInput();
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
          className="rt-select rt-select-font"
          title="Font style"
          defaultValue=""
          onChange={handleFontFamily}
        >
          <option value="" disabled>Font</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
          <option value="Calibri, sans-serif">Calibri</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="Verdana, sans-serif">Verdana</option>
        </select>
        <select
          className="rt-select"
          title="Font size"
          defaultValue=""
          onChange={handleFontSize}
        >
          <option value="" disabled>Size</option>
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
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
