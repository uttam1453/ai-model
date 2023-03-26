"use strict";

const mongoose = require("mongoose"),
	Schema = mongoose.Schema;

let employeeSchema = new Schema(
	{
		employeeName: { type: String, required: true },
		employeeId: { type: String },
		email: { type: String },
		emotions: { type: Array }
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model("Employee", employeeSchema);
