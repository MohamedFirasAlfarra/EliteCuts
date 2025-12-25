import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Bot, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { SITE_DATA } from "@/constants/siteData";
import { supabase } from "@/integrations/supabase/client";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

const KNOWLEDGE_BASE = [
    {
        keywords: ["حجز", "موعد", "book", "appointment", "reserve", "احجز"],
        response: {
            en: "You can book an appointment easily from your Dashboard! Just log in and select your preferred service, date, and time.",
            ar: "يمكنك حجز موعد بسهولة من لوحة التحكم (Dashboard)! فقط قم بتسجيل الدخول واختر الخدمة والتاريخ والوقت المفضل لديك."
        }
    },
    {
        keywords: ["سعر", "اسعار", "price", "cost", "how much", "بكم"],
        response: {
            en: `Our services include: ${SITE_DATA.services.map(s => `${s.title} (${s.price})`).join(", ")}. Check our Services page for full details!`,
            ar: `خدماتنا تشمل: ${SITE_DATA.services.map(s => `${s.title} (${s.price})`).join("، ")}. يمكنك مراجعة صفحة الخدمات للتفاصيل!`
        }
    },
    {
        keywords: ["وقت", "ساعة", "مفتوح", "متى", "hours", "time", "open", "schedule", "اي ساعة"],
        response: {
            en: `We are open: ${SITE_DATA.hours.weekdays}, ${SITE_DATA.hours.saturday}, and ${SITE_DATA.hours.sunday}.`,
            ar: `نفتح في الأوقات التالية: ${SITE_DATA.hours.weekdays}، ${SITE_DATA.hours.saturday}، و ${SITE_DATA.hours.sunday}.`
        }
    },
    {
        keywords: ["مكان", "عنوان", "فرع", "دمشق", "سوريا", "location", "address", "damascus", "syria", "وين"],
        response: {
            en: `We are located in ${SITE_DATA.location.city}, ${SITE_DATA.location.country}! Our address is ${SITE_DATA.location.address}.`,
            ar: `موقعنا في ${SITE_DATA.location.country}، ${SITE_DATA.location.city}! عنواننا هو ${SITE_DATA.location.address}.`
        }
    },
    {
        keywords: ["مساعدة", "بوت", "help", "assistant"],
        response: {
            en: "I am your EliteCuts assistant! I can help with booking, prices, location, and hours. What's on your mind?",
            ar: "أنا مساعد EliteCuts الذكي! يمكنني مساعدتك بخصوص الحجز، الأسعار، الموقع، وأوقات العمل. ماذا يدور في ذهنك؟"
        }
    },
    {
        keywords: ["مواعيدي", "موعدي", "next appointment", "my appointment", "appointments", "مواعيد"],
        response: {
            en: "Looking for your next appointment? Let me check for you.",
            ar: "تبحث عن موعدك القادم؟ دعني أتحقق لك."
        },
        special: "next_appointment"
    }
];

export const ChatBot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const welcome = user
            ? `Welcome back, ${user.email?.split('@')[0]}! How can I help you with your next appointment today? \n\nأهلاً بعودتك يا ${user.email?.split('@')[0]}! كيف يمكنني مساعدتك في موعدك القادم اليوم؟`
            : "Welcome to EliteCuts! I'm your AI assistant. How can I help you today? \n\nأهلاً بك في EliteCuts! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟";

        setMessages([
            {
                id: "1",
                text: welcome,
                sender: "bot",
                timestamp: new Date()
            }
        ]);
    }, [user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const fetchNextAppointment = async () => {
        if (!user) return null;
        const { data, error } = await supabase
            .from("appointments")
            .select("appointment_date, appointment_time, service_type")
            .eq("user_id", user.id)
            .gte("appointment_date", new Date().toISOString().split('T')[0])
            .order("appointment_date", { ascending: true })
            .order("appointment_time", { ascending: true })
            .limit(1);

        if (error || !data || data.length === 0) return null;
        return data[0];
    };

    const generateResponse = async (text: string) => {
        const lowercaseText = text.toLowerCase();
        const arabicPattern = /[\u0600-\u06FF]/;
        const isArabic = arabicPattern.test(text);

        // Check for next appointment query first
        if (lowercaseText.includes("موعدي") || lowercaseText.includes("appointment") || lowercaseText.includes("next")) {
            if (!user) {
                return isArabic
                    ? "عذراً، لا يمكنني التحقق من مواعيدك بدون تسجيل الدخول. يرجى تسجيل الدخول أولاً."
                    : "Sorry, I can't check your appointments without you being logged in. Please log in first.";
            }
            const nextApt = await fetchNextAppointment();
            if (nextApt) {
                const date = new Date(nextApt.appointment_date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                return isArabic
                    ? `موعدك القادم هو: ${nextApt.service_type} في ${date} الساعة ${nextApt.appointment_time}.`
                    : `Your next appointment is: ${nextApt.service_type} on ${date} at ${nextApt.appointment_time}.`;
            } else {
                return isArabic
                    ? "ليس لديك أي مواعيد قادمة. يمكنك حجز موعد جديد من لوحة التحكم."
                    : "You don't have any upcoming appointments. You can book a new one from your Dashboard.";
            }
        }

        const match = KNOWLEDGE_BASE.find(item =>
            item.keywords.some(keyword => lowercaseText.includes(keyword))
        );

        if (match) {
            return isArabic ? match.response.ar : match.response.en;
        }

        return "I'm sorry, I don't have information on that yet. You can try asking about 'prices', 'booking', or 'location'. \n\nعذراً، ليس لدي معلومات عن هذا بعد. يمكنك سؤالي عن 'الأسعار'، 'الحجز'، أو 'الموقع'.";
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Simulate bot thinking
        setTimeout(async () => { // Make the callback async
            const response = await generateResponse(userMsg.text); // Await the response
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response,
                sender: "bot",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        }, 600);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <Card className="mb-4 w-[350px] sm:w-[400px] h-[500px] shadow-2xl border-primary/20 bg-background/95 backdrop-blur-lg flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <CardHeader className="p-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            Elite Assistant
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                            onClick={() => setIsOpen(false)}
                        >
                            <Minimize2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-hidden p-0 bg-muted/20">
                        <ScrollArea className="h-full p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-2 max-w-[80%]",
                                            msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg text-sm",
                                            msg.sender === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-background border border-border rounded-tl-none"
                                        )}>
                                            {msg.text.split('\n').map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-4 bg-background border-t">
                        <div className="flex w-full gap-2">
                            <Input
                                placeholder="Ask EliteCuts... اسألنا أي شيء"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                            />
                            <Button size="icon" onClick={handleSend} className="bg-primary hover:bg-primary/90">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className={cn(
                    "h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform duration-300",
                    isOpen && "rotate-90 hover:rotate-180"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
    );
};
