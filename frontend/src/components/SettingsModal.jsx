import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Settings,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Building2,
  Save,
  FileText,
} from 'lucide-react';
import { companyService } from '../services/api';

const BRANDING_FIELDS = [
  { key: 'name', label: 'Nombre / Título', placeholder: 'Ej: OctopusFlow de Juan Pérez', hint: 'Aparece en el encabezado del PDF' },
  { key: 'company_name', label: 'Nombre de Empresa', placeholder: 'Ej: Constructora López SRL', hint: 'Nombre comercial' },
  { key: 'business_name', label: 'Razón Social', placeholder: 'Ej: López & Asociados SRL', hint: 'Razón social legal' },
  { key: 'tax_id', label: 'CUIT / RUT / NIF', placeholder: 'Ej: 30-12345678-9', hint: 'Identificación fiscal' },
  { key: 'address', label: 'Dirección', placeholder: 'Ej: Av. Libertador 1234, CABA', hint: 'Dirección de la empresa' },
  { key: 'phone', label: 'Teléfono', placeholder: 'Ej: +54 11 1234-5678', hint: 'Teléfono de contacto' },
  { key: 'email_contact', label: 'Email de Contacto', placeholder: 'Ej: contacto@miempresa.com', hint: 'Email público (diferente al de login)' },
  { key: 'payment_terms', label: 'Términos de Pago', placeholder: 'Ej: Efectivo,Transferencia,Tarjeta', hint: 'Aparece en el PDF' },
];

export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('logo'); // 'logo' | 'company'
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoStatus, setLogoStatus] = useState(null);
  const [companyData, setCompanyData] = useState({});
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);
  const [companyStatus, setCompanyStatus] = useState(null); // { type: 'success'|'error', message: string }
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

  // Load company settings when switching to company tab
  const loadCompanySettings = async () => {
    try {
      setCompanyLoading(true);
      const data = await companyService.getSettings();
      setCompanyData(data);
    } catch (err) {
      console.error('Error loading settings', err);
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreview(null);
      updateExistingLogo(null);
      setLogoStatus(null);
      setCompanyStatus(null);
      setActiveTab('logo');
      checkExistingLogo();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'company' && Object.keys(companyData).length === 0) {
      loadCompanySettings();
    }
  }, [activeTab]);

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
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setLogoStatus(null);
      } else {
        alert('Por favor selecciona un archivo de imagen válido');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLogoLoading(true);
      await companyService.uploadLogo(selectedFile);
      setLogoStatus('success');
      await checkExistingLogo();
      setPreview(null);
      setSelectedFile(null);

      setTimeout(() => {
        setLogoStatus(null);
      }, 1500);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setLogoStatus('error');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    try {
      setCompanySaving(true);
      await companyService.updateSettings(companyData);
      setCompanyStatus({ type: 'success', message: 'Configuración guardada correctamente' });
      setTimeout(() => setCompanyStatus(null), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setCompanyStatus({ type: 'error', message: 'Error al guardar. Intentá de nuevo.' });
    } finally {
      setCompanySaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
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

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          <button
            onClick={() => setActiveTab('logo')}
            className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'logo'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ImageIcon size={14} className="inline mr-1.5 mb-0.5" />
            Logo
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'company'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 size={14} className="inline mr-1.5 mb-0.5" />
            Mi Empresa
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* === LOGO TAB === */}
          {activeTab === 'logo' && (
            <div>
              <h3 className="font-bold text-slate-700 mb-2">Logo / Encabezado</h3>
              <p className="text-sm text-slate-500 mb-4">
                Subí una imagen con tu logo o encabezado completo para que aparezca en la parte superior de los presupuestos PDF.
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
                    <img src={preview} alt="Logo Preview" className="max-h-32 mx-auto object-contain rounded-lg shadow-sm" />
                    <div className="mt-4 text-center">
                      <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">Nueva Imagen</span>
                    </div>
                  </div>
                ) : existingLogo ? (
                  <div className="relative w-full">
                    <img src={existingLogo} alt="Current Logo" className="max-h-32 mx-auto object-contain rounded-lg" />
                    <div className="mt-4 text-center">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Logo Actual</span>
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
          )}

          {/* === COMPANY TAB === */}
          {activeTab === 'company' && (
            <div>
              {companyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-sm text-slate-500">Cargando...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {BRANDING_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={companyData[field.key] || ''}
                        onChange={(e) =>
                          setCompanyData((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                      />
                      <p className="text-xs text-slate-400 mt-0.5">{field.hint}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status messages */}
        <div className="px-6">
          {activeTab === 'logo' && logoStatus === 'success' && (
            <div className="mb-4 p-3 bg-primary-50 text-primary-700 rounded-lg flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 size={16} />
              ¡Logo actualizado correctamente!
            </div>
          )}
          {activeTab === 'logo' && logoStatus === 'error' && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={16} />
              Error al subir la imagen.
            </div>
          )}
          {activeTab === 'company' && companyStatus?.type === 'success' && (
            <div className="mb-4 p-3 bg-primary-50 text-primary-700 rounded-lg flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 size={16} />
              {companyStatus.message}
            </div>
          )}
          {activeTab === 'company' && companyStatus?.type === 'error' && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={16} />
              {companyStatus.message}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
          >
            Cerrar
          </button>
          {activeTab === 'logo' ? (
            <button
              onClick={handleUpload}
              disabled={!selectedFile || logoLoading}
              className="flex-[2] py-2.5 rounded-xl text-white font-bold transition-all text-sm flex items-center justify-center gap-2"
              style={{
                background: !selectedFile || logoLoading ? 'var(--color-text-muted)' : 'var(--color-brand-purple)'
              }}
            >
              {logoLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Upload size={16} />
                  Guardar Logo
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSaveCompany}
              disabled={companySaving}
              className="flex-[2] py-2.5 rounded-xl text-white font-bold transition-all text-sm flex items-center justify-center gap-2"
              style={{
                background: companySaving ? 'var(--color-text-muted)' : 'var(--color-brand-purple)'
              }}
            >
              {companySaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Empresa
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}