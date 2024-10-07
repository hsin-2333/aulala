import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import MyContent from "./MyContent";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
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
} from "@nextui-org/react";
import { BiSolidEditAlt } from "react-icons/bi";
import { useQuery } from "@tanstack/react-query";
import dbApi from "../../utils/firebaseService";
import { User } from "../../types";

interface FormData {
  selfIntro: string;
  website: string;
  twitter: string;
}
function Account() {
  const { user } = useContext(AuthContext);
  const { userName } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      selfIntro: user?.selfIntro || "",
      website: user?.social_links?.website || "",
      twitter: user?.social_links?.twitter || "",
    },
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", user?.uid],

    queryFn: () => {
      if (user) {
        return dbApi.getUser(user?.uid);
      }
    },
    enabled: !!user?.uid,
  });
  if (isLoading) return <div>Loading...</div>;
  if (!userData) return null;

  if (!user) return null;

  const socialLinks = user.social_links || {};
  const tabs = [
    { id: "homepage", label: "Homepage", content: <MyContent /> },
    { id: "collection", label: "Collection", content: <div>Collection Content</div> },
  ];

  const handleSave = async (data: FormData) => {
    const updatedUser: User = {
      ...user,
      selfIntro: data.selfIntro,
      social_links: {
        website: data.website,
        twitter: data.twitter,
      },
    };
    await dbApi.updateUser(updatedUser);
    // queryClient.invalidateQueries({ queryKey: ["user", user?.uid] });
    onOpenChange();
    window.location.reload();
  };

  return (
    <>
      {user && (
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
            <Button
              isIconOnly
              style={{
                right: "2%",
                transform: "translate(0%, 80%)",
                position: "absolute",
              }}
              className="bg-slate-200 h-8 w-8 rounded"
              aria-label="EditIcon"
              onPress={onOpen}
            >
              <BiSolidEditAlt />
            </Button>
            <div className=" absolute top-2 left-10 sm:top-12 sm:left-20 transform -translate-x-1/2 flex justify-center items-center h-full flex-col">
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-14 h-14 sm:w-24 sm:h-24 rounded-full border-2 sm:border-4 border-white"
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
                          <h1 className="text-2xl font-bold mt-4">{user.userName}</h1>
                          <p>{user.selfIntro ? user.selfIntro : " "}</p>
                          <div className="flex justify-center flex-col mt-4">
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
            <form onSubmit={handleSubmit(handleSave)}>
              <ModalHeader className="flex flex-col gap-1">Edit Profile</ModalHeader>
              <ModalBody>
                <Input
                  {...register("selfIntro")}
                  autoFocus
                  label="About Me"
                  placeholder="Enter a shot bio"
                  variant="bordered"
                />
                <Input
                  {...register("website")}
                  label="Website"
                  placeholder="your website URL"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">https://</span>
                    </div>
                  }
                />
                <Input
                  {...register("twitter")}
                  label="Twitter"
                  placeholder="your Twitter username"
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
