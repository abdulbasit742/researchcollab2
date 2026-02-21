import { Fragment } from "react";
import { HashtagLink } from "./HashtagLink";
import { Link } from "react-router-dom";

interface PostContentProps {
  content: string;
}

// Regex patterns
const HASHTAG_REGEX = /#(\w+)/g;
const MENTION_REGEX = /@(\w+)/g;
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

type ContentPart =
  | { type: "text"; value: string }
  | { type: "hashtag"; value: string }
  | { type: "mention"; value: string }
  | { type: "url"; value: string };

function parseContent(content: string): ContentPart[] {
  const combined = new RegExp(
    `(#\\w+)|(@\\w+)|(https?:\\/\\/[^\\s]+)`,
    "g"
  );

  const parts: ContentPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combined.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      parts.push({ type: "hashtag", value: match[1] });
    } else if (match[2]) {
      parts.push({ type: "mention", value: match[2] });
    } else if (match[3]) {
      parts.push({ type: "url", value: match[3] });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts;
}

export function PostContent({ content }: PostContentProps) {
  const parts = parseContent(content);

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">
      {parts.map((part, i) => {
        switch (part.type) {
          case "hashtag":
            return <HashtagLink key={i} tag={part.value} />;
          case "mention":
            return (
              <Link
                key={i}
                to={`/search?q=${encodeURIComponent(part.value)}`}
                className="text-primary hover:underline font-medium"
              >
                @{part.value}
              </Link>
            );
          case "url":
            return (
              <a
                key={i}
                href={part.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {part.value}
              </a>
            );
          default:
            return <Fragment key={i}>{part.value}</Fragment>;
        }
      })}
    </p>
  );
}
