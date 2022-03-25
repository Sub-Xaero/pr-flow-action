"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLabels = exports.removeAllLabels = exports.removeLabels = exports.labels = void 0;
// Get the labels to use from the inputs
const core = __importStar(require("@actions/core"));
exports.labels = {
    review: core.getInput("reviewLabel"),
    approved: core.getInput("approvedLabel"),
    changesRequested: core.getInput("changesRequestedLabel"),
    changedSinceLastReview: core.getInput("changedSinceLastReviewLabel"),
    inProgress: core.getInput("inProgressLabel"),
};
function removeLabels(action, labels) {
    action.removePRLabels(labels)
        .then(() => console.log(`Labels '${labels.join(', ')}' removed`))
        .catch(() => core.setFailed(`Failed to remove labels`));
}
exports.removeLabels = removeLabels;
function removeAllLabels(action) {
    removeLabels(action, [
        exports.labels.inProgress,
        exports.labels.review,
        exports.labels.approved,
        exports.labels.changesRequested,
        exports.labels.changedSinceLastReview,
    ]);
}
exports.removeAllLabels = removeAllLabels;
function addLabels(action, labels) {
    action.addPRLabels(labels)
        .then(() => console.log(`Labels '${labels.join(', ')}' added`))
        .catch(() => core.setFailed(`Failed to add labels`));
}
exports.addLabels = addLabels;
