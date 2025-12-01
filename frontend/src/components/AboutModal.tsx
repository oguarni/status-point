import React from 'react';
import { X, Code, Users, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('about.title', 'About Agiliza')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Logo and App Name */}
          <div className="flex flex-col items-center justify-center py-4">
            <img src="/android-chrome-192x192.png" alt="Agiliza Logo" className="w-24 h-24 mb-4" />
            <h3 className="text-3xl font-bold text-gray-800">Agiliza</h3>
            <p className="text-gray-500 text-sm mt-2">
              {t('about.version', 'Version')} 1.0.0
            </p>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Target className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('about.mission.title', 'Mission')}
                </h4>
                <p className="text-gray-600">
                  {t('about.mission.description', 'Agiliza is a modern task management system designed to help teams and individuals organize, track, and complete their work efficiently. Built with clean architecture principles, it demonstrates best practices in software development.')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Code className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('about.technology.title', 'Technology Stack')}
                </h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Frontend: React, TypeScript, TailwindCSS</li>
                  <li>• Backend: Node.js, Express, PostgreSQL</li>
                  <li>• Architecture: Clean Architecture, SOLID, DDD</li>
                  <li>• DevOps: Docker, Docker Compose</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="text-purple-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  {t('about.features.title', 'Key Features')}
                </h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Role-Based Access Control (Admin, Manager, Collaborator)</li>
                  <li>• Project and Task Management</li>
                  <li>• Kanban Board View</li>
                  <li>• Comments and File Attachments</li>
                  <li>• Task History Tracking</li>
                  <li>• Multi-language Support (Portuguese, English)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Academic Project Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>{t('about.academic.title', 'Academic Project')}</strong>
              <br />
              {t('about.academic.description', 'This is an educational project developed for the Software Architecture course, demonstrating Clean Architecture, SOLID principles, and Domain-Driven Design in a real-world application.')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
