import {
  Avatar,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
} from "@nextui-org/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { BiSolidEditAlt } from "react-icons/bi";
import { useParams } from "react-router-dom";
import Toast from "../../components/Common/Toast";
import { AuthContext } from "../../context/AuthContext";
import { User } from "../../types";
import dbApi from "../../utils/firebaseService";
import MyContent from "./MyContent";

interface FormData {
  selfIntro: string;
  website?: string;
  twitter?: string;
}

const isValidUrl = (url: string) => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i",
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

  const [isFollowing, setIsFollowing] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  const urlName = userName as string;

  const { data: userData, isLoading } = useQuery({
    queryKey: ["userName", urlName],
    queryFn: async () => {
      if (urlName) {
        const uuName = await dbApi.queryCollection(
          "users",
          { userName: urlName },
          1,
        );
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
    {
      id: "collection",
      label: "Collection",
      content: <div>Collection Content</div>,
    },
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

  const handleFollow = async (userName: string) => {
    if (!user) return;

    try {
      await dbApi.updateFollow(user.userName as string, userName);
      setIsFollowing(true);
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  };

  const handleUnfollow = async (userName: string) => {
    if (!user) return;

    try {
      await dbApi.updateFollow(user.userName as string, userName);
      setIsFollowing(false);
      setShowUnfollowModal(false);
    } catch (error) {
      console.error("Failed to unfollow user:", error);
    }
  };

  return (
    <>
      <div className="z-1 fixed z-[60] bg-white">
        {showToast && (
          <Toast message={toastMessage} onClose={handleCloseToast} />
        )}
      </div>
      {urlName && userData && (
        <div>
          <div className="relative">
            <div className="absolute -top-1/2 left-1/2 h-32 w-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-blue-200 to-cyan-200 bg-cover bg-center"></div>
            {user && user.userName === userData.userName && (
              <Button
                isIconOnly
                className="right-2p absolute h-8 w-8 translate-y-3/4 rounded bg-slate-200"
                aria-label="EditIcon"
                onPress={handleEdit}
              >
                <BiSolidEditAlt />
              </Button>
            )}

            <div className="absolute left-10 top-2 flex h-full -translate-x-1/2 transform flex-col items-center justify-center sm:left-20 sm:top-12">
              <Avatar
                src={userData.avatar}
                alt="User Avatar"
                isBordered
                as="button"
                className="h-14 w-14 flex-shrink-0 transition-transform"
                name={userData.userName}
                size="sm"
                color="primary"
              />
            </div>
          </div>
          <div
            className="container w-full pt-16"
            style={{ height: "calc(100vh-100px)" }}
          >
            <div className="justify-s flex w-full flex-col">
              <Tabs
                aria-label="Dynamic tabs"
                items={tabs}
                variant="underlined"
                classNames={{
                  tabList:
                    "gap-6 w-full relative rounded-none p-0 sm:pl-64 border-b border-divider",
                  cursor: "w-full bg-primary-200",
                  tab: "w-full sm:max-w-fit px-0 h-12",
                  tabContent: "group-data-[selected=true]:text-primary-600",
                }}
              >
                {(item) => (
                  <Tab key={item.id} title={item.label}>
                    <div className="flex w-full px-2 pl-0 sm:pl-6">
                      <div className="hidden flex-shrink-0 px-4 sm:block sm:w-60">
                        <div className="text-left">
                          <h1 className="mt-4 whitespace-pre-wrap break-words text-2xl font-bold">
                            {userData.userName}
                          </h1>
                          <p className="mr-1 whitespace-pre-wrap break-words">
                            {userData.selfIntro ? userData.selfIntro : " "}
                          </p>
                          <div className="mt-4 flex flex-col justify-center">
                            {userData.social_links &&
                              Object.entries(userData.social_links)
                                .filter(([, url]) => url)
                                .map(([platform, url]) => (
                                  <a
                                    key={platform}
                                    href={url as string}
                                    className="text-blue-800"
                                  >
                                    {platform}
                                  </a>
                                ))}
                          </div>
                          {user && user.userName !== userData.userName && (
                            <div className="mt-4 flex justify-start">
                              <Button
                                variant="ghost"
                                radius="full"
                                className="btn btn-primary border border-slate-500 px-3 py-1"
                                onPress={() => {
                                  if (isFollowing) {
                                    setShowUnfollowModal(true);
                                  } else {
                                    handleFollow(userData.userName as string);
                                  }
                                }}
                              >
                                {isFollowing ? "Following" : "Follow"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-full sm:pr-6">{item.content}</div>
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
        className="m-0 rounded-b-none sm:rounded-b-3xl"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleFormSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                Edit Profile
              </ModalHeader>
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
                      <span className="text-small text-default-400">
                        https://twitter.com/
                      </span>
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
      <Modal isOpen={showUnfollowModal} onOpenChange={setShowUnfollowModal}>
        <ModalContent>
          <ModalHeader>Unfollow {userName}?</ModalHeader>
          <ModalBody>You will stop seeing updates from {userName}</ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setShowUnfollowModal(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              variant="light"
              onPress={() => handleUnfollow(userName as string)}
            >
              Unfollow
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Account;
