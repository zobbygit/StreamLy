const ContactMessage =require("../models/ContactMessage.js");

const createContactMessage = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const contactMessage = await ContactMessage.create({
      email: normalizedEmail,
    });

    return res.status(201).json({
      message: "Contact request submitted successfully.",
      contactMessage,
    });
  } catch (error) {
    console.error("Contact message error:", error);

    return res.status(500).json({
      message: "Could not submit your contact request.",
    });
  }
};

module.exports={createContactMessage}