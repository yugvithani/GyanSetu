const Session = require("../models/Session");

// POST /session/create
exports.createSession = async (req, res) => {
  try {
    const { meetingId, isLive, host, group, startTime } = req.body;
    if (!meetingId || typeof isLive === "undefined" || !host || !group) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Check if a session already exists for this meetingId.
    const existingSession = await Session.findOne({ meetingId });
    if (existingSession) {
      return res.status(200).json(existingSession);
    }
    
    const newSession = new Session({
      meetingId,
      isLive,
      host,
      group,
      startTime: startTime || new Date(),
      participants: [],
    });

    const savedSession = await newSession.save();
    res.json(savedSession);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSessionByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const sessions = await Session.find({ group: groupId })
      .populate("host", "name email") // Populate host details
      .populate("participants", "name email") // Populate participant details
      .sort({ startTime: -1 }); // Sort by start time, latest first
    
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: error.message });
  }
}

exports.deleteSession = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Find the session using the meetingId and delete it.
    const session = await Session.findOneAndDelete({ meetingId: meetingId });
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    res.json({ message: "Session deleted successfully", session });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: error.message });
  }
}
