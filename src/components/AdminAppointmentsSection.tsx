import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const AdminAppointmentsSection = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusTab, setStatusTab] = useState("all");
    const { toast } = useToast();

    const fetchAllAppointments = async () => {
        setLoading(true);
        // Note: This join requires the SQL fix provided in the plan
        const { data, error } = await supabase
            .from("appointments")
            .select("*, profiles(full_name, email)")
            .order("appointment_date", { ascending: true })
            .order("appointment_time", { ascending: true });

        if (error) {
            console.error("Fetch error:", error);
            // Fallback if profiles join fails before user runs SQL
            const { data: fallbackData } = await supabase
                .from("appointments")
                .select("*")
                .order("appointment_date", { ascending: true });
            setAppointments(fallbackData || []);
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllAppointments();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: any) => {
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
        } else {
            toast({
                title: "Success",
                description: `Status updated to ${newStatus}`,
            });
            fetchAllAppointments();

            // Attempt to send email
            const appointment = appointments.find(a => a.id === id);
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
                            type: "status_change",
                        },
                    });
                } catch (e) {
                    console.error("Email notification failed", e);
                }
            }
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("appointments").delete().eq("id", id);
        if (!error) {
            toast({ title: "Appointment Deleted" });
            fetchAllAppointments();
        }
    };

    const filtered = appointments.filter(apt => {
        const matchesStatus = statusTab === "all" || apt.status === statusTab;
        const matchesSearch = !searchQuery ||
            apt.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <Card className="mt-12 border-primary/20 bg-card/30 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary text-sm">ADMIN</div>
                    All Shop Appointments
                </CardTitle>
                <CardDescription>Comprehensive view of all customer bookings</CardDescription>

                <div className="flex flex-col gap-6 mt-6">
                    <div className="max-w-md">
                        <Label htmlFor="admin-search">Search Client</Label>
                        <Input
                            id="admin-search"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background/50"
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
                <div className="rounded-md border border-border/50 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 animate-pulse">
                                        Loading appointments...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        No matching appointments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((apt) => (
                                    <TableRow key={apt.id} className="hover:bg-muted/20">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{apt.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{apt.profiles?.email || "No email"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{apt.service_type}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm text-foreground/80">
                                                <span>{format(new Date(apt.appointment_date), "PP")}</span>
                                                <span className="font-medium text-xs">{apt.appointment_time}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select defaultValue={apt.status} onValueChange={(v) => handleUpdateStatus(apt.id, v)}>
                                                <SelectTrigger className="w-[130px] h-8 text-xs">
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
                                        <TableCell className="max-w-[150px] truncate text-xs">
                                            {apt.notes || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(apt.id)}
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            >
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
    );
};
