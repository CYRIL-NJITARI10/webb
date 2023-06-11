const mongoose = require("mongoose");
mongoose.model(
  "Student",
  new mongoose.Schema(
    {
      name: String,
      school: String,
    },
    {
      timestamps: true,
    }
  )
);
