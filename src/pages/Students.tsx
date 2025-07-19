import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Search, Plus, Edit, Eye, Trash2, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Students() {
  const { user, switchRole, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  // Sample student data
  const students = [
    {
      id: 1,
      studentNumber: "2024001",
      firstName: "Elif",
      lastName: "Kaya",
      gradeLevel: 5,
      schoolName: "Atatürk İlkokulu",
      parentName: "Ahmet Kaya",
      parentPhone: "+90 532 123 4567",
      parentEmail: "ahmet.kaya@email.com",
      birthDate: "2013-03-15",
      enrollmentDate: "2024-01-10",
      status: "Aktif"
    },
    {
      id: 2,
      studentNumber: "2024002", 
      firstName: "Mehmet",
      lastName: "Özkan",
      gradeLevel: 7,
      schoolName: "Cumhuriyet Ortaokulu",
      parentName: "Fatma Özkan",
      parentPhone: "+90 533 234 5678",
      parentEmail: "fatma.ozkan@email.com",
      birthDate: "2011-07-22",
      enrollmentDate: "2024-01-12",
      status: "Aktif"
    },
    {
      id: 3,
      studentNumber: "2024003",
      firstName: "Ayşe",
      lastName: "Demir",
      gradeLevel: 9,
      schoolName: "İstiklal Lisesi",
      parentName: "Mustafa Demir",
      parentPhone: "+90 534 345 6789",
      parentEmail: "mustafa.demir@email.com",
      birthDate: "2009-11-08",
      enrollmentDate: "2024-01-15",
      status: "Aktif"
    },
    {
      id: 4,
      studentNumber: "2024004",
      firstName: "Ali",
      lastName: "Yıldız",
      gradeLevel: 3,
      schoolName: "Mimar Sinan İlkokulu",
      parentName: "Zeynep Yıldız",
      parentPhone: "+90 535 456 7890",
      parentEmail: "zeynep.yildiz@email.com",
      birthDate: "2015-05-12",
      enrollmentDate: "2024-01-08",
      status: "Pasif"
    },
    {
      id: 5,
      studentNumber: "2024005",
      firstName: "Selin",
      lastName: "Arslan",
      gradeLevel: 6,
      schoolName: "Gazi Mustafa Kemal Ortaokulu",
      parentName: "Hakan Arslan",
      parentPhone: "+90 536 567 8901",
      parentEmail: "hakan.arslan@email.com",
      birthDate: "2012-09-25",
      enrollmentDate: "2024-01-20",
      status: "Aktif"
    }
  ];

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif": return "bg-green-100 text-green-800";
      case "Pasif": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                Öğrenci Yönetimi
              </h1>
              <p className="text-muted-foreground">
                Sistemdeki öğrencileri görüntüleyebilir ve yönetebilirsiniz.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/add-user">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Öğrenci
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Arama</CardTitle>
            <CardDescription>
              Öğrenci adı, numarası, okul veya veli adına göre arama yapabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Öğrenci ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Listesi</CardTitle>
            <CardDescription>
              Toplam {filteredStudents.length} öğrenci bulundu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Öğrenci bulunamadı.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Öğrenci No</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Sınıf</TableHead>
                    <TableHead>Okul</TableHead>
                    <TableHead>Veli</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.studentNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(student.birthDate).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.gradeLevel}. Sınıf</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate" title={student.schoolName}>
                          {student.schoolName}
                        </div>
                      </TableCell>
                      <TableCell>{student.parentName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span className="truncate max-w-24" title={student.parentPhone}>
                              {student.parentPhone}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-24" title={student.parentEmail}>
                              {student.parentEmail}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Toplam Öğrenci</CardTitle>
              <CardDescription>Sistemdeki toplam öğrenci sayısı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{students.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktif Öğrenci</CardTitle>
              <CardDescription>Eğitime devam eden öğrenciler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {students.filter(s => s.status === "Aktif").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bu Ay Kayıt</CardTitle>
              <CardDescription>Bu ay kayıt olan öğrenciler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {students.filter(s => new Date(s.enrollmentDate).getMonth() === new Date().getMonth()).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}