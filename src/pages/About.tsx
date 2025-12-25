import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Award, Users, Scissors, Heart } from "lucide-react";
import aboutImage from "@/assets/about-barbershop.jpg";

const About = () => {
  const { user } = useAuth();

  const values = [
    {
      icon: <Award className="h-8 w-8" />,
      title: "Excellence",
      description: "We deliver exceptional service and precision in every cut and style.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community",
      description: "A welcoming space where everyone feels at home and valued.",
    },
    {
      icon: <Scissors className="h-8 w-8" />,
      title: "Expertise",
      description: "Highly trained stylists using the latest techniques and products.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Care",
      description: "Personalized attention and care for every client who walks through our door.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
            About EliteCuts
          </h1>

          <div className="mb-8 rounded-xl overflow-hidden border border-border shadow-lg">
            <img 
              src={aboutImage} 
              alt="Welcoming modern barbershop interior with comfortable seating" 
              className="w-full h-[400px] object-cover"
            />
          </div>
          
          <div className="space-y-8 text-foreground/90">
            <p className="text-lg leading-relaxed">
              Founded in 2015, EliteCuts has become the premier barbershop destination 
              serving both men and women in our community. We believe that a great haircut 
              is more than just a service—it's an experience that boosts confidence and 
              helps you present your best self to the world.
            </p>

            <p className="text-lg leading-relaxed">
              Our modern, welcoming space features skilled barbers and stylists who 
              specialize in everything from classic cuts to contemporary styles. Whether 
              you're looking for a quick trim, a complete transformation, or expert grooming 
              services, our team is dedicated to exceeding your expectations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-lg text-foreground/90">
                To provide exceptional grooming services in a comfortable, inclusive environment 
                where every client leaves looking and feeling their absolute best. We're committed 
                to continuing education, using premium products, and building lasting relationships 
                with our community.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;