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
    <div className="flex min-h-screen flex-col">
      <div className="w-full bg-gray-800 p-4 text-white">Navbar</div>

      <div className="flex flex-grow">
        <div
          className={`flex-grow border border-blue-300 ${isDetailVisible ? "w-3/4" : "w-full"}`}
        >
          <div onClick={handleCardClick} className="card">
            <Skelenton_ui />
          </div>
        </div>
        {isDetailVisible && (
          <div className="w-1/3 border border-pink-300"></div>
        )}
      </div>

      {isDetailVisible && (
        <div className="w-full border-t border-gray-400 bg-gray-200 p-4">
          Full-width div
        </div>
      )}
    </div>
  );
};

export default TestUI;
