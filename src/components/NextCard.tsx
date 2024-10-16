import { Button, Card, CardBody, Image } from "@nextui-org/react";
import Icon from "../components/Icon";
export default function NextCard() {
  return (
    <Card
      isBlurred
      className="max-w-[510px] border-none bg-background/60 dark:bg-default-100/50"
      shadow="sm"
    >
      <CardBody>
        <div className="grid grid-cols-6 items-center justify-center gap-6 md:grid-cols-12 md:gap-4">
          <div className="relative col-span-6 md:col-span-4">
            <Image
              alt="Album cover"
              className="object-cover"
              height="auto"
              src="https://nextui.org/images/album-cover.png"
              width="100%"
            />
          </div>

          <div className="col-span-6 flex h-full flex-col md:col-span-8">
            <div className="flex h-full items-start justify-between">
              <div className="flex h-full flex-col justify-between gap-0">
                <div>
                  <h1 className="mt-2 text-medium font-semibold">
                    Frontend Radio
                  </h1>
                  <h3 className="text-small tracking-tight text-default-400">
                    by Daily Mix
                  </h3>
                  <p className="pt-2 text-small text-default-400">
                    Frontend developer and UI/UX enthusiast. Join me on this
                    coding adventure!
                  </p>
                </div>

                <div>
                  <span className="cursor-pointer bg-gray-50 bg-opacity-50 py-1 text-xs">
                    # test
                  </span>
                </div>
              </div>
              <Button
                isIconOnly
                className="-translate-y-2 translate-x-2 text-default-900/60 data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
              >
                <Icon name="like" className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
