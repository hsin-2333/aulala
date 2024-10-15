import { AuthContext } from "../../context/AuthContext";
import { useContext, useState } from "react";
import MyContent from "./MyContent";
import { useParams } from "react-router-dom";
import {
  Tabs,
  Tab,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Avatar,
} from "@nextui-org/react";
import { BiSolidEditAlt } from "react-icons/bi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dbApi from "../../utils/firebaseService";
import { User } from "../../types";
import Toast from "../../components/Toast";

interface FormData {
  selfIntro: string;
  website?: string;
  twitter?: string;
}

const isValidUrl = (url: string) => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i" // fragment locator
  );
  return !!urlPattern.test(url);
};

function Account() {
  const { user } = useContext(AuthContext);
  const { userName } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const queryClient = useQueryClient();

  const [selfIntro, setSelfIntro] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const urlName = userName as string;

  const { data: userData, isLoading } = useQuery({
    queryKey: ["userName", urlName],
    queryFn: async () => {
      if (urlName) {
        const uuName = await dbApi.queryCollection("users", { userName: urlName }, 1);
        return uuName[0] as User;
      }
    },
    enabled: !!urlName,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!userData) return null;

  if (!user) return null;

  const tabs = [
    { id: "homepage", label: "Homepage", content: <MyContent /> },
    { id: "collection", label: "Collection", content: <div>Collection Content</div> },
  ];

  const handleEdit = () => {
    setSelfIntro(userData.selfIntro || "");
    setWebsite(userData.social_links?.website || "");

    const twitter = userData.social_links?.twitter || "";
    const twitterName = twitter.replace("https://twitter.com/", "");
    setTwitter(twitterName || "");
    onOpen();
  };

  const handleSave = async (data: FormData) => {
    const website = data.website?.trim();
    const twitter = data.twitter?.trim();

    if (website && !isValidUrl(website)) {
      setToastMessage("網站連結非有效網址，請重新檢查網址");
      setShowToast(true);
      return;
    }

    const updatedUser: User = {
      ...user,
      selfIntro: data.selfIntro.trim(),
      social_links: {
        website: website,
        twitter: twitter ? `https://twitter.com/${twitter}` : "",
      },
    };

    await dbApi.updateUser(updatedUser);
    queryClient.invalidateQueries({ queryKey: ["userName", userName] });
    onOpenChange();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      selfIntro,
      website,
      twitter,
    };
    handleSave(formData);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <>
      <div className="fixed z-[60] z-1 bg-white">
        {showToast && <Toast message={toastMessage} onClose={handleCloseToast} />}
      </div>
      {urlName && userData && (
        <div>
          <div className="relative ">
            <div
              className="absolute w-full h-32 bg-cover bg-center bg-gradient-to-tr from-blue-200 to-cyan-200 "
              style={{
                top: "-50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            ></div>
            {user && user.userName === userData.userName && (
              <Button
                isIconOnly
                style={{
                  right: "2%",
                  transform: "translate(0%, 80%)",
                  position: "absolute",
                }}
                className="bg-slate-200 h-8 w-8 rounded"
                aria-label="EditIcon"
                onPress={handleEdit}
              >
                <BiSolidEditAlt />
              </Button>
            )}

            <div className=" absolute top-2 left-10 sm:top-12 sm:left-20 transform -translate-x-1/2 flex justify-center items-center h-full flex-col">
              <Avatar
                src={userData.avatar}
                alt="User Avatar"
                isBordered
                as="button"
                className="transition-transform w-14 h-14 flex-shrink-0"
                name={userData.userName}
                size="sm"
                color="primary"
              />
            </div>
          </div>
          <div className="container w-full pt-16" style={{ height: "calc(100vh-100px)" }}>
            <div className="w-full flex flex-col justify-s">
              <Tabs
                aria-label="Dynamic tabs"
                items={tabs}
                variant="underlined"
                classNames={{
                  tabList: "gap-6 w-full relative rounded-none p-0 sm:pl-64 border-b border-divider",
                  cursor: "w-full bg-primary-200",
                  tab: "w-full sm:max-w-fit px-0 h-12",
                  tabContent: "group-data-[selected=true]:text-primary-600",
                }}
              >
                {(item) => (
                  <Tab key={item.id} title={item.label}>
                    <div className="flex w-full px-2 pl-0 sm:pl-6">
                      <div className="hidden sm:block sm:w-60 px-4 flex-shrink-0">
                        <div className="text-left">
                          <h1 className="text-2xl font-bold mt-4 whitespace-pre-wrap break-words">
                            {userData.userName}
                          </h1>
                          <p className="whitespace-pre-wrap break-words mr-1">
                            {userData.selfIntro ? userData.selfIntro : " "}
                          </p>
                          <div className="flex justify-center flex-col mt-4">
                            {userData.social_links &&
                              Object.entries(userData.social_links)
                                .filter(([, url]) => url) // 過濾掉空的值
                                .map(([platform, url]) => (
                                  <a key={platform} href={url as string} className="text-blue-800">
                                    {platform}
                                  </a>
                                ))}
                          </div>
                          {user && user.userName !== userData.userName && (
                            <div className="flex justify-start mt-4">
                              <Button
                                variant="ghost"
                                radius="full"
                                className="btn btn-primary border border-slate-500 px-3 py-1"
                              >
                                Follow
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="sm:pr-6">{item.content}</div>
                    </div>
                  </Tab>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="bottom-center"
        className="m-0 rounded-b-none sm:rounded-b-3xl "
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleFormSubmit}>
              <ModalHeader className="flex flex-col gap-1">Edit Profile</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="About Me"
                  placeholder="Enter a shot bio"
                  variant="bordered"
                  value={selfIntro}
                  onChange={(e) => setSelfIntro(e.target.value)}
                />
                <Input
                  label="Website"
                  placeholder="your website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <Input
                  label="Twitter"
                  placeholder="your Twitter username"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">https://twitter.com/</span>
                    </div>
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" variant="flat" type="submit">
                  Save
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default Account;
