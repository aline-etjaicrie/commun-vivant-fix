'use client';

import { Question as QuestionType } from '@/lib/schema';
import AudioUploader from './AudioUploader';
import PhotoUploader from './PhotoUploader';
import GalleryUploader from './GalleryUploader';
import { ADJECTIFS, VALEURS } from '@/lib/schema';

interface QuestionProps {
  question: QuestionType;
  value: any;
  onChange: (value: any) => void;
}

export default function Question({ question, value, onChange }: QuestionProps) {
  const { id, label, type, optional, options, placeholder, helper } = question;

  // Déterminer les options selon le type de question
  let questionOptions = options || [];
  if (id === 'adjectifs') {
    questionOptions = ADJECTIFS;
  } else if (id === 'selected') {
    questionOptions = VALEURS;
  }

  const handleCheckboxChange = (option: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (currentValues.includes(option)) {
      onChange(currentValues.filter((v) => v !== option));
    } else {
      onChange([...currentValues, option]);
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-3">
        <span className="text-memoir-blue font-bold text-lg">
          {label}
          {optional && (
            <span className="text-memoir-blue/50 text-sm ml-2 font-normal">(facultatif)</span>
          )}
        </span>
        {helper && (
          <span className="block text-sm text-memoir-blue/60 mt-1">{helper}</span>
        )}
      </label>

      {type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-memoir-gold"
        />
      )}

      {type === 'date' && (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-memoir-gold"
        />
      )}

      {type === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="input-field w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-memoir-gold resize-y"
        />
      )}

      {type === 'select' && (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-memoir-gold bg-white"
        >
          <option value="">-- Choisir --</option>
          {questionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {type === 'radio' && (
        <div className="space-y-3">
          {questionOptions.map((option) => (
            <label key={option} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-memoir-bg/50 transition-colors cursor-pointer active:bg-memoir-bg">
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="radio"
                  name={id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-5 h-5 text-memoir-gold focus:ring-memoir-gold accent-memoir-gold"
                />
              </div>
              <span className="text-base text-gray-800 leading-tight pt-0.5">{option}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'checkbox' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
          {questionOptions.map((option) => (
            <label key={option} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-memoir-bg/50 transition-colors cursor-pointer active:bg-memoir-bg">
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  className="w-5 h-5 text-memoir-gold rounded focus:ring-memoir-gold accent-memoir-gold"
                />
              </div>
              <span className="text-base text-gray-800 leading-tight pt-0.5">{option}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'file' && (
        <GalleryUploader
          medias={value || []}
          onMediasChange={onChange}
          memorialId="preview"
          maxPhotos={30}
          allowPdf
        />
      )}

      {type === 'photo' && (
        <PhotoUploader
          photoId={value}
          onPhotoChange={onChange}
          memorialId="preview"
          label={label}
        />
      )}

      {type === 'gallery' && (
        <GalleryUploader
          medias={value || []}
          onMediasChange={onChange}
          memorialId="preview"
          maxPhotos={20}
        />
      )}
    </div>
  );
}
