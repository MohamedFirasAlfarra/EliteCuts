import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Review {
  id: string;
  barber_name: string;
  service_type: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ReviewsListProps {
  filterByService?: string;
  filterByBarber?: string;
}

export const ReviewsList = ({ filterByService, filterByBarber }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [filterByService, filterByBarber]);

  const fetchReviews = async () => {
    let query = supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterByService) {
      query = query.eq("service_type", filterByService);
    }

    if (filterByBarber) {
      query = query.eq("barber_name", filterByBarber);
    }

    const { data, error } = await query;

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No reviews yet. Be the first to leave a review!
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(averageRating)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">{review.service_type}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), "PPP")}
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-muted-foreground mt-2">{review.comment}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
