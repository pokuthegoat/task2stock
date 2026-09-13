import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { readContactEmail } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact — Task2Stock",
  description: "Contact Task2Stock about the product, catalog, or your account.",
};

export default function ContactPage() {
  const recipient = readContactEmail();

  return (
    <main id="main" className="section-base flex-1">
      <section className="pt-16 pb-24 md:pt-24 md:pb-32">
        <PageContainer>
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title="Get in touch"
            description="Send a note about Task2Stock. This opens your email client with the message filled in."
          />
          <div className="mt-12 max-w-[440px]">
            {recipient ? (
              <ContactForm recipient={recipient} />
            ) : (
              <p className="text-sm leading-6 text-foreground/58">
                Contact email is not configured yet.
              </p>
            )}
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
