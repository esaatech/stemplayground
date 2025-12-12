import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Us Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">About Us</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              STEM Playground is an interactive learning platform designed to make programming, 
              science, engineering, and mathematics concepts accessible and engaging through 
              hands-on visualizations and animations.
            </p>
            <Link 
              to="/about" 
              className="text-sm text-primary hover:underline font-medium"
            >
              Learn more →
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/programming" className="text-foreground hover:text-primary transition-colors">
                  Programming
                </Link>
              </li>
              <li>
                <Link to="/science" className="text-foreground hover:text-primary transition-colors">
                  Science
                </Link>
              </li>
              <li>
                <Link to="/engineering" className="text-foreground hover:text-primary transition-colors">
                  Engineering
                </Link>
              </li>
              <li>
                <Link to="/mathematics" className="text-foreground hover:text-primary transition-colors">
                  Mathematics
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground font-mono">
            STEM Playground © {new Date().getFullYear()}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Interactive learning through visualization
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

