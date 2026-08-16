// lib/puck-config.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";

// Helper to render Lucide icons by name
const Icon = ({ name, size = 24, className = "" }) => {
  const LucideIcon = LucideIcons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} />;
};

export const config = {
  // --- ROOT (PAGE SETTINGS) ---
  root: {
    fields: {
      title: { type: "text" },
      description: { type: "textarea" },
      headerVisibility: {
        type: "radio",
        options: [
          { label: "Show", value: "show" },
          { label: "Hide", value: "hide" },
        ],
      },
      backgroundColor: { type: "text" },
    },
    defaultProps: {
      title: "Genesis Page",
      description: "Built with Genesis Page Builder",
      headerVisibility: "show",
      backgroundColor: "#ffffff",
    },
    render: ({ children, backgroundColor }) => (
      <div style={{ backgroundColor, minHeight: "100vh" }}>{children}</div>
    ),
  },

  categories: {
    Layout: {
      components: ["Section", "Columns", "Flex", "Space"],
    },
    Marketing: {
      components: ["Hero", "Logos", "Stats"],
    },
    Content: {
      components: [
        "FeatureGrid",
        "Card",
        "Heading",
        "Text",
        "Button",
        "Accordion",
      ],
    },
  },

  components: {
    // --- LAYOUT ---
    Section: {
      fields: {
        layout: {
          type: "object",
          objectFields: {
            padding: {
              type: "select",
              options: [
                { label: "0px", value: "py-0" },
                { label: "24px", value: "py-6" },
                { label: "48px", value: "py-12" },
                { label: "96px", value: "py-24" },
                { label: "128px", value: "py-32" },
              ],
            },
            backgroundColor: {
              type: "select",
              options: [
                { label: "White", value: "bg-white" },
                { label: "Gray", value: "bg-gray-50" },
                { label: "Brand Light", value: "bg-green-50" },
                { label: "Brand Dark", value: "bg-gray-900" },
              ],
            },
          },
        },
        image: {
          type: "object",
          objectFields: {
            url: { type: "text" },
            overlayOpacity: { type: "number" },
          },
        },
        className: { type: "text" },
      },
      defaultProps: {
        layout: { padding: "py-24", backgroundColor: "bg-white" },
        image: { url: "", overlayOpacity: 0 },
      },
      resolveData: ({ props }) => {
        if ((props.padding || props.backgroundColor) && !props.layout) {
          return {
            ...props,
            layout: {
              padding: props.padding || "py-24",
              backgroundColor: props.backgroundColor || "bg-white",
            },
          };
        }
        return props;
      },
      render: ({ layout, image, children, className }) => {
        const { padding = "py-24", backgroundColor = "bg-white" } = layout || {};
        const { url = "", overlayOpacity = 0 } = image || {};
        return (
          <section
            className={`${padding} ${backgroundColor} ${className || ""} relative overflow-hidden`}
            style={
              url
                ? {
                    backgroundImage: `url(${url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
          >
            {url && overlayOpacity > 0 && (
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: overlayOpacity / 100 }}
              />
            )}
            <div className="container mx-auto px-4 lg:px-6 relative z-10">
              {children}
            </div>
          </section>
        );
      },
    },
    Columns: {
      fields: {
        distribution: {
          type: "select",
          options: [
            { label: "1 Column", value: "grid-cols-1" },
            { label: "2 Columns", value: "md:grid-cols-2" },
            { label: "3 Columns", value: "md:grid-cols-3" },
            { label: "4 Columns", value: "md:grid-cols-4" },
          ],
        },
        gap: {
          type: "select",
          options: [
            { label: "Small", value: "gap-4" },
            { label: "Medium", value: "gap-8" },
            { label: "Large", value: "gap-12" },
          ],
        },
      },
      defaultProps: {
        distribution: "md:grid-cols-2",
        gap: "gap-12",
      },
      render: ({ distribution, gap, children }) => (
        <div className={`grid ${distribution} ${gap}`}>{children}</div>
      ),
    },
    Flex: {
      fields: {
        direction: {
          type: "radio",
          options: [
            { label: "Row", value: "flex-row" },
            { label: "Column", value: "flex-col" },
          ],
        },
        align: {
          type: "select",
          options: [
            { label: "Start", value: "items-start" },
            { label: "Center", value: "items-center" },
            { label: "End", value: "items-end" },
          ],
        },
        justify: {
          type: "select",
          options: [
            { label: "Start", value: "justify-start" },
            { label: "Center", value: "justify-center" },
            { label: "End", value: "justify-end" },
            { label: "Between", value: "justify-between" },
          ],
        },
        gap: { type: "number" },
      },
      defaultProps: {
        direction: "flex-row",
        align: "items-center",
        justify: "justify-start",
        gap: 24,
      },
      render: ({ direction, align, justify, gap, children }) => (
        <div
          className={`flex ${direction} ${align} ${justify}`}
          style={{ gap: `${gap}px` }}
        >
          {children}
        </div>
      ),
    },
    Space: {
      fields: {
        size: { type: "number" },
      },
      defaultProps: { size: 40 },
      render: ({ size }) => (
        <div style={{ height: `${size}px`, width: `${size}px` }} />
      ),
    },

    // --- MARKETING ---
    Hero: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        layout: {
          type: "object",
          objectFields: {
            textAlign: {
              type: "radio",
              options: [
                { label: "Left", value: "text-left" },
                { label: "Center", value: "text-center" },
                { label: "Right", value: "text-right" },
              ],
            },
            padding: {
              type: "select",
              options: [
                { label: "48px", value: "py-12" },
                { label: "96px", value: "py-24" },
                { label: "128px", value: "py-32" },
              ],
            },
          },
        },
        image: {
          type: "object",
          objectFields: {
            url: { type: "text" },
            mode: {
              type: "radio",
              options: [
                { label: "Inline", value: "inline" },
                { label: "Background", value: "bg" },
              ],
            },
            overlayOpacity: { type: "number" },
          },
        },
        buttons: {
          type: "array",
          getItemSummary: (item) => item.label || "Button",
          fields: {
            label: { type: "text" },
            link: { type: "text" },
            variant: {
              type: "select",
              options: [
                { label: "Primary", value: "default" },
                { label: "Secondary", value: "outline" },
              ],
            },
          },
        },
      },
      defaultProps: {
        title: "Innovate Your Future",
        description: "Join North India's premier startup ecosystem.",
        layout: { textAlign: "text-left", padding: "py-24" },
        image: { url: "", mode: "inline", overlayOpacity: 0 },
        buttons: [{ label: "Explore Programs", link: "#", variant: "default" }],
      },
      resolveData: ({ props }) => {
        // Migration: If we have old top-level props but no layout object, group them
        if ((props.textAlign || props.padding) && !props.layout) {
          return {
            ...props,
            layout: {
              textAlign: props.textAlign || "text-left",
              padding: props.padding || "py-24",
            },
            // If old image data exists, group it too
            image: !props.image
              ? {
                  url: props.imageUrl || "", // Handling older potential names
                  mode: "inline",
                  overlayOpacity: 0,
                }
              : props.image,
          };
        }
        return props;
      },
      render: ({ title, description, layout, image, buttons = [] }) => {
        const { textAlign = "text-left", padding = "py-24" } = layout || {};
        const { url = "", mode = "inline", overlayOpacity = 0 } = image || {};
        const isBg = url && mode === "bg";

        return (
          <div
            className={`${padding} ${isBg ? "relative overflow-hidden text-white" : ""} ${textAlign}`}
            style={
              isBg
                ? {
                    backgroundImage: `url(${url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
          >
            {isBg && overlayOpacity > 0 && (
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: overlayOpacity / 100 }}
              />
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div
                className={`space-y-6 flex-1 ${textAlign === "text-center" ? "mx-auto max-w-3xl" : textAlign === "text-right" ? "ml-auto max-w-3xl" : "max-w-3xl"}`}
              >
                <h1
                  className={`text-4xl lg:text-7xl font-bold leading-tight tracking-tight ${isBg ? "text-white" : "text-gray-900"}`}
                >
                  {(title || "").split(" ").map((word, i) => (
                    <span
                      key={i}
                      className={i % 2 !== 0 && !isBg ? "text-[#6CBD45]" : ""}
                    >
                      {word}{" "}
                    </span>
                  ))}
                </h1>
                <p
                  className={`text-xl leading-relaxed max-w-2xl ${isBg ? "text-white/90" : "text-gray-600"} ${textAlign === "text-center" ? "mx-auto" : ""}`}
                >
                  {description}
                </p>
                <div
                  className={`flex flex-wrap gap-4 ${textAlign === "text-center" ? "justify-center" : textAlign === "text-right" ? "justify-end" : "justify-start"}`}
                >
                  {buttons.map((btn, i) => (
                    <Button
                      key={i}
                      variant={btn.variant}
                      size="lg"
                      className={
                        btn.variant === "default"
                          ? "bg-[#6CBD45] hover:bg-[#5ba83a] text-white px-8 py-6 text-lg rounded-xl"
                          : "border-2 border-[#6CBD45] text-[#6CBD45] hover:bg-green-50 px-8 py-6 text-lg rounded-xl"
                      }
                    >
                      <a href={btn.link}>{btn.label}</a>
                    </Button>
                  ))}
                </div>
              </div>

              {url && mode === "inline" && (
                <div className="flex-1">
                  <img
                    src={url}
                    alt="Hero"
                    className="rounded-3xl shadow-2xl w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    Logos: {
      fields: {
        title: { type: "text" },
        items: {
          type: "array",
          getItemSummary: (item) => item.alt || "Logo",
          fields: {
            url: { type: "text" },
            alt: { type: "text" },
          },
        },
        layout: {
          type: "object",
          objectFields: {
            type: {
              type: "radio",
              options: [
                { label: "Grid", value: "grid" },
                { label: "Marquee", value: "marquee" },
              ],
            },
          },
        },
      },
      defaultProps: {
        title: "Trusted Partners",
        layout: { type: "grid" },
        items: [
          { url: "https://via.placeholder.com/150x50", alt: "Partner 1" },
          { url: "https://via.placeholder.com/150x50", alt: "Partner 2" },
        ],
      },
      resolveData: ({ props }) => {
        if (props.type && !props.layout) {
          return {
            ...props,
            layout: { type: props.type },
          };
        }
        return props;
      },
      render: ({ title, items = [], layout }) => {
        const { type = "grid" } = layout || {};
        return (
          <div className="space-y-10">
            {title && (
              <h3 className="text-center text-sm font-bold uppercase tracking-widest text-gray-400">
                {title}
              </h3>
            )}
            {type === "grid" ? (
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all text-slate-900">
                {items.map((item, i) => (
                  <img
                    key={i}
                    src={item.url}
                    alt={item.alt}
                    className="h-10 w-auto object-contain"
                  />
                ))}
              </div>
            ) : (
              <div className="relative overflow-hidden group py-4">
                <div className="flex gap-12 animate-marquee whitespace-nowrap px-4 w-max">
                  {[...items, ...items].map((item, i) => (
                    <img
                      key={i}
                      src={item.url}
                      alt={item.alt}
                      className="h-10 md:h-12 w-auto object-contain opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    Stats: {
      fields: {
        items: {
          type: "array",
          getItemSummary: (item) => `${item.value} ${item.label}`,
          fields: {
            value: { type: "text" },
            label: { type: "text" },
            description: { type: "text" },
          },
        },
      },
      defaultProps: {
        items: [
          {
            value: "50+",
            label: "Startups",
            description: "Successfully incubated",
          },
          {
            value: "₹10Cr+",
            label: "Funding",
            description: "Raised by founders",
          },
        ],
      },
      render: ({ items = [] }) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="text-4xl font-bold text-[#6CBD45]">
                {item.value}
              </div>
              <div className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                {item.label}
              </div>
              <div className="text-xs text-gray-500 max-w-[150px] mx-auto">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      ),
    },

    // --- CONTENT ---
    FeatureGrid: {
      fields: {
        columns: {
          type: "select",
          options: [
            { label: "2 Columns", value: "md:grid-cols-2" },
            { label: "3 Columns", value: "md:grid-cols-3" },
          ],
        },
        items: {
          type: "array",
          getItemSummary: (item) => item.title || "Feature",
          fields: {
            icon: { type: "text" },
            title: { type: "text" },
            description: { type: "textarea" },
          },
        },
      },
      defaultProps: {
        columns: "md:grid-cols-3",
        items: [
          {
            icon: "Zap",
            title: "Fast Tracking",
            description: "Accelerate your growth with expert mentors.",
          },
        ],
      },
      render: ({ columns, items = [] }) => (
        <div className={`grid ${columns} gap-8`}>
          {items.map((item, i) => (
            <div
              key={i}
              className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#6CBD45] mb-6">
                <Icon name={item.icon || "Rocket"} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    Card: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        icon: { type: "text" },
        variant: {
          type: "select",
          options: [
            { label: "White", value: "bg-white" },
            { label: "Dark", value: "bg-gray-900 text-white" },
            { label: "Green", value: "bg-[#6CBD45] text-white" },
          ],
        },
      },
      defaultProps: {
        title: "Card Title",
        description: "Card description goes here.",
        icon: "Shield",
        variant: "bg-white",
      },
      render: ({ title, description, icon, variant }) => (
        <div
          className={`p-8 rounded-3xl ${variant} border border-gray-100 shadow-sm`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${variant === "bg-white" ? "bg-green-50 text-[#6CBD45]" : "bg-white/20 text-white"}`}
          >
            <Icon name={icon} />
          </div>
          <h3 className="text-xl font-bold mb-3">{title}</h3>
          <p
            className={variant === "bg-white" ? "text-gray-600" : "text-white/80"}
          >
            {description}
          </p>
        </div>
      ),
    },
    Accordion: {
      fields: {
        items: {
          type: "array",
          getItemSummary: (item) => item.question || "FAQ Item",
          fields: {
            question: { type: "text" },
            answer: { type: "textarea" },
          },
        },
      },
      defaultProps: {
        items: [
          {
            question: "How to join?",
            answer: "Apply through our incubation portal.",
          },
        ],
      },
      render: ({ items = [] }) => (
        <div className="space-y-4 max-w-2xl mx-auto">
          {items.map((item, i) => (
            <details
              key={i}
              className="group bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden"
            >
              <summary className="p-6 cursor-pointer list-none flex justify-between items-center font-bold text-gray-900">
                {item.question}
                <span className="transition-transform group-open:rotate-180">
                  <Icon name="ChevronDown" size={18} />
                </span>
              </summary>
              <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      ),
    },
    Heading: {
      fields: {
        text: { type: "text" },
        level: {
          type: "select",
          options: [
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
          ],
        },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "text-left" },
            { label: "Center", value: "text-center" },
            { label: "Right", value: "text-right" },
          ],
        },
      },
      defaultProps: {
        text: "New Section",
        level: "h2",
        align: "text-left",
      },
      render: ({ text, level, align }) => {
        const Tag = level;
        const classes = {
          h2: "text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight",
          h3: "text-3xl font-bold text-gray-900 mb-3",
          h4: "text-2xl font-bold text-gray-900 mb-2",
        };
        return <Tag className={`${classes[level]} ${align}`}>{text}</Tag>;
      },
    },
    Text: {
      fields: {
        content: { type: "textarea" },
        color: {
          type: "select",
          options: [
            { label: "Dark", value: "text-gray-700" },
            { label: "Muted", value: "text-gray-500" },
          ],
        },
      },
      defaultProps: {
        content: "Enter your text here...",
        color: "text-gray-700",
      },
      render: ({ content, color }) => (
        <p className={`${color} leading-relaxed whitespace-pre-line text-lg`}>
          {content}
        </p>
      ),
    },
    Button: {
      fields: {
        label: { type: "text" },
        link: { type: "text" },
        variant: {
          type: "select",
          options: [
            { label: "Solid Green", value: "default" },
            { label: "Outline Green", value: "outline" },
            { label: "Dark", value: "secondary" },
          ],
        },
      },
      defaultProps: {
        label: "Click Me",
        link: "#",
        variant: "default",
      },
      render: ({ label, link, variant }) => (
        <Button
          variant={variant === "secondary" ? "default" : variant}
          className={
            variant === "default"
              ? "bg-[#6CBD45] hover:bg-[#5ba83a] text-white rounded-xl px-6"
              : variant === "secondary"
                ? "bg-gray-900 text-white rounded-xl px-6"
                : "border-[#6CBD45] text-[#6CBD45] hover:bg-green-50 rounded-xl px-6"
          }
          asChild
        >
          <a href={link}>{label}</a>
        </Button>
      ),
    },
  },
};
