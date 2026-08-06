import { Link } from 'wouter';
import { Card, CardContent } from '@workspace/feelfed-ds/components/ui/card';
import { Button } from '@workspace/feelfed-ds/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="px-4 py-16">
      <Card>
        <CardContent className="p-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Compass className="h-6 w-6" />
          </span>
          <h1 className="font-serif text-2xl">This page isn't here</h1>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            Let's get you back to somewhere calm.
          </p>
          <Button asChild className="mt-4" data-testid="button-home">
            <Link href="/">Back to Today</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
