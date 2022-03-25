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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const prFlowAction_1 = require("./prFlowAction");
const pullRequest_1 = require("./scenarios/pullRequest");
const pullRequestReview_1 = require("./scenarios/pullRequestReview");
console.log(`Booting...`);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let action = new prFlowAction_1.PRFlowAction();
        let context = action.context;
        let contextEvent = context.eventName;
        let contextAction = context.payload.action;
        // console.log(`context: ${JSON.stringify(context)}`);
        console.log(`contextEvent: ${contextEvent}, contextAction: ${contextAction}`);
        switch (contextEvent) {
            case 'pull_request':
                yield (0, pullRequest_1.handlePullRequestEvent)(action);
                break;
            case "pull_request_review":
                yield (0, pullRequestReview_1.handlePullRequestReviewEvent)(action);
                break;
            default:
                console.log(`Unknown event: ${context.eventName}`);
                // core.setFailed(`Unsupported event: ${context.eventName}`);
                break;
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}))();
