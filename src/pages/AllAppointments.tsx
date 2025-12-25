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
import { Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const AllAppointments = () => {
    const { user, loading: authLoading } = useAuth();
    const { isAdmin, loading: adminLoading } = useAdmin();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [appointments, setAppointments] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusTab, setStatusTab] = useState<string>("all");

    useEffect(() => {
        if (!authLoading && !adminLoading) {
            if (!user) {
                navigate("/auth");
            } else if (!isAdmin) {
                navigate("/dashboard");
                toast({
                    title: "Access Denied",
                    description: "This page is for administrators only",
                    variant: "destructive",
                });
            }
        }
    }, [user, authLoading, isAdmin, adminLoading, navigate, toast]);

    useEffect(() => {
        if (isAdmin) {
            fetchAllAppointments();
        }
    }, [isAdmin]);

    const fetchAllAppointments = async () => {
        const { data, error } = await supabase
            .from("appointments")
             .select("*");

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

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const appointment = appointments.find(apt => apt.id === id);

        const { error } = await supabase
            .from("appointments")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            });
            return;
        }
        if (appointment?.profiles?.email) {
            try {
                await supabase.functions.invoke("send-appointment-email", {
                    body: {
                        to: appointment.profiles.email,
                        fullName: appointment.full_name,
                        appointmentDate: format(new Date(appointment.appointment_date), "PPP"),
                        appointmentTime: appointment.appointment_time,
                        serviceType: appointment.service_type,
                        status: newStatus,
                        type: newStatus === "confirmed" ? "confirmation" : "status_change",
                    },
                });
            } catch (e) {
                console.error("Email failed:", e);
            }
        }

        toast({
            title: "Success",
            description: `Status updated to ${newStatus}`,
        });
        fetchAllAppointments();
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("appointments").delete().eq("id", id);
        if (error) {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Appointment deleted" });
            fetchAllAppointments();
        }
    };

    if (authLoading || adminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <div className="text-xl font-medium text-primary">Verifying access...</div>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    const filtered = appointments.filter(apt => {
        const matchesStatus = statusTab === "all" || apt.status === statusTab;
        const matchesSearch = !searchQuery ||
            apt.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background">
            <Navbar user={user} />
            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            All Appointments
                        </h1>
                        <p className="text-muted-foreground mt-2">View and manage every booking across the shop</p>
                    </div>
                </div>

                <Card className="border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex flex-col gap-6">
                            <div className="max-w-md">
                                <Label htmlFor="search">Search Client</Label>
                                <Input
                                    id="search"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full">
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
                                        <TableHead>Client Information</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                No appointments found matching your filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((apt) => (
                                            <TableRow key={apt.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{apt.full_name}</span>
                                                        <span className="text-xs text-muted-foreground">{apt.profiles?.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{apt.service_type}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{format(new Date(apt.appointment_date), "PP")}</span>
                                                        <span className="text-xs text-muted-foreground font-medium">{apt.appointment_time}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Select defaultValue={apt.status} onValueChange={(v) => handleUpdateStatus(apt.id, v)}>
                                                        <SelectTrigger className="w-[140px] h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="canceled">Canceled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate" title={apt.notes}>
                                                    {apt.notes || "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(apt.id)} className="text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4" />
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
            </div>
            <Footer />
        </div>
    );
};

export default AllAppointments;
