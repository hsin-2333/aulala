import { AuthContext } from "../../context/AuthContext";
import { useContext, useState } from "react";
import MyContent from "./MyContent";
import { useParams } from "react-router-dom";

function Account() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("Homepage");
  const { userName } = useParams();

  if (!user) return null;

  const socialLinks = user.social_links || [];

  return (
    <>
      {user && (
        <div className="min-h-screen ">
          {/* 背景圖 */}
          <div className="w-full h-64 bg-cover bg-center" style={{ backgroundColor: "#64e07767" }}>
            <div className="flex justify-center items-center h-full flex-col">
              <img src={user.avatar} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-white" />
              <h1 className="text-2xl font-bold mt-4">{user.userName}</h1>
              <div className="flex justify-center space-x-4 mt-4">
                {socialLinks &&
                  Object.entries(socialLinks).map(([platform, url]) => (
                    <a key={platform} href={url} className="text-blue-800">
                      {platform}{" "}
                    </a>
                  ))}
              </div>
              {userName !== user.userName && (
                <div className="flex justify-center mt-4">
                  <button className="btn btn-primary border border-slate-500 rounded-full px-3 py-1">Follow</button>
                </div>
              )}
            </div>
          </div>

          <div className="container mx-auto p-4">
            {/* <div className="text-center mt-4">
              <h1 className="text-2xl font-bold">{user.userName}</h1>
               <p className="text-gray-600 mt-2">{user.bio}</p> 
            </div> */}

            <div className="flex justify-center space-x-4 mt-8 border-b">
              <button
                className={`px-4 py-2 -mb-px font-semibold text-gray-700 border-b-2 ${
                  activeTab === "Homepage" ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => setActiveTab("Homepage")}
              >
                Homepage
              </button>

              <button
                className={`px-4 py-2 -mb-px font-semibold text-gray-700 border-b-2 ${
                  activeTab === "collection" ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => setActiveTab("collection")}
              >
                Collection
              </button>
            </div>

            <div className="mt-8">
              <div className="tab-content mt-4 ">
                {activeTab === "Homepage" && (
                  <div className="relative ">
                    <MyContent />
                  </div>
                )}
                {activeTab === "collection" && <div></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Account;
