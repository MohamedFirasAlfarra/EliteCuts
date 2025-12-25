import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EditAppointmentDialog } from "@/components/EditAppointmentDialog";
import { Pencil, Trash2, Users, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("appointments");
  const [appointmentStatusTab, setAppointmentStatusTab] = useState<string>("all");

  useEffect(() => {
  if (!authLoading && !user) {
    navigate("/auth");
    return;
  }

  if (!adminLoading && isAdmin === false) {
    console.log("AdminDashboard: Not admin, redirecting");
    navigate("/dashboard");
    toast({
      title: "Access Denied",
      description: "You don't have admin privileges",
      variant: "destructive",
    });
  }
}, [user, authLoading, adminLoading, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllAppointments();
      fetchAllUsers();
    }
  }, [isAdmin]);

  const viewUserAppointments = (userName: string) => {
    setSearchQuery(userName);
    setActiveTab("appointments");
  };

  const fetchAllAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, profiles(full_name, email)")
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    } else {
      setAppointments(data || []);
    }
  };

  const fetchAllUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      return;
    }

    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("appointments")
      .select("user_id, status");

    if (appointmentsError) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments data",
        variant: "destructive",
      });
      return;
    }
    const appointmentsByUser = appointmentsData?.reduce((acc: any, apt: any) => {
      if (!acc[apt.user_id]) {
        acc[apt.user_id] = { total: 0, pending: 0, confirmed: 0, completed: 0, canceled: 0 };
      }
      acc[apt.user_id].total++;
      acc[apt.user_id][apt.status]++;
      return acc;
    }, {});
    const usersWithAppointments = profilesData?.map((user: any) => ({
      ...user,
      appointments: appointmentsByUser[user.id] || { total: 0, pending: 0, confirmed: 0, completed: 0, canceled: 0 }
    }));

    setUsers(usersWithAppointments || []);
  };

  const handleDeleteAppointment = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
      fetchAllAppointments();
    }
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setDialogOpen(true);
  };

  const handleSaveAppointment = async (id: string, updates: any) => {
    const appointment = appointments.find(apt => apt.id === id);
    const statusChanged = appointment && updates.status && updates.status !== appointment.status;

    const { error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
      return;
    }
    if (statusChanged && appointment?.profiles?.email) {
      try {
        await supabase.functions.invoke("send-appointment-email", {
          body: {
            to: appointment.profiles.email,
            fullName: appointment.full_name,
            appointmentDate: format(new Date(appointment.appointment_date), "PPP"),
            appointmentTime: appointment.appointment_time,
            serviceType: appointment.service_type,
            status: updates.status,
            type: updates.status === "confirmed" ? "confirmation" : "status_change",
          },
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    toast({
      title: "Success",
      description: "Appointment updated successfully" + (statusChanged ? " and email sent" : ""),
    });
    fetchAllAppointments();
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="text-xl font-medium animate-pulse text-primary">Verifying Admin Access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log("AdminDashboard: Access blocked, isAdmin is false");
    return null;
  }

  const getStatusSelect = (appointment: any) => {
    return (
      <Select
        defaultValue={appointment.status}
        onValueChange={(value) => handleSaveAppointment(appointment.id, { status: value })}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs bg-background/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="canceled">Canceled</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = appointmentStatusTab === "all" || apt.status === appointmentStatusTab;
    const matchesSearch = !searchQuery ||
      (apt.full_name && apt.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (apt.profiles?.email && apt.profiles.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mb-12">
          Manage appointments and users
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>View and manage all barbershop appointments</CardDescription>
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="admin-search">Search Client</Label>
                      <Input
                        id="admin-search"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-background/50 mt-1"
                      />
                    </div>
                  </div>

                  <Tabs value={appointmentStatusTab} onValueChange={setAppointmentStatusTab} className="w-full">
                    <TabsList className="grid grid-cols-5 w-full bg-background/50">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                      <TabsTrigger value="canceled">Canceled</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            {appointmentStatusTab === "all" ? "No appointments found" : `No ${appointmentStatusTab} appointments found`}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{appointment.full_name}</span>
                                <span className="text-xs text-muted-foreground">{appointment.profiles?.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.service_type}</TableCell>
                            <TableCell>
                              {format(new Date(appointment.appointment_date), "PPP")}
                            </TableCell>
                            <TableCell>{appointment.appointment_time}</TableCell>
                            <TableCell>{getStatusSelect(appointment)}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {appointment.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditAppointment(appointment)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                  className="hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>View all registered barbershop clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total Appointments</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Confirmed</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Canceled</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.full_name || "Not provided"}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-center font-semibold">
                              {user.appointments.total}
                            </TableCell>
                            <TableCell className="text-center">
                              {user.appointments.pending > 0 ? (
                                <Badge variant="secondary">{user.appointments.pending}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {user.appointments.confirmed > 0 ? (
                                <Badge variant="default">{user.appointments.confirmed}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {user.appointments.completed > 0 ? (
                                <Badge variant="outline">{user.appointments.completed}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {user.appointments.canceled > 0 ? (
                                <Badge variant="destructive">{user.appointments.canceled}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {format(new Date(user.created_at), "PPP")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewUserAppointments(user.full_name || user.email)}
                              >
                                View History
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {editingAppointment && (
        <EditAppointmentDialog
          appointment={editingAppointment}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveAppointment}
        />
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
