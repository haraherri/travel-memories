export const validateInput = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = emailRegex.test(value);

  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  const isUsername = usernameRegex.test(value);

  return {
    isValid: isEmail || isUsername,
    type: isEmail ? "email" : "username",
  };
};
export const getInitials = (name) => {
  if (!name) return "";

  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }
  return initials.toUpperCase();
};
