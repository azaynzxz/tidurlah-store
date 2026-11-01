import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  containerSelector?: string;
  title?: string;
}

export default function BlogTableOfContents({
  containerSelector = "#blog-article-content",
  title = "Daftar Isi"
}: BlogTableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const parseHeadings = () => {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      const elements = container.querySelectorAll("h2, h3");
      const items: TocItem[] = [];

      elements.forEach((el, index) => {
        let id = el.id;
        if (!id) {
          id = `section-${index}-${el.textContent?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || index}`;
          el.id = id;
        }

        const level = el.tagName.toLowerCase() === "h2" ? 2 : 3;
        const text = el.textContent?.trim() || "";

        if (text) {
          items.push({ id, text, level });
        }
      });

      setHeadings(items);
      if (items.length > 0) {
        setActiveId((prev) => prev || items[0].id);
      }
    };

    const timer = setTimeout(parseHeadings, 150);
    return () => clearTimeout(timer);
  }, [containerSelector]);

  useEffect(() => {
    const handleScroll = () => {
      if (headings.length === 0) return;

      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);

      let currentActive = headings[0].id;
      for (const el of headingElements) {
        const top = el.getBoundingClientRect().top;
        if (top <= 120) {
          currentActive = el.id;
        } else {
          break;
        }
      }
      setActiveId(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const navOffset = 80;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const offsetPosition = elementRect - bodyRect - navOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    setActiveId(id);
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 text-sm">
      <p className="text-xs font-semibold text-foreground tracking-tight">
        {title}
      </p>

      <nav aria-label="Table of contents">
        <ul className="space-y-1">
          {headings.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className={`block w-full text-left py-1 text-xs transition-colors truncate ${
                    item.level === 3 ? "pl-3 text-[11px]" : ""
                  } ${
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.text}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
