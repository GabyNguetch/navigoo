"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, Loader2, MessageSquare, Send, Cloud } from "lucide-react";
import { reviewService, PoiReview } from "@/services/reviewService";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { clsx } from "clsx";

interface ReviewsSectionProps {
  poiId: string;
  onReviewSubmitted?: () => void;
}

export const ReviewsSection = ({ poiId, onReviewSubmitted }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<PoiReview[]>([]);
  const [stats, setStats] = useState<{ averageRating: number; reviewCount: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState<PoiReview | null>(null);

  const currentUser = authService.getSession();

  // Charger les avis
  useEffect(() => {
    loadReviews();
  }, [poiId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      
      // Sécurité : Si le POI est externe, inutile de charger quoi que ce soit
      if (poiId.startsWith("external-") || poiId.startsWith("search-")) {
          setReviews([]);
          setStats({ averageRating: 0, reviewCount: 0 });
          setUserHasReviewed(false);
          return;
      }

      // 1. Charger les avis
      const reviewsData = await reviewService.getReviewsByPoi(poiId);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

      // 2. Charger les statistiques (on attrape l'erreur individuellement ici aussi)
      try {
        const statsData = await reviewService.getPoiStats(poiId);
        setStats(statsData || { averageRating: 0, reviewCount: 0 });
      } catch (e) {
        setStats({ averageRating: 0, reviewCount: 0 });
      }

      // 3. Vérification utilisateur connecté
      if (currentUser) {
         const hasReviewed = await reviewService.hasUserReviewed(currentUser.userId, poiId);
         setUserHasReviewed(hasReviewed);
      }
    } catch (error) {
      console.warn("⚠️ [ReviewsSection] Erreur chargement reviews (POI peut être hors-base):", error);
    } finally {
      setIsLoading(false);
    }
};

  const handleSubmitReview = async () => {
    if (!currentUser) {
      alert("Vous devez être connecté pour laisser un avis");
      return;
    }

    if (!reviewText.trim()) {
      alert("Veuillez écrire un commentaire");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("📝 [ReviewsSection] Soumission d'un avis...");

      const newReview: Omit<PoiReview, 'reviewId' | 'createdAt'> = {
        poiId,
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        platformType: "WEB",
        rating,
        reviewText: reviewText.trim(),
        likes: 0,
        dislikes: 0,
      };

      const created = await reviewService.createReview(newReview);
      console.log("✅ [ReviewsSection] Avis créé:", created);

      // Recharger les avis
      await loadReviews();

      // Reset form
      setReviewText("");
      setRating(5);
      setShowForm(false);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      alert("Votre avis a été publié avec succès !");
    } catch (error: any) {
      console.error("❌ [ReviewsSection] Erreur soumission:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    try {
      console.log("👍 [ReviewsSection] Like avis:", reviewId);
      await reviewService.likeReview(reviewId);
      await loadReviews();
    } catch (error) {
      console.error("❌ [ReviewsSection] Erreur like:", error);
    }
  };

  const handleDislike = async (reviewId: string) => {
    try {
      console.log("👎 [ReviewsSection] Dislike avis:", reviewId);
      await reviewService.dislikeReview(reviewId);
      await loadReviews();
    } catch (error) {
      console.error("❌ [ReviewsSection] Erreur dislike:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header avec Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            Avis
          </h3>
          
          {stats && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                <Star size={14} className="text-primary fill-primary" />
                <span className="font-bold text-primary">{stats.averageRating.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {currentUser && !userHasReviewed && (
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Send size={16} />
            {showForm ? 'Annuler' : 'Commenter'}
          </Button>
        )}
      </div>

      {/* Formulaire d'ajout d'avis */}
      {showForm && !userHasReviewed && (
        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">
              Votre note
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={clsx(
                      "transition-colors",
                      star <= rating
                        ? "fill-primary text-primary"
                        : "text-zinc-300 dark:text-zinc-600"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">
              Votre commentaire
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={4}
              className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <Button
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Send size={16} />
                Publier l'avis
              </>
            )}
          </Button>
        </div>
      )}

      {/* Message si déjà reviewé */}
      {userHasReviewed && userReview && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            ✅ Vous avez déjà laissé un avis ({userReview.rating} ⭐)
          </p>
        </div>
      )}

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          ))
        ) : (
          <div className="text-center py-8 text-zinc-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Aucun avis pour le moment</p>
            <p className="text-xs mt-1">Soyez le premier à donner votre avis !</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour une carte d'avis
const ReviewCard = ({ review, onLike, onDislike }: {
  review: PoiReview;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  const handleLike = async () => {
    if (isLiking || !review.reviewId) return;
    setIsLiking(true);
    await onLike(review.reviewId);
    setIsLiking(false);
  };

  const handleDislike = async () => {
    if (isDisliking || !review.reviewId) return;
    setIsDisliking(true);
    await onDislike(review.reviewId);
    setIsDisliking(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
            {review.userId.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={clsx(
                      star <= review.rating
                        ? "fill-primary text-primary"
                        : "text-zinc-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-500">
                {review.createdAt && new Date(review.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {review.reviewText && (
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 leading-relaxed">
          {review.reviewText}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-1 text-zinc-500 hover:text-primary transition-colors disabled:opacity-50"
        >
          <ThumbsUp size={14} />
          <span className="font-medium">{review.likes}</span>
        </button>

        <button
          onClick={handleDislike}
          disabled={isDisliking}
          className="flex items-center gap-1 text-zinc-500 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <ThumbsDown size={14} />
          <span className="font-medium">{review.dislikes}</span>
        </button>

        <div className="ml-auto text-zinc-400">
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
            {review.platformType}
          </span>
        </div>
      </div>
    </div>
  );
};