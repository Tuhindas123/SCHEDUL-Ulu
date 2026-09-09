// Guesses a role from an email address so the admin doesn't have to
// pick it manually every time. It's a SUGGESTION only — the admin UI
// always shows the guess with a dropdown to override it before saving.
//
// EDIT THESE RULES to match your actual university email formats —
// this is a best-guess starting point based on what you described
// (e.g. student roll-number style: bam25058@tezu.ac.in).

const RULES = [
  {
    role: "student",
    // 2-4 letters (program code) + 2-digit year + 3-5 digit roll number
    // e.g. bam25058, mba24016
    test: (local) => /^[a-z]{2,4}\d{2}\d{3,5}$/i.test(local),
  },
  {
    role: "teacher",
    // firstname.lastname style, no digits — common faculty convention
    test: (local) => /^[a-z]+\.[a-z]+$/i.test(local) && !/\d/.test(local),
  },
];

export function classifyEmail(email) {
  const local = (email.split("@")[0] || "").trim();
  if (!local) return { role: null, reason: "Enter a full email first." };

  for (const rule of RULES) {
    if (rule.test(local)) {
      return { role: rule.role, reason: `Matched the "${rule.role}" pattern.` };
    }
  }
  return { role: null, reason: "No pattern matched — pick a role manually." };
}