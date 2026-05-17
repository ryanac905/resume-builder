import React, { useRef } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { useResumeData } from './hooks/useResumeData';
import './styles/app.css';
import './styles/editor.css';
import './styles/preview.css';

export default function App() {
  const resumeData = useResumeData();
  const previewRef = useRef(null);

  const handleDownloadPdf = async () => {
    const element = previewRef.current;
    if (!element) return;

    const html2pdf = (await import('html2pdf.js')).default;

    const firstName = resumeData.data.personalInfo.firstName || 'Resume';
    const lastName = resumeData.data.personalInfo.lastName || '';
    const filename = `${firstName}${lastName ? '_' + lastName : ''}_Resume.pdf`;

    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="app-layout">
      <Editor
        data={resumeData.data}
        template={resumeData.template}
        setTemplate={resumeData.setTemplate}
        updatePersonalInfo={resumeData.updatePersonalInfo}
        updateSummary={resumeData.updateSummary}
        addExperience={resumeData.addExperience}
        updateExperience={resumeData.updateExperience}
        removeExperience={resumeData.removeExperience}
        addBullet={resumeData.addBullet}
        updateBullet={resumeData.updateBullet}
        removeBullet={resumeData.removeBullet}
        addEducation={resumeData.addEducation}
        updateEducation={resumeData.updateEducation}
        removeEducation={resumeData.removeEducation}
        updateSkills={resumeData.updateSkills}
        addProject={resumeData.addProject}
        updateProject={resumeData.updateProject}
        removeProject={resumeData.removeProject}
        clearAll={resumeData.clearAll}
        onDownloadPdf={handleDownloadPdf}
      />
      <Preview
        data={resumeData.data}
        template={resumeData.template}
        previewRef={previewRef}
      />
    </div>
  );
}
