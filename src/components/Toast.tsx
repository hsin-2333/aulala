import { useEffect } from "react";
import { IoWarningOutline } from "react-icons/io5";

type ToastProps = {
  message: string;
  onClose: () => void;
};

const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="group fixed bottom-4 left-3 flex w-1/3 items-center justify-between rounded-xl border border-default-200 bg-white px-4 py-3 text-medium">
      <div className="flex items-center justify-center gap-4">
        <IoWarningOutline className="text-red-400" size={20} />
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-bold">{message}</span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="hidden border-none bg-none group-hover:block"
      >
        ✖
      </button>
    </div>
  );
};

export default Toast;
