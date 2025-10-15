const prisma = require("../config/db");
const { get } = require("../routes/event.routes");

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

const getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        registrations: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const registerEvent = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

   
    if (!eventId || !userId) {
      return res.status(400).json({ error: "eventId and userId are required" });
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: { registrations: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }


    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ error: "Cannot register for past events" });
    }

    
    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ error: "Event is full" });
    }

    const alreadyRegistered = event.registrations.some(
      (user) => user.id === parseInt(userId)
    );
    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ error: "User already registered for this event" });
    }

    await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: {
        registrations: {
          connect: { id: parseInt(userId) },
        },
      },
    });

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createEvent,
  getEvent,
  registerEvent,
};
