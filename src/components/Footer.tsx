import { Link } from "react-router-dom";
import { Dumbbell, Mail, Phone, MapPin, Scissors } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Scissors className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EliteCuts
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Transform your body, elevate your mind. Join the elite fitness revolution.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                About Us
              </Link>
              <Link to="/programs" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Programs
              </Link>
              <Link to="/trainers" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Trainers
              </Link>
              <Link to="/membership" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Membership
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone size={16} className="text-primary" />
                <span>+96312345678</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail size={16} className="text-primary" />
                <span>EliteCuts@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin size={16} className="text-primary" />
                <span>Syria Damascucs</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Hours</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Mon - Fri:</span>
                <span>5AM - 11PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span>6AM - 9PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span>7AM - 8PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EliteCuts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;