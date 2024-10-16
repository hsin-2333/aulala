import { Button, Card, CardBody, Image } from "@nextui-org/react";
import Icon from "../components/Icon";
export default function NextCard() {
  //   const [liked, setLiked] = React.useState(false);

  return (
    <Card isBlurred className="border-none bg-background/60 dark:bg-default-100/50 max-w-[510px]" shadow="sm">
      <CardBody>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
          <div className="relative col-span-6 md:col-span-4">
            <Image
              alt="Album cover"
              className="object-cover"
              height="auto"
              //   shadow="md"
              src="https://nextui.org/images/album-cover.png"
              width="100%"
            />
          </div>

          <div className="flex h-full flex-col col-span-6 md:col-span-8">
            <div className="flex justify-between items-start h-full">
              <div className="flex flex-col gap-0 justify-between h-full">
                <div>
                  <h1 className="text-medium font-semibold mt-2">Frontend Radio</h1>
                  <h3 className="text-small tracking-tight text-default-400">by Daily Mix</h3>
                  <p className="text-small text-default-400 pt-2">
                    Frontend developer and UI/UX enthusiast. Join me on this coding adventure!
                  </p>
                </div>

                <div>
                  {/* <p className="text-small text-default-600 pt-2">03"20</p> */}
                  <span
                    className="cursor-pointer bg-gray-50 py-1 text-xs bg-opacity-50"

                    // key={category.value}
                    // onClick={() => setSelectedCategory(category.value)}
                  >
                    # test
                  </span>
                </div>
              </div>
              <Button
                isIconOnly
                className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-2 translate-x-2"
                radius="full"
                variant="light"
                // onPress={() => setLiked((v) => !v)}
              >
                <Icon name="like" className="h-6 w-6" />
                {/* <Icon className={like ? "[&>path]:stroke-transparent" : ""} fill={liked ? "currentColor" : "none"} /> */}
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
