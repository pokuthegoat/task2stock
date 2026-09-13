"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buildContactMailto,
  hasContactFieldErrors,
  validateContactForm,
  type ContactFieldErrors,
} from "@/lib/contact";

export function ContactForm({ recipient }: { recipient: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactFieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateContactForm({ name, email, message });
    setErrors(nextErrors);

    if (hasContactFieldErrors(nextErrors)) {
      return;
    }

    window.location.assign(
      buildContactMailto({
        recipient,
        name,
        email,
        message,
      }),
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <Input
        id="contact-name"
        name="name"
        label="Name"
        autoComplete="name"
        value={name}
        onChange={setName}
        error={errors.name}
      />
      <Input
        id="contact-email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
      />
      <Textarea
        id="contact-message"
        name="message"
        label="Message"
        value={message}
        onChange={setMessage}
        error={errors.message}
        placeholder="What would you like to talk about?"
      />
      <Button type="submit" className="w-full">
        Send email
      </Button>
    </form>
  );
}
