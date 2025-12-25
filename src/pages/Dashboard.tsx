import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminAppointmentsSection } from "@/components/AdminAppointmentsSection";
import { CalendarIcon, Trash2, Star, Pencil, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { ReviewForm } from "@/components/ReviewForm";

const appointmentSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  serviceType: z.string().min(1, "Please select a service type"),
  appointmentDate: z.date({ required_error: "Please select a date" }),
  appointmentTime: z.string().min(1, "Please select a time"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewingAppointment, setReviewingAppointment] = useState<any>(null);
  const [existingReviews, setExistingReviews] = useState<Record<string, boolean>>({});
  const { isAdmin } = useAdmin();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchUserProfile();
      fetchExistingReviews();
    }
  }, [user]);

  const fetchExistingReviews = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("reviews")
      .select("appointment_id")
      .eq("user_id", user.id);

    if (data) {
      const reviewMap = data.reduce((acc: Record<string, boolean>, review) => {
        acc[review.appointment_id] = true;
        return acc;
      }, {});
      setExistingReviews(reviewMap);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (data?.full_name) {
      setFullName(data.full_name);
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: true });

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

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !date) return;

    setLoading(true);

    try {
      appointmentSchema.parse({
        fullName,
        serviceType,
        appointmentDate: date,
        appointmentTime: time,
        notes: notes || undefined,
      });

      if (editingId) {
        const { error } = await supabase
          .from("appointments")
          .update({
            full_name: fullName,
            service_type: serviceType,
            appointment_date: format(date, "yyyy-MM-dd"),
            appointment_time: time,
            notes: notes || null,
          })
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Updated!",
          description: "Appointment updated successfully",
        });
      } else {
        const { error } = await supabase.from("appointments").insert({
          user_id: user.id,
          full_name: fullName,
          service_type: serviceType,
          appointment_date: format(date, "yyyy-MM-dd"),
          appointment_time: time,
          notes: notes || null,
        });

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Appointment booked successfully",
        });
      }
      setEditingId(null);
      setServiceType("");
      setDate(undefined);
      setTime("");
      setNotes("");
      setEditingId(null);
      fetchAppointments();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to book appointment",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (appointment: any) => {
    setEditingId(appointment.id);
    setFullName(appointment.full_name);
    setServiceType(appointment.service_type);
    setDate(new Date(appointment.appointment_date));
    setTime(appointment.appointment_time);
    setNotes(appointment.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      fetchAppointments();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const services = [
    "Men's Haircut",
    "Women's Haircut",
    "Beard Trim",
    "Beard Shaping",
    "Hot Towel Shave",
    "Hair Coloring",
    "Highlights",
    "Hair Treatment",
  ];

  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00"
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      confirmed: { variant: "default", label: "Confirmed" },
      completed: { variant: "outline", label: "Completed" },
      canceled: { variant: "destructive", label: "Canceled" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredAppointments = statusFilter === "all"
    ? appointments
    : appointments.filter(apt => apt.status === statusFilter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Client Dashboard
        </h1>
        <p className="text-muted-foreground mb-12">
          Book and manage your barbershop appointments
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Appointment Form */}
          <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="relative">
              <CardTitle>{editingId ? "Edit Appointment" : "Book an Appointment"}</CardTitle>
              <CardDescription>
                {editingId ? "Update your booking details" : "Schedule your next barbershop visit"}
              </CardDescription>
              {editingId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => {
                    setEditingId(null);
                    setServiceType("");
                    setDate(undefined);
                    setTime("");
                    setNotes("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select value={serviceType} onValueChange={setServiceType} required>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background/50",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select value={time} onValueChange={setTime} required>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements or preferences..."
                    className="bg-background/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? (editingId ? "Updating..." : "Booking...") : (editingId ? "Update Appointment" : "Book Appointment")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>Your upcoming barbershop visits</CardDescription>
              <div className="mt-4">
                <Label htmlFor="status-filter">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-background/50 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {statusFilter === "all" ? "No appointments yet. Book your first visit!" : `No ${statusFilter} appointments found.`}
                  </p>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {appointment.service_type}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appointment.full_name}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(appointment)}
                            className="h-8 w-8 hover:text-primary"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="h-8 w-8 hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {format(new Date(appointment.appointment_date), "PPP")}
                        </span>
                        <span>{appointment.appointment_time}</span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Note: {appointment.notes}
                        </p>
                      )}
                      {appointment.status === "completed" && !existingReviews[appointment.id] && (
                        <Button
                          onClick={() => setReviewingAppointment(appointment)}
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Leave a Review
                        </Button>
                      )}
                      {appointment.status === "completed" && existingReviews[appointment.id] && (
                        <div className="mt-2 text-sm text-muted-foreground text-center">
                          ✓ Review submitted
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {reviewingAppointment && (
            <div className="lg:col-span-2">
              <ReviewForm
                appointment={reviewingAppointment}
                onSuccess={() => {
                  setReviewingAppointment(null);
                  fetchExistingReviews();
                }}
              />
            </div>
          )}
        </div>

        {/* Admin Section */}
        {isAdmin && <AdminAppointmentsSection />}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;