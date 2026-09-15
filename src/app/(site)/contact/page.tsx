import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { readContactEmail } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact — Task2Stock",
  description: "Contact Task2Stock about the product, catalog, or your profile.",
};

export default function ContactPage() {
  const recipient = readContactEmail();

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-24 pt-10 md:pb-32 md:pt-16">
        <PageContainer>
          <div className="glass-panel mx-auto w-full max-w-[520px] px-6 py-10 md:px-10 md:py-12">
            <SectionHeading
              as="h1"
              align="center"
              eyebrow="Contact"
              title="Get in touch"
              description="Send a note about Task2Stock. This opens your email client with the message filled in."
            />
            <hr className="hairline my-8" />
            {recipient ? (
              <ContactForm recipient={recipient} />
            ) : (
              <p className="text-center text-sm leading-6 text-foreground/58">
                Contact email is not configured yet.
              </p>
            )}
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
