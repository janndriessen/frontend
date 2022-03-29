import { FC } from "react";
import {
  LinkableCashtag,
  LinkableHashtag,
  LinkableMention,
  Linkables,
  LinkableUrl,
} from "../../api/fam";
import { TwemojiBio } from "../Tooltip";
import Twemoji from "../Twemoji";

type Text = { type: "text"; text: string[] };
type Url = { type: "url"; linkable: LinkableUrl };
type Hashtag = { type: "hashtag"; linkable: LinkableHashtag };
type Cashtag = { type: "cashtag"; linkable: LinkableCashtag };
type Mention = { type: "mention"; linkable: LinkableMention };

type BioElement = Text | Url | Hashtag | Cashtag | Mention;

const getSortedLinkables = (linkables: Linkables) => {
  const urlLinkables =
    linkables.urls?.map((linkable) => ({
      ...linkable,
      type: "url" as const,
    })) ?? [];
  const mentionLinkables =
    linkables.mentions?.map((linkable) => ({
      ...linkable,
      type: "mention" as const,
    })) ?? [];
  const hashtagLinkables =
    linkables.hashtags?.map((linkable) => ({
      ...linkable,
      type: "hashtag" as const,
    })) ?? [];
  const cashtagLinkables =
    linkables.cashtags?.map((linkable) => ({
      ...linkable,
      type: "cashtag" as const,
    })) ?? [];
  return [
    ...urlLinkables,
    ...mentionLinkables,
    ...hashtagLinkables,
    ...cashtagLinkables,
  ].sort((l1, l2) => (l1.start < l2.start ? -1 : 1));
};

const buildBioElements = (bio: string, linkables: Linkables) => {
  // Linkable indices appear to assume a list of code points not UTF code units which JS uses by default.
  const bioCodePoints = Array.from(bio);

  const sortedLinkables = getSortedLinkables(linkables);

  const bioElements: BioElement[] = [];

  let lastEndIndex = 0;
  for (const linkable of sortedLinkables) {
    const text = bioCodePoints.slice(lastEndIndex, linkable.start);
    bioElements.push({ type: "text", text });
    bioElements.push({ type: linkable.type, linkable } as BioElement);
    lastEndIndex = linkable.end;
  }
  if (lastEndIndex !== bioCodePoints.length - 1) {
    bioElements.push({
      type: "text",
      text: bioCodePoints.slice(lastEndIndex ?? 0),
    });
  }

  return bioElements;
};

const BioWithLinks: FC<{ bio: string; linkables: Linkables }> = ({
  bio,
  linkables,
}) => (
  <>
    {buildBioElements(bio, linkables).map((instruction, index) =>
      instruction.type === "text" ? (
        <TwemojiBio>
          <p className="inline" key={index}>
            {instruction.text.join("")}
          </p>
        </TwemojiBio>
      ) : instruction.type === "url" ? (
        <TwemojiBio>
          <a
            className="text-blue-spindle hover:underline"
            href={instruction.linkable.expanded_url}
            key={index}
            rel="noreferrer"
            target="_blank"
          >
            {instruction.linkable.display_url}
          </a>
        </TwemojiBio>
      ) : instruction.type === "mention" ? (
        <TwemojiBio>
          <a
            className="text-blue-spindle hover:underline"
            href={`https://twitter.com/${instruction.linkable.username}`}
            key={index}
            rel="noreferrer"
            target="_blank"
          >
            @{instruction.linkable.username}
          </a>
        </TwemojiBio>
      ) : instruction.type === "hashtag" ? (
        <TwemojiBio>
          <a
            className="text-blue-spindle hover:underline"
            href={`https://twitter.com/hashtag/${instruction.linkable.tag}`}
            key={index}
            rel="noreferrer"
            target="_blank"
          >
            #{instruction.linkable.tag}
          </a>
        </TwemojiBio>
      ) : instruction.type === "cashtag" ? (
        <TwemojiBio>
          <a
            className="text-blue-spindle hover:underline"
            href={`https://twitter.com/search?q=%24${instruction.linkable.tag}`}
            key={index}
            rel="noreferrer"
            target="_blank"
          >
            ${instruction.linkable.tag}
          </a>
        </TwemojiBio>
      ) : null,
    )}
  </>
);

export default BioWithLinks;
