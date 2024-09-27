import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import MyContent from "./MyContent";
import { useParams } from "react-router-dom";
import { Tabs, Tab } from "@nextui-org/react";

function Account() {
  const { user } = useContext(AuthContext);
  const { userName } = useParams();

  if (!user) return null;

  const socialLinks = user.social_links || [];
  const tabs = [
    { id: "homepage", label: "Homepage", content: <MyContent /> },
    { id: "collection", label: "Collection", content: <div>Collection Content</div> },
  ];
  return (
    <>
      {user && (
        <div className="min-h-screen">
          <div className="relative h-max">
            <div
              className="w-full h-32 bg-cover bg-center"
              style={{
                backgroundColor: "#64e07767",
                top: "-50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                position: "absolute",
              }}
            ></div>
            <div className="absolute top-12 left-16 transform -translate-x-1/2 flex justify-center items-center h-full flex-col">
              <img src={user.avatar} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-white" />
              {/* <h1 className="text-2xl font-bold mt-4">{user.userName}</h1>
              <div className="flex justify-center space-x-4 mt-4">
                {socialLinks &&
                  Object.entries(socialLinks).map(([platform, url]) => (
                    <a key={platform} href={url} className="text-blue-800">
                      {platform}
                    </a>
                  ))}
              </div>
              {userName !== user.userName && (
                <div className="flex justify-center mt-4">
                  <button className="btn btn-primary border border-slate-500 rounded-full px-3 py-1">Follow</button>
                </div>
              )} */}
            </div>
          </div>

          <div className="container w-full pt-16 ">
            <div className="w-full flex flex-col justify-s">
              <Tabs aria-label="Dynamic tabs" items={tabs} variant="underlined" className="pl-60 ">
                {(item) => (
                  <Tab key={item.id} title={item.label}>
                    <div className="flex w-full">
                      {/* 左側的 info div */}
                      <div className="w-60 px-4 flex-shrink-0">
                        <div className="text-left">
                          <h1 className="text-2xl font-bold mt-4">{user.userName}</h1>
                          <p>Some information here</p>
                          <div className="flex justify-center  flex-col mt-4">
                            {socialLinks &&
                              Object.entries(socialLinks).map(([platform, url]) => (
                                <a key={platform} href={url} className="text-blue-800">
                                  {platform}
                                </a>
                              ))}
                          </div>
                          {userName !== user.userName && (
                            <div className="flex justify-center mt-4">
                              <button className="btn btn-primary border border-slate-500 rounded-full px-3 py-1">
                                Follow
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* 右側的 tab content */}
                      <div className="flex-grow overflow-auto px-4">{item.content}</div>
                    </div>
                  </Tab>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Account;
