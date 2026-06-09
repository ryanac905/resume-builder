import React from 'react';
import ResumeRenderer from './ResumeRenderer';

export default function Preview({ data, template, previewRef }) {
  return (
    <div className="preview-panel">
      <div className="preview-scroll">
        <div className="resume-card" id="resume-preview">
          <ResumeRenderer data={data} template={template} previewRef={previewRef} />
        </div>
      </div>
    </div>
  );
}
