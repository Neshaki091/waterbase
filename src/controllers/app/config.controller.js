// routes/config.route.js
const express = require("express");
const router = express.Router();
const AppModel = require("../../models/app.model");

// GET /apps/config/:appId
router.get("/config/:appId", async (req, res) => {
  try {
    const { appId } = req.params;

    // tìm app trong MongoDB
    const app = await AppModel.findOne({ appId });
    if (!app) {
      return res.status(404).json({ message: "App not found" });
    }

    // JSON trả về
    const config = {
      project_info: {
        app_id: app.appId,
        name: app.name,
        created_at: app.createdAt,
      },
      client: {
        base_url: process.env.BASE_URL || "http://localhost:3000",
        api_version: "v1",
      },
      services: {
        auth: {
          register: "/auth/register",
          login: "/auth/login",
          refresh: "/auth/refresh",
        },
        database: {
          create: "/database/create",
          fetch: "/database/fetch",
          update: "/database/update",
          remove: "/database/remove",
        },
      },
    };

    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
