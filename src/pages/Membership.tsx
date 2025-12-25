import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const Membership = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic",
      price: "$35",
      period: "/visit",
      description: "Perfect for occasional visits and basic services",
      features: [
        "Men's or women's haircut",
        "Shampoo included",
        "Style consultation",
        "Complimentary beverage",
        "Walk-in welcome",
      ],
      popular: false,
    },
    {
      name: "Monthly",
      price: "$89",
      period: "/month",
      description: "Best value for regular grooming needs",
      features: [
        "3 haircuts per month",
        "Beard trim anytime",
        "Priority booking",
        "10% off products",
        "Guest passes (2/month)",
        "Birthday month bonus cut",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "$149",
      period: "/month",
      description: "Ultimate grooming package for those who demand the best",
      features: [
        "Unlimited haircuts",
        "Unlimited beard services",
        "Hot towel shaves",
        "Premium product line",
        "VIP appointment times",
        "20% off all services",
        "Guest passes (5/month)",
        "Free styling products",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Membership Plans
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your grooming lifestyle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all group animate-fade-in relative ${
                plan.popular ? "md:scale-105 border-primary/50 shadow-lg shadow-primary/20" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => navigate(user ? "/dashboard" : "/auth")}
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {user ? "Select Plan" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold mb-4">All Plans Include</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>No signup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Free parking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Complimentary WiFi</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Questions about membership?</h3>
            <p className="text-muted-foreground mb-4">
              Our team is here to help you find the perfect plan
            </p>
            <Button
              onClick={() => navigate("/contact")}
              variant="outline"
              size="lg"
              className="border-primary/50 hover:border-primary"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Membership;