import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl mb-4 text-muted-foreground/20">404</h1>
        <h2 className="text-3xl md:text-4xl mb-4">Page Not Found</h2>
        <p className="text-lg text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 w-5 h-5" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
