import { ImageCard, ScriptCard } from "../../components/Common/Card";
import { convertTimestampToDate } from "../../utils/convertTimestampToDate";

interface Story {
  id: string;
  title?: string;
  author?: string;
  created_at?: { seconds: number; nanoseconds: number };
  duration?: number;
  summary?: string;
  img_url?: string[];
  tags?: string[];
}

interface ContentSectionProps {
  title: string;
  caption: string;
  items: Story[];
  onCardClick: (id: string, type: "script" | "story") => void;
  isScript?: boolean;
}

export const ContentSection = ({
  title,
  caption,
  items,
  onCardClick,
  isScript = false,
}: ContentSectionProps) => {
  return (
    <>
      <div className="flex items-center justify-between text-left">
        <div className="w-full">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm">{caption}</p>
        </div>
      </div>
      <section
        className={`mb-4 h-auto ${isScript ? "mt-4 flex flex-wrap gap-2 sm:gap-4" : "mt-2 flex space-x-8 overflow-x-auto whitespace-nowrap"} custom-scrollbar scroll-padding`}
      >
        {items.map((item: Story) => {
          const date = item.created_at
            ? convertTimestampToDate(item.created_at).toLocaleDateString()
            : "";
          if (isScript) {
            return (
              <div
                key={item.id}
                className="flex flex-grow justify-start sm:w-1/2 lg:w-1/3 xl:w-1/4"
              >
                <ScriptCard
                  onClick={() => onCardClick(item.id, "script")}
                  image={item.img_url?.[0]}
                  title={item.title || "Untitled"}
                  tags={item.tags || []}
                  author={item.author || "Unknown"}
                  summary={item.summary || ""}
                  scriptId={item.id}
                  date={date}
                />
              </div>
            );
          } else {
            return (
              <ImageCard
                onClick={() => onCardClick(item.id, "story")}
                key={item.id}
                id={item.id}
                image={item.img_url?.[0] ?? ""}
                title={item.title || "Untitled"}
                tags={item.tags ?? []}
                author={item.author || "Unknown"}
                duration={item.duration}
                date={date}
              />
            );
          }
        })}
      </section>
    </>
  );
};
