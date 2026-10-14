import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeOwnerTokenFromHash } from "../../api/owner";

export default function OwnerEntryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    storeOwnerTokenFromHash();
    navigate("/owner/promotions", { replace: true });
  }, [navigate]);

  return null;
}
