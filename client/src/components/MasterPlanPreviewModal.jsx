import React, { useState, useEffect } from 'react';
import { X, ExternalLink, FileText, Loader } from 'lucide-react';

const isImageUrl = (url) => {
  if (!url) return false;
  // Check for image extensions in URL
  if (/\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/i.test(url)) return true;
  // Check if it's a Cloudinary image URL
  if (/cloudinary\.com.*\/image\/upload/i.test(url)) return true;
  // Check if it's a Cloudinary URL with image format
  if (/cloudinary\.com.*\/v\d+\/.*\.(png|jpe?g|webp|gif)/i.test(url)) return true;
  // Check if it's a Cloudinary URL (most Cloudinary URLs are images by default)
  if (/cloudinary\.com/i.test(url) && !/\.pdf/i.test(url)) return true;
  return false;
};

const isPdfUrl = (url) => {
  if (!url) return false;
  // Check for PDF extension in URL
  if (/\.(pdf)(\?|#|$)/i.test(url)) return true;
  // Check if it's a Cloudinary PDF URL (raw upload)
  if (/cloudinary\.com.*\/raw\/upload/i.test(url)) return true;
  // Check if URL contains pdf in path
  if (/cloudinary\.com.*\/.*\.pdf/i.test(url)) return true;
  // Check if it's a Cloudinary URL with format=pdf
  if (/cloudinary\.com.*[\/_]pdf/i.test(url)) return true;
  // If it's Cloudinary and not an image URL, assume it might be PDF
  if (/cloudinary\.com/i.test(url) && !/cloudinary\.com.*\/image\/upload/i.test(url)) {
    // Check if it's raw upload (likely PDF)
    if (/cloudinary\.com.*\/raw\/upload/i.test(url) || /cloudinary\.com.*\/v\d+\/.*\/.*\.(pdf|raw)/i.test(url)) {
      return true;
    }
  }
  return false;
};

const MasterPlanPreviewModal = ({ url, title = 'Master plan', onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewType, setPreviewType] = useState('auto');

  useEffect(() => {
    if (url) {
      console.log('MasterPlanPreviewModal - URL:', url);
      setLoading(true);
      setError(false);
      const isImage = isImageUrl(url);
      const isPdf = isPdfUrl(url);
      console.log('MasterPlanPreviewModal - Is Image:', isImage, 'Is PDF:', isPdf);
      
      if (isImage) {
        setPreviewType('image');
        setLoading(false);
      } else if (isPdf) {
        setPreviewType('pdf');
        // For PDFs, use Google Docs Viewer - it prevents download
        setLoading(false);
      } else {
        setPreviewType('iframe');
        setLoading(false);
      }
    }
  }, [url]);

  if (!url) return null;

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  // Google Docs Viewer URL - this prevents download
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50" onClick={onClose}>
      <div className="bg-slate-900 w-full max-w-5xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileText size={18} />
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 inline-flex items-center gap-1"
            >
              Open <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
              aria-label="Close"
            >
              <X />
            </button>
          </div>
        </div>

        <div className="bg-black relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
              <Loader className="animate-spin text-white" size={32} />
            </div>
          )}
          
          {error ? (
            <div className="p-8 text-slate-300 text-center min-h-[400px] flex flex-col items-center justify-center">
              <p className="mb-4">Unable to preview this file.</p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
              >
                Open in new tab <ExternalLink size={16} />
              </a>
            </div>
          ) : previewType === 'image' ? (
            <div className="max-h-[80vh] overflow-auto">
              <img 
                src={url} 
                alt={title} 
                className="w-full h-auto"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          ) : previewType === 'pdf' ? (
            <div className="relative w-full h-[80vh]">
              {/* Always use Google Docs Viewer for PDFs - this prevents download */}
              <iframe
                key="pdf-viewer"
                title={title}
                src={googleDocsViewerUrl}
                className="w-full h-full"
                style={{ border: 'none' }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                allow="fullscreen"
              />
            </div>
          ) : (
            <div className="relative w-full h-[80vh]">
              <iframe 
                title={title} 
                src={url}
                className="w-full h-full"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ border: 'none' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterPlanPreviewModal;
