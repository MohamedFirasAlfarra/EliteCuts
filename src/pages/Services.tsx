import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Scissors, Brush, Sparkles, Wind, Droplets, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import servicesImage from "@/assets/services-tools.jpg";
import { ReviewsList } from "@/components/ReviewsList";
import { SITE_DATA } from "@/constants/siteData";

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getIcon = (title: string) => {
    switch (title) {
      case "Men's Haircut": return <Scissors className="h-10 w-10" />;
      case "Women's Haircut": return <Brush className="h-10 w-10" />;
      case "Beard Service": return <Sparkles className="h-10 w-10" />;
      case "Hair Coloring": return <Wind className="h-10 w-10" />;
      case "Hair Treatment": return <Droplets className="h-10 w-10" />;
      default: return <Star className="h-10 w-10" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Our Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Premium barbershop services for men and women
          </p>
          <div className="max-w-5xl mx-auto mb-12 rounded-xl overflow-hidden border border-border shadow-lg">
            <img
              src={servicesImage}
              alt="Professional barber tools and grooming equipment"
              className="w-full h-[350px] object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SITE_DATA.services.map((service, index) => (
            <Card
              key={index}
              className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-primary group-hover:scale-110 transition-transform">
                    {getIcon(service.title)}
                  </div>
                  <span className="text-2xl font-bold text-primary">{service.price}</span>
                </div>
                <CardTitle className="text-2xl">{service.title}</CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate(user ? "/dashboard" : "/auth")}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {user ? "Book Now" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;