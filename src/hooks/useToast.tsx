import { useState } from "react";

export const useToast = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return { toastMessage, showToast, showToastMessage, handleCloseToast };
};
