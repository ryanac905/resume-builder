import React from 'react';
import Modern from './templates/Modern';
import Classic from './templates/Classic';
import Minimal from './templates/Minimal';

const TEMPLATES = {
  modern: Modern,
  classic: Classic,
  minimal: Minimal,
};

export default function Preview({ data, template, previewRef }) {
  const TemplateComponent = TEMPLATES[template] || Modern;

  return (
    <div className="preview-panel">
      <div className="preview-scroll">
        <div className="resume-card" ref={previewRef} id="resume-preview">
          <TemplateComponent data={data} />
        </div>
      </div>
    </div>
  );
}
