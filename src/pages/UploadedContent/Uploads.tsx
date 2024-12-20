import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import { SlOptionsVertical } from "react-icons/sl";
import { AuthContext } from "../../context/AuthContext";
import { Story } from "../../types";
import dbApi from "../../utils/firebaseService";

const StoryTable = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState<string>("");

  const statusColorMap: {
    Done: "success";
    paused: "warning";
    Processing: "primary";
    undefined: "default";
  } = {
    Done: "success",
    paused: "warning",
    Processing: "primary",
    undefined: "default",
  };

  useEffect(() => {
    if (!user?.userName) return;

    const fetchData = async () => {
      const unsubscribe = await dbApi.subscribeToStory(
        user?.userName as string,
        (storyData) => {
          queryClient.setQueryData(["stories", user?.userName], storyData);
        },
      );
      return unsubscribe;
    };

    const unsubscribePromise = fetchData();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, [user?.userName, queryClient]);

  const { data: storyData } = useQuery<Story[]>({
    queryKey: ["stories", user?.userName],
    select: (data) => data || [],
  });

  const handleDelete = async (storyId: string) => {
    await dbApi.deleteStory(storyId);
    if (user?.userName) {
      queryClient.invalidateQueries({ queryKey: ["stories", user.userName] });
    }
  };

  const handleEdit = (story: Story) => {
    setSelectedStory(story);
    setTitle(story.title);
    setSummary(story.summary || "");
    onOpen();
  };

  const handleSave = async () => {
    if (selectedStory && selectedStory.id) {
      await dbApi.updateStory(selectedStory.id, { title, summary });
      queryClient.invalidateQueries({ queryKey: ["stories", user?.userName] });
      onOpenChange();
    }
  };

  return (
    <div className="space-y-4 text-left">
      <Button
        className="border-dashed text-default-700"
        variant="bordered"
        type="button"
        radius="sm"
        size="md"
        startContent={<IoAddCircleOutline size={20} />}
        as={Link}
        href="/upload/story"
      >
        Upload
      </Button>

      <div className="overflow-x-auto overflow-y-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-default-500"
              >
                Audio Title
              </th>
              <th
                scope="col"
                className="w-1/3 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-default-500"
              >
                Summary
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-default-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-default-500"
              >
                Created At
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-default-500"
              ></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {storyData?.map((story) => (
              <tr key={story.id} className="hover:bg-gray-100">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {story.title}
                </td>
                <td className="w-[200px] px-6 py-4 text-sm text-gray-500">
                  <div className="line-clamp-5 overflow-hidden">
                    {story.summary}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {story.status !== undefined && (
                    <Chip
                      className="capitalize"
                      color={
                        statusColorMap[
                          story.status as keyof typeof statusColorMap
                        ]
                      }
                      size="sm"
                      variant="flat"
                    >
                      {story.status}
                    </Chip>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {story.created_at instanceof Timestamp
                    ? story.created_at.toDate().toLocaleString()
                    : story.created_at}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div className="relative flex items-center justify-start gap-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <SlOptionsVertical className="text-default-400" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem href={`/story/${story.id}`}>
                          View
                        </DropdownItem>
                        <DropdownItem onPress={() => handleEdit(story)}>
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          onPress={() => {
                            if (story.id) {
                              handleDelete(story.id);
                            }
                          }}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Story
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Title"
                  placeholder="Edit your title"
                  variant="bordered"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  label="Summary"
                  placeholder="Edit your summary"
                  type="text"
                  variant="bordered"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" variant="flat" onPress={handleSave}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default StoryTable;
