import { useQuery, useQueryClient } from "@tanstack/react-query";
import dbApi from "../../../utils/firebaseService";
import { Story } from "../../../types";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useState } from "react";
import { Timestamp } from "firebase/firestore";
import {
  Chip,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Textarea,
} from "@nextui-org/react";
import { SlOptionsVertical } from "react-icons/sl";

const StoryTable = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState<string>("");

  const statusColorMap = {
    Done: "success",
    paused: "danger",
    Processing: "warning",
    undefined: "default",
  };

  const { data: storyData, error } = useQuery({
    queryKey: ["stories", user?.userName],
    queryFn: async () => {
      const story = await dbApi.queryCollection("stories", { author: user?.userName }, 10, "created_at", "desc");
      return story as Story[];
    },
  });

  if (error) return <div>Error loading story data: {error.message}</div>;
  console.log(storyData);

  const handleDelete = async (storyId: string) => {
    await dbApi.deleteStory(storyId);
    if (user?.userName) {
      queryClient.invalidateQueries({ queryKey: ["stories", user.userName] }); // Refresh the story list
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
              >
                Audio Title
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
                style={{ width: "33%" }}
              >
                Summary
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
              >
                Created At
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {storyData?.map((story) => (
              <tr key={story.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{story.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500" style={{ width: "200px" }}>
                  <div className="line-clamp-5 overflow-hidden">{story.summary}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {story.status !== undefined && (
                    // @ts-expect-error(123)
                    <Chip className="capitalize" color={statusColorMap[story.status]} size="sm" variant="flat">
                      {story.status}
                    </Chip>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {story.created_at instanceof Timestamp
                    ? story.created_at.toDate().toLocaleString()
                    : story.created_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                  <div className="relative flex justify-start items-center gap-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <SlOptionsVertical className="text-default-300" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem href={`/story/${story.id}`}>View</DropdownItem>
                        <DropdownItem onPress={() => handleEdit(story)}>Edit</DropdownItem>
                        <DropdownItem
                          onPress={() => {
                            console.log(story.id);
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
              <ModalHeader className="flex flex-col gap-1">Edit Story</ModalHeader>
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
