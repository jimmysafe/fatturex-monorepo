// import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

import { cn } from "@repo/ui/lib/utils";

import { container } from "@/lib/container";

import { Logo } from "./common/logo";

const sections = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Marketplace", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "#" },
      { name: "Sales", href: "#" },
      { name: "Advertise", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <section className="bg-primary pb-12 pt-32">
      <div className={cn(container)}>
        <footer>
          <div className="flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left">
            <div className="flex w-full max-w-96 shrink flex-col items-center justify-between gap-6 lg:items-start">
              <div>
                <span className="flex items-center justify-center gap-4 lg:justify-start">
                  <Logo white />
                </span>
                <p className="mt-6 text-sm text-primary-foreground">
                  la prima piattaforma che ti permette di gestire le tue fatture ed avere un calcolo preciso delle tasse da pagare.
                </p>
              </div>
              {/* <ul className="flex items-center space-x-6 text-muted-foreground">
                <li className="font-medium hover:text-primary">
                  <a href="#">
                    <FaInstagram className="size-6" />
                  </a>
                </li>
                <li className="font-medium hover:text-primary">
                  <a href="#">
                    <FaFacebook className="size-6" />
                  </a>
                </li>
                <li className="font-medium hover:text-primary">
                  <a href="#">
                    <FaTwitter className="size-6" />
                  </a>
                </li>
                <li className="font-medium hover:text-primary">
                  <a href="#">
                    <FaLinkedin className="size-6" />
                  </a>
                </li>
              </ul> */}
            </div>
            <div className="grid grid-cols-3 gap-6 lg:gap-20">
              {sections.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  <h3 className="mb-6 font-bold text-primary-foreground">{section.title}</h3>
                  <ul className="space-y-4 text-sm text-primary-foreground">
                    {section.links.map((link, linkIdx) => (
                      <li
                        key={linkIdx}
                        className="font-medium hover:text-primary"
                      >
                        <a href={link.href}>{link.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-20 flex flex-col justify-between gap-4 border-t pt-8 text-center text-sm font-medium text-primary-foreground lg:flex-row lg:items-center lg:text-left">
            <p>
              ©
              {new Date().getFullYear()}
              {" "}
              Fatturex.
            </p>
            <ul className="flex justify-center gap-4 lg:justify-start">
              <li className="hover:underline">
                <a href="#"> Termini e Condizioni</a>
              </li>
              <li className="hover:underline">
                <a href="#"> Privacy Policy</a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
}
