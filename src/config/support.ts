// Support configuration - easily editable
export const supportConfig = {
  phoneNumber: "923181781454",
  avatarImage: "/src/assets/support-avatar.png",
  defaultMessage: "Assalam o Alaikum, I need support.",
};

export function buildWhatsAppUrl(
  fullName?: string | null,
  role?: string | null,
  currentPath?: string
): string {
  const lines = [supportConfig.defaultMessage];
  
  if (fullName) {
    lines.push(`Name: ${fullName}`);
  }
  if (role) {
    lines.push(`Role: ${role}`);
  }
  if (currentPath) {
    lines.push(`Page: ${currentPath}`);
  }

  const encodedMessage = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${supportConfig.phoneNumber}?text=${encodedMessage}`;
}
