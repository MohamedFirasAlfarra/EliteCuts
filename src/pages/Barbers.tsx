import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import teamImage from "@/assets/team-workspace.jpg";
import { ReviewsList } from "@/components/ReviewsList";

const Barbers = () => {
  const { user } = useAuth();

  const barbers = [
    {
      name: "Marcus Johnson",
      title: "Master Barber",
      specialties: ["Men's Cuts", "Fades", "Beard Styling"],
      experience: "12+ years",
      description: "Award-winning barber specializing in classic and modern men's styles.",
    },
    {
      name: "Sophia Martinez",
      title: "Senior Stylist",
      specialties: ["Women's Cuts", "Coloring", "Balayage"],
      experience: "10+ years",
      description: "Expert in contemporary women's styling and color transformations.",
    },
    {
      name: "David Chen",
      title: "Hair Artist",
      specialties: ["Creative Cuts", "Men's Grooming", "Styling"],
      experience: "8+ years",
      description: "Innovative stylist bringing artistic vision to every haircut.",
    },
    {
      name: "Rachel Davis",
      title: "Color Specialist",
      specialties: ["Hair Coloring", "Highlights", "Balayage"],
      experience: "11+ years",
      description: "Master colorist creating stunning, natural-looking color results.",
    },
    {
      name: "James Wilson",
      title: "Traditional Barber",
      specialties: ["Hot Shaves", "Classic Cuts", "Beard Care"],
      experience: "15+ years",
      description: "Old-school barber bringing traditional techniques to modern styles.",
    },
    {
      name: "Emma Thompson",
      title: "Texture Specialist",
      specialties: ["Curly Hair", "Treatments", "Natural Hair"],
      experience: "9+ years",
      description: "Expert in all hair textures with focus on curly and natural hair care.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Meet Our Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Expert barbers and stylists dedicated to making you look your best
          </p>
          <div className="max-w-5xl mx-auto mb-12 rounded-xl overflow-hidden border border-border shadow-lg">
            <img 
              src={teamImage} 
              alt="Professional barbershop team workspace with styling stations" 
              className="w-full h-[350px] object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber, index) => (
            <Card
              key={index}
              className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="h-32 w-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground group-hover:scale-110 transition-transform">
                  {barber.name.split(' ').map(n => n[0]).join('')}
                </div>
                <CardTitle className="text-2xl text-center">{barber.name}</CardTitle>
                <CardDescription className="text-center text-base text-primary">
                  {barber.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm text-center">
                  {barber.description}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {barber.specialties.map((specialty, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <div className="text-center pt-2">
                  <span className="text-sm font-semibold text-foreground">Experience: </span>
                  <span className="text-sm text-muted-foreground">{barber.experience}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Barbers;