import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    const checkAdmin = async () => {
      setLoading(true);
      console.log("useAdmin: Checking admin role for user:", user.id);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!isMounted) return;
      if (error) {
        console.error("useAdmin error:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
        console.log("useAdmin: Admin role confirmed:", !!data);
      }
      setLoading(false);
    };
    checkAdmin();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  return { isAdmin, loading };
};