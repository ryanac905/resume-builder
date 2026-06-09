import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import { useResumeData, loadAllCVs } from '../hooks/useResumeData';
import { useAuth } from '../context/AuthContext';
import { useCloudSync } from '../hooks/useCloudSync';
import '../styles/app.css';
import '../styles/editor.css';
import '../styles/preview.css';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resumeData = useResumeData(id);
  const previewRef = useRef(null);
  const { user } = useAuth();
  const { saveCV } = useCloudSync();

  // After every change (data or template), push to cloud if logged in.
  // We use a ref to debounce the cloud save separately from localStorage save.
  const cloudSaveTimer = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(() => {
      // Read the freshly-saved localStorage record (written by useResumeData)
      const cvs = loadAllCVs() || {};
      const cv = cvs[id];
      if (cv) saveCV(user.id, cv);
    }, 1000); // 1 s after the local 500 ms debounce settles

    return () => {
      if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    };
  }, [resumeData.data, resumeData.template, user, id, saveCV]);

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
        setData={resumeData.setData}
        template={resumeData.template}
        setTemplate={resumeData.setTemplate}
        setTheme={resumeData.setTheme}
        clearAll={resumeData.clearAll}
        onDownloadPdf={handleDownloadPdf}
        onBackToDashboard={() => navigate('/')}
      />
      <Preview
        data={resumeData.data}
        template={resumeData.template}
        previewRef={previewRef}
      />
    </div>
  );
}
