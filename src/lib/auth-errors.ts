export function isEmailNotConfirmedError(message: string | undefined): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("email not confirmed") ||
    normalized.includes("email_not_confirmed")
  );
}

export function getAuthErrorMessage(message: string | undefined): string {
  if (!message) return "Something went wrong. Please try again.";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("email rate limit exceeded") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return "Too many confirmation emails were sent. Wait about an hour, or disable email confirmation in Supabase Auth settings while developing.";
  }

  if (normalized.includes("email address not authorized")) {
    return "Supabase’s built-in email only delivers to project team members. Add this address to the org team, or set up custom SMTP.";
  }

  return message;
}
