import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface CognitiveTestResult {
  id: string;
  session_id: string;
  student_id: string;
  conducted_by: string;
  test_start_time: string;
  test_end_time: string;
  duration_seconds: number;
  dikkat_skoru: number;
  hafiza_skoru: number;
  isleme_hizi_skoru: number;
  gorsel_isleme_skoru: number;
  akil_mantik_yurutme_skoru: number;
  bilissel_esneklik_skoru: number;
  alt_test_ozetleri?: any;
  created_at: string;
}

interface Student {
  id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female';
  trainer_name?: string;
}

interface CognitiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  testResult: CognitiveTestResult;
}

const CognitiveReportModal: React.FC<CognitiveReportModalProps> = ({
  isOpen,
  onClose,
  student,
  testResult
}) => {
  const [reportLoaded, setReportLoaded] = useState(false);

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMs = today.getTime() - birth.getTime();
    const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
    const ageInMonths = Math.floor((ageInMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    const ageInDays = Math.floor((ageInMs % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    return `${ageInYears} Yıl ${ageInMonths} Ay ${ageInDays} Gün`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Get score level and color
  const getScoreLevel = (score: number) => {
    if (score >= 75) return { level: 'Güçlü', color: '#28a745', bgColor: '#d4edda' };
    if (score >= 50) return { level: 'Gelişmiş', color: '#856404', bgColor: '#fff3cd' };
    return { level: 'Gelişim Öncelikli', color: '#721c24', bgColor: '#f8d7da' };
  };

  // Handle print - Open new window with cognitive report template
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Create URL with session_id parameter for the cognitive report
    const reportUrl = `/coginitiveetemp.html?session_id=${testResult.session_id}`;
    
    // Redirect to the cognitive report template
    printWindow.location.href = reportUrl;
  };

  // Handle detail view - Show detailed report in current modal
  const handleDetailView = () => {
    // Open cognitive report in new tab
    const reportUrl = `/coginitiveetemp.html?session_id=${testResult.session_id}`;
    window.open(reportUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              ForBrain Bilişsel Becerileri Değerlendirme Raporu
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Student Info Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Öğrenci Bilgileri</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-blue-700">Ad Soyad:</span>
                    <span>{student.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-blue-700">Cinsiyet:</span>
                    <span>{student.gender === 'male' ? 'Erkek' : 'Kadın'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-blue-700">Yaş:</span>
                    <span>{calculateAge(student.birth_date)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-blue-700">Doğum Tarihi:</span>
                    <span>{formatDate(student.birth_date)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-blue-700">Değerlendirme Tarihi:</span>
                    <span>{formatDate(testResult.test_start_time)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-blue-700">Test Süresi:</span>
                    <span>{Math.round(testResult.duration_seconds / 60)} dakika</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scores Table */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Bilişsel Beceriler Performans Özeti</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-800 text-white">
                      <th className="border border-gray-300 p-3 text-left">Beceri Kategorisi</th>
                      <th className="border border-gray-300 p-3 text-left">Yüzdelik Skor</th>
                      <th className="border border-gray-300 p-3 text-left">Düzey</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Dikkat', score: testResult.dikkat_skoru },
                      { name: 'Hafıza', score: testResult.hafiza_skoru },
                      { name: 'İşleme Hızı', score: testResult.isleme_hizi_skoru },
                      { name: 'Görsel İşleme', score: testResult.gorsel_isleme_skoru },
                      { name: 'Akıl ve Mantık Yürütme', score: testResult.akil_mantik_yurutme_skoru },
                      { name: 'Bilişsel Esneklik', score: testResult.bilissel_esneklik_skoru }
                    ].map((skill, index) => {
                      const scoreLevel = getScoreLevel(skill.score);
                      return (
                        <tr key={index} className="bg-gray-50">
                          <td className="border border-gray-300 p-3 font-medium">{skill.name}</td>
                          <td className="border border-gray-300 p-3">
                            <span 
                              className="px-3 py-1 rounded font-bold"
                              style={{ 
                                backgroundColor: scoreLevel.bgColor, 
                                color: scoreLevel.color 
                              }}
                            >
                              %{skill.score}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3">{scoreLevel.level}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Chart Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Performans Grafiği</h3>
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <div className="flex justify-around items-end h-32 mb-4">
                  {[
                    { name: 'Dikkat', score: testResult.dikkat_skoru },
                    { name: 'Hafıza', score: testResult.hafiza_skoru },
                    { name: 'İşleme Hızı', score: testResult.isleme_hizi_skoru },
                    { name: 'Görsel İşleme', score: testResult.gorsel_isleme_skoru },
                    { name: 'Akıl Mantık', score: testResult.akil_mantik_yurutme_skoru },
                    { name: 'Bilişsel Esneklik', score: testResult.bilissel_esneklik_skoru }
                  ].map((skill, index) => {
                    const scoreLevel = getScoreLevel(skill.score);
                    const height = (skill.score / 100) * 100; // Max height 100px
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-8 rounded-t"
                          style={{ 
                            height: `${height}px`, 
                            backgroundColor: scoreLevel.color,
                            minHeight: '4px'
                          }}
                        />
                        <div className="text-xs mt-2 text-center max-w-16">
                          <div className="font-medium">%{skill.score}</div>
                          <div className="text-gray-600 text-xs leading-tight">{skill.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600">
                  Detaylı grafik ve analiz için tam raporu görüntüleyin
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-4 border-t">
              <button
                onClick={handleDetailView}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                📄 Detaylı Rapor Görüntüle
              </button>
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                🖨️ PDF Olarak Kaydet
              </button>
            </div>

            {/* Info Note */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Not:</strong> Bu özet rapordur. Detaylı analiz, öneriler ve grafikler için "Detaylı Rapor Görüntüle" butonunu kullanın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CognitiveReportModal;
