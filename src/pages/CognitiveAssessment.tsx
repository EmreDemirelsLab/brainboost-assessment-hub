import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { CognitiveAssessmentTest } from "@/components/cognitive-assessment/CognitiveAssessmentTest";

export default function CognitiveAssessment() {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
    // State güncellemesi tamamlanması için kısa bir gecikme
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <DashboardLayout
      user={user ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
      } : undefined}
      onRoleSwitch={handleRoleSwitch}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            ForBrain Bilişsel Beceri Değerlendirme
          </h1>
        </div>

        {/* Cognitive Assessment Test */}
        <CognitiveAssessmentTest />
      </div>
    </DashboardLayout>
  );
}