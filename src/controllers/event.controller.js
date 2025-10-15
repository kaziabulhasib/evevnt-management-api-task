
const prisma = require("../config/db");


const createEvent = async (req, res) => {
  try {
    const { title, date, location, capacity } = req.body;

    if (
      !title ||
      !date ||
      !location ||
      capacity === undefined ||
      capacity === null
    ) {
      return res
        .status(400)
        .json({ error: "title, date, location and capacity are required" });
    }

    const capacityInt = Number(capacity);
    if (!Number.isInteger(capacityInt) || capacityInt <= 0 || capacityInt > 1000) {
      return res
        .status(400)
        .json({ error: "capacity must be an integer between 1 and 1000" });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "date must be a valid ISO date string" });
    }

    const event = await prisma.event.create({
      data: {
        title: String(title).trim(),
        date: parsedDate,
        location: String(location).trim(),
        capacity: capacityInt,
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
    const eId = Number(eventId);
    const uId = Number(userId);

    if (!Number.isInteger(eId) || !Number.isInteger(uId)) {
      return res.status(400).json({ error: "eventId and userId must be integers" });
    }

   
    await prisma.$transaction(async (tx) => {
      
      const rows = await tx.$queryRaw`SELECT id, date, capacity FROM "Event" WHERE id = ${eId} FOR UPDATE`;
      if (!rows || rows.length === 0) {
        const err = new Error("Event not found");
        err.status = 404;
        throw err;
      }
      const eventRow = rows[0];

      // check past event
      const eventDate = new Date(eventRow.date);
      if (eventDate < new Date()) {
        const err = new Error("Cannot register for past events");
        err.status = 400;
        throw err;
      }

      // count current registrations 
      const countRes = await tx.$queryRaw`SELECT count(*)::int AS cnt FROM "_UserRegistrations" WHERE "A" = ${eId}`;
      const currentCount = Number(countRes?.[0]?.cnt ?? 0);

      if (currentCount >= Number(eventRow.capacity)) {
        const err = new Error("Event is full");
        err.status = 400;
        throw err;
      }

      // check duplicate registrattion
      const dup = await tx.$queryRaw`SELECT 1 FROM "_UserRegistrations" WHERE "A" = ${eId} AND "B" = ${uId} LIMIT 1`;
      if (dup && dup.length > 0) {
        const err = new Error("User already registered for this event");
        err.status = 400;
        throw err;
      }

      // connect user to event
      await tx.event.update({
        where: { id: eId },
        data: {
          registrations: {
            connect: { id: uId },
          },
        },
      });
    });

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    if (error && error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const cancelRegistration = async (req, res) => {
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

    const isRegistered = event.registrations.some(
      (user) => user.id === parseInt(userId)
    );

    if (!isRegistered) {
      return res
        .status(400)
        .json({ error: "User is not registered for this event" });
    }

    await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: {
        registrations: {
          disconnect: { id: parseInt(userId) },
        },
      },
    });

    return res
      .status(200)
      .json({ message: "Registration cancelled successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        date: {
          gt: now, // upcoming evnts only 
        },
      },
      include: {
        registrations: true,
      },
    });

    const sortedEvents = events.sort((a, b) => {
      const dateComparison = new Date(a.date) - new Date(b.date);
      if (dateComparison !== 0) return dateComparison;
      return a.location.localeCompare(b.location);
    });

    return res.status(200).json(sortedEvents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getEventStats = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const totalRegistrations = event.registrations.length;
    const remainingCapacity = event.capacity - totalRegistrations;
    const capacityUsedPercentage = (
      (totalRegistrations / event.capacity) *
      100
    ).toFixed(2);

    res.json({
      eventId: event.id,
      title: event.title,
      totalRegistrations,
      remainingCapacity,
      capacityUsedPercentage: `${capacityUsedPercentage}%`,
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createEvent,
  getEvent,
  registerEvent,
  cancelRegistration,
  getUpcomingEvents,
  getEventStats,
};
