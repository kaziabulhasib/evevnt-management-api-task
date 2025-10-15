const prisma = require("../config/db");

const createEvent = async (req, res) => {
  try {
    const { title, date, location, capacity } = req.body;

    if (!title || !date || !location || !capacity) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (capacity <= 0 || capacity > 1000) {
      return res
        .status(400)
        .json({ error: "Capacity must be between 1 and 1000" });
    }

    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        location,
        capacity,
      },
    });

    res
      .status(201)
      .json({ message: "Event created successfully", eventId: event.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createEvent,
};
