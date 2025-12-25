import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Scissors, Sparkles, Star, Users, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-barbershop.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Scissors className="h-8 w-8" />,
      title: "Expert Stylists",
      description: "Skilled barbers and stylists trained in the latest cutting techniques for all hair types.",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Premium Services",
      description: "From classic cuts to modern styles, coloring, and grooming treatments for everyone.",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Quality Products",
      description: "We use only the finest professional-grade products for exceptional results.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Everyone Welcome",
      description: "A modern unisex barbershop serving men, women, and children in a welcoming environment.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Modern luxury barbershop interior" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>
        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Style,
              </span>
              <br />
              Perfectly Cut
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience premium barbershop services for men and women in a modern, welcoming atmosphere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(user ? "/dashboard" : "/auth")}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6 animate-glow-pulse"
              >
                {user ? "Book Appointment" : "Book Your Visit"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate("/services")}
                size="lg"
                variant="outline"
                className="border-primary/50 hover:border-primary text-lg px-8 py-6"
              >
                View Services
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Why Choose EliteCuts
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Where style meets precision for every customer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { number: "8000+", label: "Happy Clients" },
            { number: "12+", label: "Expert Stylists" },
            { number: "500+", label: "Monthly Appointments" },
            { number: "10+", label: "Years Experience" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;