import axios from "axios";
import * as cors from "cors";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as fs from "fs";
import OpenAI from "openai";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
interface Segment {
  text: string;
  start: number;
  end: number;
}

interface TranscriptionResponse {
  language: string;
  text: string;
  segments: Segment[];
}
admin.initializeApp();
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

const corsHandler = cors({ origin: true });

exports.transcribeAudio = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { audioUrl, storyId, author } = req.body;
      console.log(`Received request to transcribe audio: ${audioUrl} for storyId: ${storyId}`);

      if (!audioUrl) {
        throw new Error("audioUrl is missing");
      }

      // Download audio file from the provided audio URL
      const audioFilePath = path.join("/tmp", `${uuidv4()}.mp3`); // Save the file temporarily
      const response = await axios({
        url: audioUrl,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(audioFilePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Now, pass the downloaded file to OpenAI's transcription API
      const transcriptionResponse = (await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath), // Send the file stream
        model: "whisper-1",
        response_format: "verbose_json", // Use JSON to get word-level timestamps
        timestamp_granularities: ["segment"],
      })) as TranscriptionResponse;

      console.log(`Received transcription response: ${JSON.stringify(transcriptionResponse)}`);

      const transcription = transcriptionResponse.text;
      const segments = transcriptionResponse.segments.map((segment) => ({
        text: segment.text,
        start: segment.start,
        end: segment.end,
      }));
      const language = transcriptionResponse.language;
      const storyRef = admin.firestore().collection("stories").doc(storyId);
      await storyRef.update({ transcription, segments, status: "Done", language });
      console.log(`Updated Firestore document for storyId: ${storyId} with transcription`);

      // Add a new notification to the notifications collection
      const notificationRef = admin.firestore().collection("notifications").doc();
      await notificationRef.set({
        story_id: storyId,
        recipient: author,
        title: "Your story has been uploaded! Transcription complete",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        status: "unread",
        link: `/story/${storyId}`,
      });
      console.log(`Added notification for storyId: ${storyId}`);

      // Clean up the temporary file after processing
      fs.unlinkSync(audioFilePath);

      res.status(200).send({ success: true });
    } catch (error) {
      console.error("Error during transcription:", error);
      res.status(500).send({ error: "Transcription failed" });
    }
  });
});
