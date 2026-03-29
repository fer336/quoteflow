import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Settings, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { companyService } from '../services/api';

export default function SettingsModal({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success | error
  const fileInputRef = useRef(null);

  const revokeObjectUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const updateExistingLogo = (nextUrl) => {
    setExistingLogo((previousUrl) => {
      if (previousUrl && previousUrl !== nextUrl) {
        revokeObjectUrl(previousUrl);
      }
      return nextUrl;
    });
  };

  useEffect(() => {
    if (isOpen) {
      // Reset state
      setSelectedFile(null);
      setPreview(null);
      updateExistingLogo(null);
      setStatus(null);
      
      // Check for existing logo
      checkExistingLogo();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(existingLogo);
    };
  }, [existingLogo]);

  const checkExistingLogo = async () => {
    try {
      const logoBlob = await companyService.getLogo();
      const logoUrl = URL.createObjectURL(logoBlob);
      updateExistingLogo(logoUrl);
    } catch (err) {
      updateExistingLogo(null);
      console.error("Error checking logo", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setStatus(null);
      } else {
        alert('Por favor selecciona un archivo de imagen válido');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      await companyService.uploadLogo(selectedFile);
      setStatus('success');
      
      // Refresh existing logo view
      await checkExistingLogo();
      setPreview(null);
      setSelectedFile(null);

      setTimeout(() => {
        onClose();
        setStatus(null);
      }, 1500);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Settings className="text-primary-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Configuración</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-bold text-slate-700 mb-2">Logo / Encabezado</h3>
            <p className="text-sm text-slate-500 mb-4">
              Sube una imagen con tu logo o encabezado completo para que aparezca en la parte superior de los presupuestos PDF.
            </p>

            <div 
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px] ${
                preview ? 'border-primary-300 bg-primary-50/10' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
              
              {preview ? (
                <div className="relative w-full">
                  <img 
                    src={preview} 
                    alt="Logo Preview" 
                    className="max-h-32 mx-auto object-contain rounded-lg shadow-sm" 
                  />
                  <div className="mt-4 text-center">
                    <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                      Nueva Imagen
                    </span>
                  </div>
                </div>
              ) : existingLogo ? (
                <div className="relative w-full">
                  <img 
                    src={existingLogo} 
                    alt="Current Logo" 
                    className="max-h-32 mx-auto object-contain rounded-lg" 
                  />
                  <div className="mt-4 text-center">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      Logo Actual
                    </span>
                    <p className="text-xs text-slate-400 mt-2">Haz clic para cambiar</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-600">Haz clic para subir imagen</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG recomendado</p>
                </>
              )}
            </div>
          </div>

          {status === 'success' && (
            <div className="mb-4 p-3 bg-primary-50 text-primary-700 rounded-lg flex items-center gap-2 text-sm font-bold animate-in slide-in-from-top-2">
              <CheckCircle2 size={16} />
              ¡Logo actualizado correctamente!
            </div>
          )}

          {status === 'error' && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-sm font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              Error al subir la imagen.
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
            >
              Cerrar
            </button>
            <button 
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className={`flex-[2] py-2.5 rounded-xl text-white font-bold transition-all text-sm flex items-center justify-center gap-2 ${
                !selectedFile || loading 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-100'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Upload size={16} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
