import { useEffect } from "react";

type ToastProps = {
  message: string;
  onClose: () => void;
};

const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // 3秒後自動關閉
    return () => clearTimeout(timer);
  }, [onClose]);

  console.log("Toast render");
  return (
    <div className="fixed bottom-4 text-medium right-4 border border-slate-400 bg-gray-800 text-white px-8 py-4 rounded-lg shadow-lg flex items-center justify-center min-w-[300px]">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 bg-none border-none text-white">
        ✖
      </button>
    </div>
  );
};

export default Toast;
