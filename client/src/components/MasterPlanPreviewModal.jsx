import React, { useState, useEffect } from 'react';
import { X, ExternalLink, FileText, Loader, Download } from 'lucide-react';

const MasterPlanPreviewModal = ({ url, title = 'Master plan', onClose }) => {
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState('unknown');

  useEffect(() => {
    if (!url) return;

    // זיהוי סוג הקובץ וייצור URL לתצוגה מקדימה
    const processUrl = () => {
      // בדיקה אם זה PDF של Cloudinary
      if (url.includes('cloudinary.com') && url.toLowerCase().endsWith('.pdf')) {
        setFileType('pdf');
        // הטריק: החלפת הסיומת .pdf ב-.jpg כדי לקבל את העמוד הראשון כתמונה
        // הוספת f_auto,q_auto לאופטימיזציה אוטומטית
        const imageUrl = url.replace(/\.pdf$/i, '.jpg'); 
        
        // אם ה-URL לא מכיל טרנספורמציות, נוסיף אותן אחרי /upload/
        if (!imageUrl.includes('/upload/f_auto')) {
             return imageUrl.replace('/upload/', '/upload/f_auto,q_auto,pg_1/');
        }
        return imageUrl;
      }
      
      // אם זו תמונה רגילה
      if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes('cloudinary.com')) {
        setFileType('image');
        return url;
      }

      // אחרת (למשל קובץ לא מזוהה)
      setFileType('other');
      return url;
    };

    setPreviewUrl(processUrl());
  }, [url]);

  const handleImageLoad = () => setLoading(false);
  const handleImageError = () => setLoading(false); // במקרה של שגיאה נציג כפתור הורדה

  if (!url) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 w-full max-w-5xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{title}</h3>
              <p className="text-xs text-slate-400">
                {fileType === 'pdf' ? 'PDF Preview (First Page)' : 'Image Preview'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              download
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-colors inline-flex items-center gap-2"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download Original</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 bg-black/50 overflow-auto flex items-center justify-center min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader className="animate-spin text-blue-500" size={40} />
                <span className="text-slate-400 text-sm">Loading preview...</span>
              </div>
            </div>
          )}

          {/* תצוגה חכמה: גם ל-PDF אנחנו מציגים תמונה של העמוד הראשון */}
          {(fileType === 'pdf' || fileType === 'image') ? (
            <img 
              src={previewUrl} 
              alt={title} 
              className={`max-w-full max-h-[80vh] object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            // Fallback לקבצים שלא ניתן להציג כתמונה
            <div className="text-center p-8">
              <FileText size={64} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-300 mb-4">Preview not available for this file type.</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Click here to view file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterPlanPreviewModal;