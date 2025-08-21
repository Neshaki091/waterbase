const { VM } = require("vm2");
const Rule = require("../models/rule.model");

module.exports = async function(req, res, next) {
  try {
    const appId = req.headers["x-app-id"];
    const user = req.user;         // từ JWT
    const resource = req.body;     // document / data enduser gửi
    const collection = req.headers["x-collection-name"];
    const action = req.method.toLowerCase(); // get/post/put/delete

    const actionMap = { get:"read", post:"create", put:"update", delete:"delete" };
    const actionName = actionMap[action];

    if (!actionName) return res.status(400).json({ message: "Invalid action" });

    const rule = await Rule.findOne({ appId });
    if (!rule) return res.status(403).json({ message: "No rule defined" });

    const vm = new VM({
      timeout: 1000,
      sandbox: { user, resource, collection, action: actionName }
    });

    const code = `(function() { ${rule.code} })()`;
    const allowed = vm.run(code);

    if (!allowed) return res.status(403).json({ message: "Permission denied by rule" });

    next();
  } catch (err) {
    console.error("Rule engine error:", err);
    res.status(500).json({ message: "Rule check failed" });
  }
};
