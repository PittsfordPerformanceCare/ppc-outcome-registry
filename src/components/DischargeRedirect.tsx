import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function DischargeRedirect() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (episodeId) {
      navigate(`/discharge?episode=${episodeId}`, { replace: true });
    } else {
      navigate("/discharge", { replace: true });
    }
  }, [episodeId, navigate]);

  return null;
}
