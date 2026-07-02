import emailjs from "@emailjs/browser";

export const sendOTPEmail = async (
  email: string,
  otp: string
) => {
  return emailjs.send(
    "service_f7sffwk",
    "template_tvmbjla",
    {
      to_email: email,
      otp: otp,
    },
    "SppeA_W9yNO3qBiDc"
  );
};