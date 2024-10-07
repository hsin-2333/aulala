import { useEffect } from "react";
import { IoWarningOutline } from "react-icons/io5";

type ToastProps = {
  message: string;
  onClose: () => void;
};

const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // 3秒後自動關閉
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 left-3 text-medium border bg-white border-default-200 py-3 px-4 rounded-xl flex items-center justify-between w-1/3 group">
      <div className="flex gap-4 justify-center items-center">
        <IoWarningOutline className="text-red-400" size={20} />
        <div className="flex flex-col items-start gap-1">
          <span className="font-bold text-sm">{message}</span>
          {/* <span className="text-xs">{message}</span> */}
        </div>
      </div>

      <button onClick={onClose} className="bg-none border-none hidden group-hover:block">
        ✖
      </button>
    </div>
  );
};

export default Toast;
