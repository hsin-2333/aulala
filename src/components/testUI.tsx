import { useState } from "react";

import { Card, Skeleton } from "@nextui-org/react";
const Skelenton_ui = () => {
  return (
    <Card className="w-[200px] space-y-5 p-4" radius="lg">
      <Skeleton className="rounded-lg">
        <div className="h-24 rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="space-y-3">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg">
          <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    </Card>
  );
};

const TestUI = () => {
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const handleCardClick = () => {
    setIsDetailVisible(true);
  };
  console.log("TestUI");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="w-full bg-gray-800 text-white p-4">
        {/* Navbar 内容 */}
        Navbar
      </div>

      {/* 主体内容 */}
      <div className="flex flex-grow">
        <div className={`border border-blue-300 flex-grow ${isDetailVisible ? "w-3/4" : "w-full"}`}>
          {/* 主要内容 */}
          <div onClick={handleCardClick} className="card">
            {/* 卡片内容 */}
            <Skelenton_ui />
          </div>
        </div>
        {isDetailVisible && <div className="w-1/3 border border-pink-300">{/* 次要内容 */}</div>}
      </div>

      {/* 满宽度的 div */}
      {isDetailVisible && (
        <div className="w-full bg-gray-200 p-4 border-t border-gray-400">
          {/* 满宽度 div 内容 */}
          Full-width div
        </div>
      )}
    </div>
  );
};

export default TestUI;
